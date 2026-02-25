-- Chat rooms (1:1, initiated from a post)
CREATE TABLE public.chat_rooms (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id     UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  buyer_id    UUID NOT NULL REFERENCES public.profiles(id),
  seller_id   UUID NOT NULL REFERENCES public.profiles(id),
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, buyer_id)
);

CREATE INDEX idx_chat_rooms_buyer ON public.chat_rooms(buyer_id, updated_at DESC);
CREATE INDEX idx_chat_rooms_seller ON public.chat_rooms(seller_id, updated_at DESC);

-- Messages
CREATE TABLE public.messages (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_room_id  UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id     UUID NOT NULL REFERENCES public.profiles(id),
  content       TEXT NOT NULL,
  image_url     TEXT,
  is_read       BOOLEAN DEFAULT false,
  is_system     BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_messages_room ON public.messages(chat_room_id, created_at ASC);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;
