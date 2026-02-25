-- 비공개 채팅에도 참여 링크 + 참여코드(비밀번호) 저장
ALTER TABLE public.open_chats ADD COLUMN access_code TEXT;
