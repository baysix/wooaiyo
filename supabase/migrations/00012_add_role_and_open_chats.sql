-- 1) profiles에 role 추가
ALTER TABLE profiles ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'resident';

-- 2) open_chats 테이블 생성
CREATE TABLE public.open_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id UUID NOT NULL REFERENCES public.apartments(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES public.profiles(id),
  title VARCHAR(100) NOT NULL,
  description TEXT,
  chat_type VARCHAR(10) NOT NULL CHECK (chat_type IN ('public', 'private')),
  external_link TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  participant_count INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_open_chats_apartment ON public.open_chats(apartment_id, is_active, created_at DESC);

-- 3) chat_rooms 수정: post_id nullable + open_chat_id 추가
ALTER TABLE public.chat_rooms ALTER COLUMN post_id DROP NOT NULL;
ALTER TABLE public.chat_rooms ADD COLUMN open_chat_id UUID REFERENCES public.open_chats(id);
ALTER TABLE public.chat_rooms ADD CONSTRAINT chk_room_type
  CHECK (
    (post_id IS NOT NULL AND open_chat_id IS NULL)
    OR
    (post_id IS NULL AND open_chat_id IS NOT NULL)
  );
CREATE INDEX idx_chat_rooms_open_chat ON public.chat_rooms(open_chat_id) WHERE open_chat_id IS NOT NULL;
