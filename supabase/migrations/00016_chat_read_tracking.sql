-- 채팅방 읽음 추적: 각 참여자의 마지막 읽은 시간
ALTER TABLE public.chat_rooms ADD COLUMN buyer_last_read_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.chat_rooms ADD COLUMN seller_last_read_at TIMESTAMPTZ DEFAULT now();
