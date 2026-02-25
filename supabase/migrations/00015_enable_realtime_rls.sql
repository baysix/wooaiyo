-- messages 테이블 RLS 활성화
-- 쓰기는 service_role(서버 액션)만 가능, 읽기는 anon 허용 (Realtime 구독용)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- anon 키로 메시지 조회 허용 (Realtime 구독에 필요)
-- 실제 접근 제어는 서버 액션 레벨에서 처리
CREATE POLICY "anon_read_messages" ON public.messages
  FOR SELECT TO anon
  USING (true);

-- service_role은 모든 작업 가능 (기존 서버 액션 동작 유지)
CREATE POLICY "service_role_all_messages" ON public.messages
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Realtime publication: messages 테이블은 이미 supabase_realtime에 포함됨
