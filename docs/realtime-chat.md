# 실시간 채팅 기술 문서

## 1. 아키텍처 개요

```
┌─────────────────────────────────────────────────┐
│  브라우저 (클라이언트)                              │
│  ┌──────────────┐    ┌────────────────────────┐  │
│  │ Server Action │    │ Supabase Realtime      │  │
│  │ (메시지 전송)  │    │ (WebSocket 구독)        │  │
│  │ service_role  │    │ anon key               │  │
│  └──────┬───────┘    └───────────┬────────────┘  │
└─────────┼────────────────────────┼───────────────┘
          │ HTTPS                  │ WebSocket (wss://)
          ▼                        ▼
┌─────────────────────────────────────────────────┐
│  Supabase                                        │
│  ┌──────────────┐    ┌────────────────────────┐  │
│  │  PostgreSQL   │───▶│  Realtime Server       │  │
│  │  (messages)   │WAL │  (변경사항 감지 → 전파)   │  │
│  └──────────────┘    └────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### 핵심 원리

PostgreSQL의 **WAL(Write-Ahead Log)**을 Supabase Realtime 서버가 감시한다.
`messages` 테이블에 INSERT가 발생하면, 해당 테이블을 구독 중인 모든 클라이언트에게
WebSocket으로 변경 데이터를 전파한다.

### Supabase 클라이언트 2개

| 파일 | 키 | 용도 |
|---|---|---|
| `src/lib/supabase/server.ts` | `service_role` | 서버 액션에서 DB 읽기/쓰기 (RLS 무시) |
| `src/lib/supabase/client.ts` | `anon` (NEXT_PUBLIC) | 브라우저에서 Realtime 구독 |

---

## 2. DB 설정

### 마이그레이션: `supabase/migrations/00015_enable_realtime_rls.sql`

```sql
-- RLS 활성화 (anon key의 접근 범위 제어)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- anon 키로 SELECT 허용 → Realtime 구독이 데이터를 받을 수 있음
CREATE POLICY "anon_read_messages" ON public.messages
  FOR SELECT TO anon USING (true);

-- service_role은 모든 작업 가능 → 서버 액션이 정상 동작
CREATE POLICY "service_role_all_messages" ON public.messages
  FOR ALL TO service_role USING (true) WITH CHECK (true);
```

**왜 RLS가 필요한가?**

Supabase Realtime은 구독하는 클라이언트의 권한(role)으로 RLS 정책을 평가한다.
anon key 클라이언트가 SELECT 권한이 없으면 Realtime 이벤트를 받을 수 없다.

### Realtime Publication

`messages` 테이블은 `supabase_realtime` publication에 포함되어 있어야 한다.
(Supabase 프로젝트 생성 시 기본 포함되어 있었음)

```sql
-- 수동으로 추가해야 할 경우:
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
```

### 읽음 추적: `supabase/migrations/00016_chat_read_tracking.sql`

```sql
ALTER TABLE public.chat_rooms ADD COLUMN buyer_last_read_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.chat_rooms ADD COLUMN seller_last_read_at TIMESTAMPTZ DEFAULT now();
```

---

## 3. 실시간 기능 3가지

### A. 메시지 실시간 수신 — `postgres_changes`

**파일**: `src/app/(app)/chat/[id]/chat-view.tsx`

```
사용자A 메시지 전송
  → Server Action (sendMessage)
    → PostgreSQL INSERT → WAL 기록
      → Supabase Realtime 서버가 WAL 감지
        → chat_room_id 필터 매칭하는 구독자에게 WebSocket 전송
          → 사용자B 브라우저에서 콜백 실행 → setMessages → UI 갱신
```

```typescript
supabase
  .channel(`chat:${chatRoomId}`)
  .on('postgres_changes', {
    event: 'INSERT',                              // INSERT만 감지
    schema: 'public',
    table: 'messages',
    filter: `chat_room_id=eq.${chatRoomId}`,      // 이 채팅방만
  }, (payload) => {
    const newMsg = payload.new;                    // 삽입된 row 전체
    setMessages(prev => [...prev, newMsg]);
  })
  .subscribe();
```

**Optimistic Update 처리**:
- 내가 보낸 메시지는 서버 응답 전에 `temp-*` id로 즉시 화면에 표시
- Realtime 이벤트 도착 시 임시 메시지를 실제 메시지(DB id)로 교체
- 동일 content 매칭으로 교체 대상을 찾음

```typescript
// Realtime 콜백 내부
if (newMsg.sender_id === currentUserId && !newMsg.is_system) {
  // temp-* 메시지 중 같은 content를 가진 것을 제거
  const withoutOptimistic = prev.filter(
    m => !(m.id.startsWith('temp-') && m.content === newMsg.content)
  );
  return [...withoutOptimistic, newMsg];
}
```

### B. 타이핑 인디케이터 — `broadcast`

**파일**: `src/app/(app)/chat/[id]/chat-view.tsx`

```
사용자A 입력 중
  → channel.send({ type: 'broadcast', event: 'typing' })
    → Supabase Realtime 서버 (DB 저장 없이 메모리에서 전파)
      → 같은 채널 구독 중인 사용자B에게 전달
        → "입력 중..." 표시 (3초 후 자동 사라짐)
```

`broadcast`는 `postgres_changes`와 달리 **DB를 거치지 않는다**.
Supabase 서버 메모리에서 같은 채널의 다른 클라이언트에게 직접 전달하므로
더 빠르고 가볍다.

```typescript
// 전송 (2초 쓰로틀)
channelRef.current?.send({
  type: 'broadcast',
  event: 'typing',
  payload: { userId: currentUserId },
});

// 수신
.on('broadcast', { event: 'typing' }, ({ payload }) => {
  if (payload.userId !== currentUserId) {
    setOtherTyping(true);
    setTimeout(() => setOtherTyping(false), 3000);
  }
})
```

**UI 표현**:
- 헤더: 닉네임 아래 "입력 중..." (초록색 + pulse 애니메이션)
- 메시지 영역 하단: 바운스 점 3개 (●●●) 말풍선

### C. 채팅 리스트 실시간 갱신 — `postgres_changes` (필터 없음)

**파일**: `src/app/(app)/chat/chat-room-list.tsx`

```typescript
supabase
  .channel('chat-list')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    // filter 없음 → 모든 메시지 수신
  }, (payload) => {
    const msg = payload.new;
    if (!roomIds.has(msg.chat_room_id)) return;  // 내 채팅방만 처리
    // 마지막 메시지 갱신 + 안읽은 수 +1 + 재정렬
  })
```

채팅방별 필터 대신 **모든 INSERT 구독 → 클라이언트에서 필터링**.
채팅방이 여러 개일 때 채널 하나로 처리할 수 있어 효율적이다.

---

## 4. 읽음 추적 흐름

### 데이터 구조

```
chat_rooms 테이블
┌──────────────────────────────────────────────┐
│ buyer_last_read_at    │ seller_last_read_at   │
│ 2026-02-25 14:30:00   │ 2026-02-25 14:25:00  │
└──────────────────────────────────────────────┘

안읽은 수 = SELECT count(*) FROM messages
  WHERE chat_room_id = ?
    AND sender_id ≠ 나
    AND created_at > 나의_last_read_at
```

### 업데이트 시점

| 시점 | 동작 | 파일 |
|---|---|---|
| 채팅방 진입 | `last_read_at = now()` | `src/actions/chats.ts` → `getChatRoom()` |
| 메시지 전송 | 보낸 사람의 `last_read_at = now()` + `updated_at = now()` | `src/actions/chats.ts` → `sendMessage()` |
| 실시간 수신 중 | 상대 메시지 도착 시 `markChatAsRead()` 호출 | `src/app/(app)/chat/[id]/chat-view.tsx` |

### 리스트에서의 표현

- 안읽은 수 > 0: 아바타에 **빨간 배지** (숫자), 닉네임 **볼드**, 메시지 텍스트 **진하게**
- 안읽은 채팅방이 **리스트 상단에** 정렬 (그 안에서는 updated_at 순)

---

## 5. 채널 구조 요약

| 채널 이름 | 위치 | 이벤트 타입 | 용도 |
|---|---|---|---|
| `chat:{roomId}` | chat-view.tsx | `postgres_changes` (INSERT, filtered) | 메시지 실시간 수신 |
| `chat:{roomId}` | chat-view.tsx | `broadcast` (typing) | 타이핑 인디케이터 |
| `chat-list` | chat-room-list.tsx | `postgres_changes` (INSERT, no filter) | 리스트 갱신 + 안읽은 수 |

컴포넌트 언마운트 시 `supabase.removeChannel(channel)`로 구독을 해제하여 메모리 누수를 방지한다.

---

## 6. 관련 파일 목록

| 파일 | 역할 |
|---|---|
| `src/lib/supabase/client.ts` | 브라우저용 Supabase 클라이언트 (anon key) |
| `src/lib/supabase/server.ts` | 서버용 Supabase 클라이언트 (service_role key) |
| `src/actions/chats.ts` | 채팅 서버 액션 (getChatRoom, getChatMessages, sendMessage, markChatAsRead) |
| `src/app/(app)/chat/page.tsx` | 채팅 리스트 서버 페이지 (초기 데이터 fetch) |
| `src/app/(app)/chat/chat-room-list.tsx` | 채팅 리스트 클라이언트 (Realtime 구독) |
| `src/app/(app)/chat/[id]/page.tsx` | 채팅방 서버 페이지 (초기 데이터 fetch) |
| `src/app/(app)/chat/[id]/chat-view.tsx` | 채팅방 클라이언트 (Realtime 구독 + 타이핑) |
| `supabase/migrations/00015_enable_realtime_rls.sql` | RLS 정책 |
| `supabase/migrations/00016_chat_read_tracking.sql` | 읽음 추적 컬럼 |
