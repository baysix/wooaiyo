# 우아이요 기술 스택 가이드 (초보자용)

## 목차
1. [전체 구조 한눈에 보기](#1-전체-구조-한눈에-보기)
2. [사용하는 기술들](#2-사용하는-기술들)
3. [서버 컴포넌트 vs 클라이언트 컴포넌트](#3-서버-컴포넌트-vs-클라이언트-컴포넌트)
4. [Server Actions (서버 액션)](#4-server-actions-서버-액션)
5. [데이터 흐름 완전 정리](#5-데이터-흐름-완전-정리)
6. [인증 (로그인) 구조](#6-인증-로그인-구조)
7. [Supabase를 쓰는 방식](#7-supabase를-쓰는-방식)
8. [실시간 채팅의 원리](#8-실시간-채팅의-원리)
9. [폴더 구조 설명](#9-폴더-구조-설명)
10. [파일별 서버/클라이언트 분류표](#10-파일별-서버클라이언트-분류표)
11. [자주 하는 실수와 해결법](#11-자주-하는-실수와-해결법)

---

## 1. 전체 구조 한눈에 보기

```
사용자의 브라우저 (또는 앱)
     │
     │  ① 페이지 요청 (URL 접속)
     ▼
┌─────────────────────────────────────────┐
│  Next.js 서버                            │
│                                         │
│  ┌─────────────┐   ┌─────────────────┐  │
│  │ 미들웨어     │──▶│ 서버 컴포넌트    │  │
│  │ (로그인체크) │   │ (페이지 렌더링)  │  │
│  └─────────────┘   └───────┬─────────┘  │
│                            │            │
│                    ② DB에서 데이터 조회   │
│                            │            │
│                            ▼            │
│                    ┌──────────────┐     │
│                    │ Server Action │     │
│                    │ (데이터 처리)  │     │
│                    └──────┬───────┘     │
└───────────────────────────┼─────────────┘
                            │
                    ③ Supabase에 요청
                            │
                            ▼
                    ┌──────────────┐
                    │  Supabase    │
                    │  PostgreSQL  │
                    │  (데이터베이스)│
                    └──────────────┘
```

**한 줄 요약**: 사용자가 페이지에 접속하면, Next.js 서버가 DB에서 데이터를 가져와서 완성된 HTML을 보내준다.

---

## 2. 사용하는 기술들

### Next.js 16 — 웹 프레임워크
```json
// package.json
"next": "16.1.6"
```

**역할**: 우리 앱의 뼈대. 페이지 라우팅, 서버/클라이언트 렌더링을 모두 처리한다.

**비유**: 건물의 철근 콘크리트 구조. 모든 것이 이 위에 올라간다.

### React 19 — UI 라이브러리
```json
"react": "19.2.3"
```

**역할**: 화면에 보이는 모든 UI를 만든다. 버튼, 입력창, 리스트 등.

### TypeScript — 타입이 있는 JavaScript
```json
"typescript": "^5"
```

**역할**: JavaScript에 타입을 추가해서 실수를 미리 잡아준다.
```typescript
// 일반 JavaScript - 실행해봐야 에러를 알 수 있음
function getUser(id) { ... }
getUser(123)    // 숫자를 넣어도 에러가 안 남
getUser("abc")  // 문자를 넣어도 에러가 안 남

// TypeScript - 코드 작성 시점에 에러를 알려줌
function getUser(id: string) { ... }
getUser(123)    // ❌ 빨간줄! 숫자는 안 됨
getUser("abc")  // ✅ OK
```

### Tailwind CSS v4 — 스타일링
```json
"tailwindcss": "^4"
```

**역할**: CSS를 클래스 이름으로 직접 작성한다.
```html
<!-- 기존 CSS 방식 -->
<div style="display: flex; padding: 16px; background: white;">

<!-- Tailwind 방식 (같은 결과) -->
<div className="flex px-4 bg-white">
```

### Supabase — 데이터베이스 + 실시간 기능
```json
"@supabase/supabase-js": "^2.97.0"
```

**역할**: PostgreSQL 데이터베이스 + 파일 저장소 + 실시간 WebSocket.
우리 프로젝트에서는 **DB와 스토리지만** 사용하고, 인증은 자체 JWT를 쓴다.

### jose + bcryptjs — 인증
```json
"jose": "^6.1.3",        // JWT 토큰 생성/검증
"bcryptjs": "^3.0.3"     // 비밀번호 암호화
```

---

## 3. 서버 컴포넌트 vs 클라이언트 컴포넌트

이 프로젝트에서 **가장 중요한 개념**이다. Next.js의 모든 컴포넌트는 둘 중 하나다.

### 서버 컴포넌트 (기본값)

파일 맨 위에 `'use client'`가 **없으면** 서버 컴포넌트다.

```
┌──────────────────────────────────────────┐
│ 서버 컴포넌트는 서버에서만 실행된다        │
│                                          │
│ 사용자 브라우저에 JavaScript가 안 간다     │
│ → 페이지가 가볍고 빠르다                   │
└──────────────────────────────────────────┘
```

**실제 예시 — 홈 페이지** (`src/app/(app)/home/page.tsx`):
```tsx
// 'use client' 가 없음 → 서버 컴포넌트!

import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';

export default async function HomePage() {
  // ✅ 서버에서 직접 DB 조회 (비밀키 사용 가능)
  const auth = await requireAuth();
  const supabase = createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('apartment_id, apartments(name)')
    .eq('id', auth.userId)
    .single();

  // ✅ 서버에서 데이터를 다 가져온 후 HTML로 만들어서 보냄
  return (
    <div>
      <h1>{apartmentName}</h1>
      ...
    </div>
  );
}
```

**서버 컴포넌트에서 할 수 있는 것**:
| 할 수 있는 것 | 예시 |
|---|---|
| `async/await` 직접 사용 | `const data = await supabase.from('posts').select()` |
| 비밀키 접근 | `process.env.SUPABASE_SERVICE_ROLE_KEY` |
| DB 직접 조회 | `createClient()` (service_role 키) |
| 쿠키 읽기 | `cookies()` |
| 파일 시스템 접근 | `fs.readFile()` |
| 무거운 라이브러리 사용 | 번들 크기에 영향 없음 |

**서버 컴포넌트에서 할 수 없는 것**:
| 할 수 없는 것 | 이유 |
|---|---|
| `useState`, `useEffect` | 브라우저에서 안 돌아가니까 상태 관리 불가 |
| `onClick`, `onChange` | 사용자 이벤트는 브라우저에서 발생 |
| `window`, `document` | 서버에는 브라우저 객체가 없음 |
| `useRouter()` | 클라이언트 내비게이션은 브라우저 기능 |

### 클라이언트 컴포넌트

파일 맨 위에 `'use client'`를 **반드시 써야** 한다.

```
┌──────────────────────────────────────────┐
│ 클라이언트 컴포넌트는 브라우저에서 실행된다 │
│                                          │
│ 사용자와의 상호작용(클릭, 입력)을 처리한다  │
│ → JavaScript가 브라우저로 전송된다         │
└──────────────────────────────────────────┘
```

**실제 예시 — 글쓰기 페이지** (`src/app/(app)/post/new/page.tsx`):
```tsx
'use client';  // ← 이 한 줄이 핵심!

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewPostPage() {
  // ✅ 상태 관리 가능
  const [type, setType] = useState('sale');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ 사용자 이벤트 처리 가능
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    // ...
  }

  // ✅ 브라우저 API 사용 가능
  const router = useRouter();
  router.push('/home');

  return (
    <form onSubmit={handleSubmit}>
      <button onClick={() => setType('sale')}>판매</button>
      <input onChange={handleImageChange} />
    </form>
  );
}
```

**클라이언트 컴포넌트에서 할 수 있는 것**:
| 할 수 있는 것 | 예시 |
|---|---|
| `useState` | `const [count, setCount] = useState(0)` |
| `useEffect` | `useEffect(() => { ... }, [])` |
| 이벤트 핸들러 | `onClick`, `onChange`, `onSubmit` |
| `useRouter()` | 페이지 이동 |
| 브라우저 API | `window`, `navigator.clipboard` |
| 실시간 구독 | Supabase Realtime |

**클라이언트 컴포넌트에서 할 수 없는 것**:
| 할 수 없는 것 | 이유 |
|---|---|
| 비밀키 접근 | 브라우저에 노출되면 보안 위험 |
| `async` 컴포넌트 | 컴포넌트 함수 자체를 `async`로 못 만듦 |
| 직접 DB 쓰기 | Server Action을 통해서만 가능 |
| `cookies()` | 서버 전용 함수 |

### 언제 뭘 써야 하나?

```
"이 컴포넌트에서 사용자가 뭔가를 클릭하거나 입력하나?"

  예 → 클라이언트 컴포넌트 ('use client')
  아니오 → 서버 컴포넌트 (기본값)
```

**우리 프로젝트의 실제 분류**:

| 서버 컴포넌트 (데이터 표시) | 클라이언트 컴포넌트 (상호작용) |
|---|---|
| `home/page.tsx` — 홈 화면 | `post/new/page.tsx` — 글 작성 폼 |
| `community/notices/page.tsx` — 공지 목록 | `chat/[id]/chat-view.tsx` — 채팅 화면 |
| `post/[id]/page.tsx` — 글 상세 | `chat/chat-room-list.tsx` — 채팅 리스트 |
| `community/open-chats/page.tsx` — 오픈채팅 목록 | `open-chat/open-chat-form.tsx` — 오픈채팅 폼 |
| `post-list.tsx` — 글 카드 (정적) | `bottom-nav.tsx` — 하단 네비게이션 |

### 서버 + 클라이언트 조합 패턴

우리 프로젝트에서 자주 쓰는 패턴이다:

```
서버 컴포넌트 (page.tsx)
  │
  │ DB에서 데이터를 가져온다
  │
  ▼
클라이언트 컴포넌트 (xxx-view.tsx)
  │
  │ props로 데이터를 받아서
  │ 사용자 상호작용을 처리한다
```

**실제 예시 — 채팅**:

```tsx
// ① 서버 컴포넌트: chat/[id]/page.tsx
// → DB에서 메시지를 가져온다
export default async function ChatPage({ params }) {
  const messages = await getChatMessages(params.id);
  const room = await getChatRoom(params.id);

  // ② 클라이언트 컴포넌트에 데이터를 넘긴다
  return <ChatView messages={messages} chatRoomId={params.id} ... />;
}

// ③ 클라이언트 컴포넌트: chat/[id]/chat-view.tsx
'use client';
export default function ChatView({ messages, chatRoomId }) {
  const [msgs, setMsgs] = useState(messages); // 초기 데이터 설정
  // → 이후 실시간으로 새 메시지를 받아서 화면 업데이트
}
```

**왜 이렇게 나누나?**
- 서버 컴포넌트에서 DB 조회를 하면 **빠르고 안전**하다 (비밀키가 브라우저에 안 감)
- 클라이언트 컴포넌트에서 실시간 기능을 처리하면 **사용자 경험이 좋다**

---

## 4. Server Actions (서버 액션)

**핵심**: 클라이언트 컴포넌트에서 서버의 함수를 **직접 호출**하는 방법.

```
┌────────────────────┐          ┌────────────────────┐
│ 브라우저             │  호출 →  │ 서버                │
│                    │          │                    │
│ "등록하기" 클릭     │ ------→  │ createPost()       │
│                    │          │   → DB INSERT      │
│ { success: true }  │ ←------  │   → 결과 리턴       │
│                    │          │                    │
└────────────────────┘          └────────────────────┘
```

**이전 방식 (API Route)**:
```
클라이언트 → fetch('/api/posts', { method: 'POST', body: ... }) → 서버
```

**지금 방식 (Server Action)**:
```
클라이언트 → createPost(formData) → 서버 (함수 호출처럼 보이지만 실제로는 네트워크 요청)
```

**실제 코드 — 글 등록**:

```tsx
// src/actions/posts.ts — 서버에서만 실행됨
'use server';  // ← 이 파일의 함수들은 서버에서 실행된다고 선언

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function createPost(formData: FormData, imageUrls: string[]) {
  // 서버에서 실행되므로 비밀키 사용 가능
  const supabase = createClient(); // service_role 키

  const { error } = await supabase
    .from('posts')
    .insert({ ... });

  if (error) return { error: error.message };

  revalidatePath('/');  // 홈 페이지 캐시 무효화
  return { success: true };
}
```

```tsx
// src/app/(app)/post/new/page.tsx — 브라우저에서 실행됨
'use client';

import { createPost } from '@/actions/posts';  // ← 서버 함수를 import

async function handleSubmit(e) {
  // 마치 일반 함수처럼 호출하지만, 실제로는 서버에 요청이 간다
  const result = await createPost(formData, imageUrls);

  if (result.success) {
    router.push('/home');
  }
}
```

### revalidatePath가 뭔가?

Next.js는 성능을 위해 서버 컴포넌트의 결과를 **캐시(저장)**해둔다.

```
최초 접속:  /home → DB 조회 → HTML 생성 → 캐시에 저장 → 사용자에게 전송
재접속:     /home → 캐시에서 꺼냄 → 사용자에게 전송 (빠름!)
```

문제: 글을 새로 등록해도 캐시된 옛날 데이터가 보인다.

```
글 등록 → DB에 INSERT 됨
/home 접속 → 캐시에서 옛날 데이터를 보여줌 → 새 글이 안 보임! 😱
```

해결: `revalidatePath('/home')` → "이 경로의 캐시를 버려라!"

```
글 등록 → DB INSERT → revalidatePath('/') → 캐시 삭제
/home 접속 → 캐시 없음 → DB 재조회 → 새 글 포함된 HTML → 사용자에게 전송 ✅
```

---

## 5. 데이터 흐름 완전 정리

### 읽기 (조회) — 서버 컴포넌트에서

```
사용자가 /home 접속
  │
  ▼
미들웨어: 로그인 체크 (JWT 쿠키 확인)
  │ 로그인 안 됨 → /login으로 리다이렉트
  │ 로그인 됨 ↓
  ▼
서버 컴포넌트 (home/page.tsx):
  │
  │ const auth = await requireAuth()      ← 쿠키에서 userId 추출
  │ const supabase = createClient()       ← service_role 키로 DB 접속
  │ const posts = await supabase          ← DB 조회
  │   .from('posts').select('*')
  │
  ▼
HTML 렌더링 → 브라우저로 전송
```

### 쓰기 (등록) — Server Action으로

```
사용자가 "등록하기" 버튼 클릭
  │
  ▼
클라이언트 컴포넌트 (post/new/page.tsx):
  │
  │ const result = await createPost(formData)  ← Server Action 호출
  │ (내부적으로 HTTP POST 요청이 서버로 감)
  │
  ▼
Server Action (actions/posts.ts):
  │
  │ 'use server'
  │ const auth = await requireAuth()      ← 쿠키에서 userId 추출
  │ const supabase = createClient()       ← service_role 키로 DB 접속
  │ await supabase.from('posts').insert() ← DB 저장
  │ revalidatePath('/')                   ← 캐시 무효화
  │ return { success: true }              ← 결과 리턴
  │
  ▼
클라이언트: router.push('/home')            ← 홈으로 이동
```

### 실시간 — Supabase Realtime으로

```
사용자A가 메시지 전송
  │
  ▼
Server Action: sendMessage()
  │ → DB에 messages INSERT
  │
  ▼
PostgreSQL WAL (변경 로그)
  │ → Supabase Realtime 서버가 감지
  │
  ▼
WebSocket으로 사용자B에게 전파
  │
  ▼
사용자B의 클라이언트 컴포넌트:
  │ .on('postgres_changes', callback)
  │ → setMessages(prev => [...prev, newMsg])
  │ → 화면 자동 업데이트
```

---

## 6. 인증 (로그인) 구조

우리 프로젝트는 Supabase Auth를 안 쓰고 **자체 JWT 인증**을 쓴다.

```
회원가입 흐름:
  사용자 → 이메일 + 비밀번호 입력
    → bcryptjs로 비밀번호 암호화 (hash)
    → users 테이블에 저장
    → JWT 토큰 생성 (jose 라이브러리)
    → 쿠키에 토큰 저장
    → /register/profile로 이동

로그인 흐름:
  사용자 → 이메일 + 비밀번호 입력
    → DB에서 사용자 조회
    → bcryptjs로 비밀번호 비교
    → JWT 토큰 생성
    → 쿠키에 토큰 저장
    → /home으로 이동

페이지 접근 시:
  미들웨어 → 쿠키에서 JWT 추출 → 토큰 검증
    → 유효: 통과
    → 만료/없음: /login으로 리다이렉트
```

**관련 파일**:
| 파일 | 역할 |
|---|---|
| `src/lib/auth.ts` | JWT 생성/검증, 쿠키 관리 |
| `src/middleware.ts` | 모든 요청에서 로그인 체크 |
| `src/lib/supabase/middleware.ts` | 실제 미들웨어 로직 |
| `src/actions/auth.ts` | 회원가입, 로그인, 프로필 설정 Server Action |

---

## 7. Supabase를 쓰는 방식

### 두 개의 Supabase 클라이언트

```
┌──────────────────────────────────────────────────┐
│ 서버 (src/lib/supabase/server.ts)                 │
│                                                  │
│ SUPABASE_SERVICE_ROLE_KEY (비밀키)                 │
│ → 모든 테이블에 제한 없이 접근 가능                  │
│ → Server Action에서 DB 읽기/쓰기에 사용             │
│ → 절대 브라우저에 노출되면 안 됨!                    │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ 브라우저 (src/lib/supabase/client.ts)              │
│                                                  │
│ NEXT_PUBLIC_SUPABASE_ANON_KEY (공개키)             │
│ → 제한된 접근만 가능 (RLS 정책에 따라)               │
│ → 오직 Realtime 구독에만 사용                       │
│ → 데이터 쓰기는 여기서 하지 않음!                    │
└──────────────────────────────────────────────────┘
```

**왜 두 개?**
- **서버 키 (service_role)**: 만능 열쇠. DB의 모든 것에 접근 가능. 서버에서만 써야 안전.
- **공개 키 (anon)**: 제한된 열쇠. 브라우저에 노출되어도 안전. 실시간 기능에만 사용.

### 데이터 저장 구조

```
Supabase
├── PostgreSQL (데이터베이스)
│   ├── users          — 로그인 계정
│   ├── profiles       — 사용자 프로필 (닉네임, 아파트)
│   ├── posts          — 중고거래/나눔/대여 글
│   ├── open_chats     — 오픈채팅 홍보
│   ├── notices        — 공지사항
│   ├── chat_rooms     — 1:1 채팅방
│   ├── messages       — 채팅 메시지
│   └── ...
│
├── Storage (파일 저장소)
│   ├── post-images/        — 글 첨부 이미지
│   └── open-chat-images/   — 오픈채팅 이미지
│
└── Realtime (실시간)
    └── messages 테이블 변경 감지 → WebSocket 전파
```

---

## 8. 실시간 채팅의 원리

```
사용자A (글 작성자)                    사용자B (구매 희망자)
     │                                     │
     │  "안녕하세요" 전송                     │
     │                                     │
     ▼                                     │
Server Action: sendMessage()               │
     │                                     │
     ▼                                     │
PostgreSQL INSERT                          │
     │                                     │
     ▼                                     │
WAL (변경 로그) 기록                         │
     │                                     │
     ▼                                     │
Supabase Realtime 서버가 감지               │
     │                                     │
     ├────── WebSocket ───────────────────▶ │
     │                                     ▼
     │                          콜백 실행: setMessages()
     │                          화면에 메시지 표시
```

더 자세한 내용은 `docs/realtime-chat.md` 참고.

---

## 9. 폴더 구조 설명

```
src/
├── app/                          ← 페이지 (URL과 1:1 매핑)
│   ├── (auth)/                   ← 그룹: 로그인/회원가입 (하단탭 없음)
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   │
│   ├── (app)/                    ← 그룹: 메인 앱 (하단탭 있음)
│   │   ├── layout.tsx            ← 하단 네비게이션 포함
│   │   ├── home/page.tsx         ← /home
│   │   ├── chat/page.tsx         ← /chat
│   │   ├── post/new/page.tsx     ← /post/new
│   │   ├── community/            ← /community/...
│   │   └── my/page.tsx           ← /my
│   │
│   ├── layout.tsx                ← 루트 레이아웃 (HTML, 폰트)
│   └── globals.css               ← 전역 스타일
│
├── actions/                      ← Server Actions ('use server')
│   ├── auth.ts                   ← 회원가입, 로그인
│   ├── posts.ts                  ← 글 등록
│   ├── notices.ts                ← 공지사항 CRUD
│   ├── open-chats.ts             ← 오픈채팅 CRUD
│   └── chats.ts                  ← 1:1 채팅 메시지
│
├── components/                   ← 재사용 컴포넌트
│   ├── layout/
│   │   ├── header.tsx            ← 상단 헤더 (서버)
│   │   └── bottom-nav.tsx        ← 하단 네비게이션 (클라이언트)
│   ├── post/
│   │   └── post-list.tsx         ← 글 카드 (서버)
│   ├── notice/
│   │   └── notice-list.tsx       ← 공지 카드 (서버)
│   └── open-chat/
│       └── open-chat-list.tsx    ← 오픈채팅 카드 (서버)
│
├── lib/                          ← 유틸리티
│   ├── auth.ts                   ← JWT 인증 로직
│   ├── constants.ts              ← 상수 (라벨, 색상)
│   ├── utils.ts                  ← 공통 함수 (formatDate 등)
│   └── supabase/
│       ├── server.ts             ← 서버용 Supabase (service_role)
│       ├── client.ts             ← 브라우저용 Supabase (anon)
│       └── middleware.ts         ← 미들웨어 (로그인 체크)
│
├── types/                        ← TypeScript 타입 정의
│   └── database.ts
│
└── middleware.ts                  ← 미들웨어 진입점

supabase/
└── migrations/                   ← DB 마이그레이션 (테이블 생성 SQL)
    ├── 00000_create_users.sql
    ├── 00001_create_enums.sql
    ├── ...
    └── 00016_chat_read_tracking.sql
```

### 라우트 그룹 `(auth)`, `(app)` 이란?

괄호로 감싼 폴더는 **URL에 포함되지 않는** 그룹이다.

```
src/app/(app)/home/page.tsx   →  URL: /home     (app이 URL에 없음)
src/app/(auth)/login/page.tsx →  URL: /login    (auth가 URL에 없음)
```

**왜 쓰나?** 레이아웃을 다르게 적용하기 위해.
- `(app)/layout.tsx` → 하단 네비게이션이 있는 레이아웃
- `(auth)/layout.tsx` → 하단 네비게이션이 없는 깔끔한 레이아웃

---

## 10. 파일별 서버/클라이언트 분류표

전체 **40개 tsx 파일** 중 **15개가 클라이언트**, **25개가 서버** 컴포넌트다.

### 클라이언트 컴포넌트 (`'use client'`) — 15개

`'use client'`가 파일 맨 위에 있는 파일들. 브라우저에서 JavaScript가 실행된다.

#### 페이지 — 사용자 입력/폼이 있는 페이지

| 파일 | 클라이언트인 이유 |
|---|---|
| `src/app/(auth)/login/page.tsx` | 로그인 폼 (이메일/비밀번호 입력, 버튼 클릭) |
| `src/app/(auth)/register/page.tsx` | 회원가입 폼 |
| `src/app/(auth)/register/profile/page.tsx` | 프로필 설정 폼 (아파트 선택, 닉네임 입력) |
| `src/app/(app)/post/new/page.tsx` | 글 작성 폼 (이미지 업로드, 카테고리 선택, useState) |

#### 컴포넌트 — 상호작용/실시간 기능

| 파일 | 클라이언트인 이유 |
|---|---|
| `src/app/(app)/chat/[id]/chat-view.tsx` | **실시간 채팅** (Realtime 구독, 메시지 전송, 타이핑 인디케이터) |
| `src/app/(app)/chat/chat-room-list.tsx` | **채팅 목록 실시간 갱신** (Realtime 구독, 안읽은 수 업데이트) |
| `src/components/layout/bottom-nav.tsx` | `usePathname()`으로 현재 활성 탭 표시 |
| `src/components/layout/header.tsx` | `useRouter()`로 뒤로가기 버튼 |
| `src/components/open-chat/open-chat-form.tsx` | 오픈채팅 등록/수정 폼 (이미지 업로드, 카테고리 칩 선택) |
| `src/components/open-chat/open-chat-review.tsx` | 리뷰 별점 클릭 선택, 작성/삭제 |
| `src/components/open-chat/access-request-button.tsx` | "참여 요청" 버튼 클릭 → Server Action 호출 |
| `src/app/(app)/community/notices/[id]/notice-actions.tsx` | 공지 수정/삭제/고정 버튼 |
| `src/app/(app)/community/open-chats/[id]/open-chat-actions.tsx` | 오픈채팅 수정/삭제 버튼 |
| `src/components/notice/notice-form.tsx` | 공지 작성/수정 폼 |
| `src/components/post/post-list-header.tsx` | 판매/나눔/대여 탭 전환 |

### 서버 컴포넌트 (기본값) — 25개

`'use client'`가 **없는** 파일들. 서버에서 HTML을 만들어서 보낸다.

#### 레이아웃 — 3개

| 파일 | 하는 일 |
|---|---|
| `src/app/layout.tsx` | 루트 레이아웃 (HTML 구조, 폰트, 메타데이터) |
| `src/app/(auth)/layout.tsx` | 인증 페이지 레이아웃 (하단탭 없음) |
| `src/app/(app)/layout.tsx` | 메인 앱 레이아웃 (하단탭 BottomNav 포함) |

#### 페이지 — DB 조회 후 화면 표시 — 18개

| 파일 | 하는 일 |
|---|---|
| `src/app/page.tsx` | 루트 → /home 리다이렉트 |
| `src/app/(app)/home/page.tsx` | 홈 화면 (아파트명, 글 수 조회) |
| `src/app/(app)/home/sale/page.tsx` | 판매 글 목록 조회 |
| `src/app/(app)/home/share/page.tsx` | 나눔 글 목록 조회 |
| `src/app/(app)/home/rental/page.tsx` | 대여 글 목록 조회 |
| `src/app/(app)/post/[id]/page.tsx` | 글 상세 조회 (이미지 캐러셀, 작성자 정보) |
| `src/app/(app)/chat/page.tsx` | 채팅방 목록 조회 → `ChatRoomList`(클라이언트)에 전달 |
| `src/app/(app)/chat/[id]/page.tsx` | 채팅 메시지 조회 → `ChatView`(클라이언트)에 전달 |
| `src/app/(app)/community/page.tsx` | 동네 메뉴 (공지사항, 오픈채팅 링크) |
| `src/app/(app)/community/notices/page.tsx` | 공지 목록 조회 |
| `src/app/(app)/community/notices/[id]/page.tsx` | 공지 상세 조회 |
| `src/app/(app)/community/notices/new/page.tsx` | 공지 작성 (폼은 `notice-form` 클라이언트 컴포넌트) |
| `src/app/(app)/community/notices/[id]/edit/page.tsx` | 공지 수정 (기존 데이터 조회 후 폼에 전달) |
| `src/app/(app)/community/open-chats/page.tsx` | 오픈채팅 목록 + 별점 조회 |
| `src/app/(app)/community/open-chats/[id]/page.tsx` | 오픈채팅 상세 (이미지, 기본정보, 리뷰) |
| `src/app/(app)/community/open-chats/new/page.tsx` | 오픈채팅 등록 (폼은 `open-chat-form` 클라이언트 컴포넌트) |
| `src/app/(app)/community/open-chats/[id]/edit/page.tsx` | 오픈채팅 수정 |
| `src/app/(app)/my/page.tsx` | 마이페이지 |
| `src/app/(app)/notifications/page.tsx` | 알림 페이지 |

#### UI 컴포넌트 — 데이터 받아서 표시만 — 4개

| 파일 | 하는 일 |
|---|---|
| `src/components/post/post-list.tsx` | 글 카드 UI (PostCard, EmptyState) |
| `src/components/notice/notice-list.tsx` | 공지 카드 UI (NoticeCard, EmptyNotice) |
| `src/components/open-chat/open-chat-list.tsx` | 오픈채팅 카드 UI (OpenChatCard) |

### 서버 + 클라이언트 조합 패턴

많은 페이지가 **서버 → 클라이언트** 조합으로 동작한다:

```
서버 page.tsx (DB 조회)  →  props 전달  →  클라이언트 컴포넌트 (상호작용)
```

| 서버 페이지 | 클라이언트 컴포넌트 | 전달하는 데이터 |
|---|---|---|
| `chat/page.tsx` | `chat-room-list.tsx` | 채팅방 목록, 현재 userId |
| `chat/[id]/page.tsx` | `chat-view.tsx` | 메시지 배열, 상대방 정보 |
| `notices/new/page.tsx` | `notice-form.tsx` | (빈 폼) |
| `notices/[id]/edit/page.tsx` | `notice-form.tsx` | 기존 공지 데이터 |
| `notices/[id]/page.tsx` | `notice-actions.tsx` | 공지 ID, 권한 정보 |
| `open-chats/new/page.tsx` | `open-chat-form.tsx` | (빈 폼) |
| `open-chats/[id]/edit/page.tsx` | `open-chat-form.tsx` | 기존 오픈채팅 데이터 |
| `open-chats/[id]/page.tsx` | `open-chat-actions.tsx`, `open-chat-review.tsx`, `access-request-button.tsx` | 채팅 상세, 리뷰, 권한 |

### 판단 기준 요약

```
이 파일에 아래 중 하나라도 있으면 → 'use client' 필요:

  ✅ useState, useEffect, useRef, useCallback
  ✅ onClick, onChange, onSubmit 이벤트
  ✅ useRouter(), usePathname()
  ✅ Supabase Realtime (.channel().on().subscribe())
  ✅ 브라우저 API (navigator.clipboard, window 등)

전부 없으면 → 서버 컴포넌트 (기본값, 아무것도 안 써도 됨)
```

---

## 11. 자주 하는 실수와 해결법

### 실수 1: 서버 컴포넌트에서 useState 사용

```tsx
// ❌ 에러 발생!
export default function HomePage() {
  const [count, setCount] = useState(0);  // Error!
  // ...
}

// ✅ 해결: 'use client' 추가
'use client';
export default function HomePage() {
  const [count, setCount] = useState(0);  // OK
  // ...
}
```

### 실수 2: 클라이언트 컴포넌트에서 service_role 키 사용

```tsx
// ❌ 보안 위험! 비밀키가 브라우저에 노출됨
'use client';
import { createClient } from '@/lib/supabase/server';  // service_role!

// ✅ 해결: Server Action으로 처리
'use client';
import { createPost } from '@/actions/posts';  // 서버에서 실행됨
```

### 실수 3: revalidatePath 누락

```tsx
// ❌ 글 등록 후 목록에 새 글이 안 보임
export async function createPost(formData) {
  await supabase.from('posts').insert({ ... });
  return { success: true };  // revalidatePath 빠짐!
}

// ✅ 해결: revalidatePath 추가
export async function createPost(formData) {
  await supabase.from('posts').insert({ ... });
  revalidatePath('/');  // 홈 페이지 캐시 무효화
  return { success: true };
}
```

### 실수 4: 클라이언트 컴포넌트에서 async 함수

```tsx
// ❌ 클라이언트 컴포넌트는 async가 안 됨
'use client';
export default async function MyPage() {  // Error!
  const data = await fetchData();
}

// ✅ 해결: useEffect 안에서 호출
'use client';
export default function MyPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData().then(setData);
  }, []);
}
```

---

## 핵심 요약

| 개념 | 한 줄 설명 |
|---|---|
| **서버 컴포넌트** | DB 조회 + HTML 생성. `'use client'` 없으면 서버 컴포넌트 |
| **클라이언트 컴포넌트** | 사용자 상호작용. `'use client'` 필요 |
| **Server Action** | `'use server'` 함수. 클라이언트에서 서버 함수를 직접 호출 |
| **revalidatePath** | 데이터 변경 후 캐시를 지워서 새 데이터가 보이게 함 |
| **미들웨어** | 모든 요청 전에 로그인 여부를 체크 |
| **Supabase server** | service_role 키. 서버에서만 사용. 모든 DB 접근 가능 |
| **Supabase client** | anon 키. 브라우저에서 사용. 실시간 구독만 |
| **라우트 그룹** | `(app)`, `(auth)` — URL에 안 나타나고 레이아웃만 다르게 적용 |
