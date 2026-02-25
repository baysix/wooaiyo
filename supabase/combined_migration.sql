-- Custom users table (replaces Supabase auth.users)
CREATE TABLE public.users (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_email ON public.users(email);
-- Post transaction type
CREATE TYPE post_type AS ENUM ('sale', 'share', 'rental');

-- Post status (unified across types, valid transitions differ per type)
CREATE TYPE post_status AS ENUM ('active', 'reserved', 'completed', 'hidden');

-- Notification type
CREATE TYPE notification_type AS ENUM (
  'chat_message',
  'status_change',
  'keyword_match',
  'review_request',
  'notice'
);
-- Apartment complex data (seeded from public data API)
CREATE TABLE public.apartments (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT NOT NULL,
  address       TEXT NOT NULL,
  city          TEXT,
  district      TEXT,
  dong          TEXT,
  total_units   INTEGER,
  is_active     BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Preset transaction locations within each apartment complex
CREATE TABLE public.apartment_locations (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  apartment_id  UUID NOT NULL REFERENCES public.apartments(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_apartment_locations_apt ON public.apartment_locations(apartment_id, sort_order);
-- User profiles (linked to public.users)
CREATE TABLE public.profiles (
  id              UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  nickname        TEXT NOT NULL,
  avatar_url      TEXT,
  apartment_id    UUID REFERENCES public.apartments(id),
  dong            TEXT,
  manner_score    NUMERIC(3,1) DEFAULT 36.5,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT nickname_length CHECK (char_length(nickname) >= 2 AND char_length(nickname) <= 20)
);

CREATE INDEX idx_profiles_apartment ON public.profiles(apartment_id);
-- Item categories
CREATE TABLE public.categories (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  icon        TEXT,
  sort_order  INTEGER DEFAULT 0
);
-- Core posts table (sale, share, rental unified)
CREATE TABLE public.posts (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  apartment_id    UUID NOT NULL REFERENCES public.apartments(id),
  type            post_type NOT NULL,
  status          post_status DEFAULT 'active',

  -- Common fields
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  category_id     UUID REFERENCES public.categories(id),
  location_id     UUID REFERENCES public.apartment_locations(id),
  images          TEXT[] DEFAULT '{}',

  -- Sale-specific
  price           INTEGER,
  is_negotiable   BOOLEAN DEFAULT false,

  -- Share-specific
  quantity        INTEGER DEFAULT 1,

  -- Rental-specific
  deposit         INTEGER,
  rental_fee      INTEGER,
  rental_period   TEXT,

  -- Transaction tracking
  buyer_id        UUID REFERENCES public.profiles(id),
  completed_at    TIMESTAMPTZ,

  -- Metadata
  view_count      INTEGER DEFAULT 0,
  chat_count      INTEGER DEFAULT 0,
  bookmark_count  INTEGER DEFAULT 0,
  is_bumped       BOOLEAN DEFAULT false,
  bumped_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_posts_apartment_status ON public.posts(apartment_id, status, created_at DESC);
CREATE INDEX idx_posts_author ON public.posts(author_id, created_at DESC);
CREATE INDEX idx_posts_type ON public.posts(apartment_id, type, created_at DESC);
CREATE INDEX idx_posts_category ON public.posts(apartment_id, category_id, created_at DESC);

-- Bookmarks
CREATE TABLE public.bookmarks (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id     UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, post_id)
);
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
-- Reviews after transaction completion
CREATE TABLE public.reviews (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id       UUID NOT NULL REFERENCES public.posts(id),
  reviewer_id   UUID NOT NULL REFERENCES public.profiles(id),
  reviewee_id   UUID NOT NULL REFERENCES public.profiles(id),
  rating        INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content       TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, reviewer_id)
);

CREATE INDEX idx_reviews_reviewee ON public.reviews(reviewee_id, created_at DESC);
-- Notifications
CREATE TABLE public.notifications (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type            notification_type NOT NULL,
  title           TEXT NOT NULL,
  body            TEXT,
  data            JSONB DEFAULT '{}',
  is_read         BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read, created_at DESC);

-- Keyword alerts
CREATE TABLE public.keyword_alerts (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  keyword       TEXT NOT NULL,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, keyword)
);

CREATE INDEX idx_keyword_alerts_active ON public.keyword_alerts(is_active, keyword);

-- Push tokens
CREATE TABLE public.push_tokens (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token       TEXT NOT NULL,
  platform    TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, token)
);

-- Enable Realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
-- Apartment community notices
CREATE TABLE public.notices (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  apartment_id  UUID NOT NULL REFERENCES public.apartments(id) ON DELETE CASCADE,
  author_id     UUID NOT NULL REFERENCES public.profiles(id),
  title         TEXT NOT NULL,
  content       TEXT NOT NULL,
  is_pinned     BOOLEAN DEFAULT false,
  view_count    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notices_apartment ON public.notices(apartment_id, is_pinned DESC, created_at DESC);
-- Function: Change post status with state machine validation
CREATE OR REPLACE FUNCTION change_post_status(
  p_post_id UUID,
  p_new_status post_status,
  p_user_id UUID,
  p_buyer_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_post RECORD;
BEGIN
  SELECT * INTO v_post FROM public.posts WHERE id = p_post_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Post not found';
  END IF;

  IF v_post.author_id != p_user_id THEN
    RAISE EXCEPTION 'Only the post author can change status';
  END IF;

  -- State transitions
  IF v_post.status = 'active' AND p_new_status = 'reserved' THEN
    IF p_buyer_id IS NULL THEN
      RAISE EXCEPTION 'buyer_id required for reservation';
    END IF;
    UPDATE public.posts
    SET status = 'reserved', buyer_id = p_buyer_id, updated_at = now()
    WHERE id = p_post_id;

  ELSIF v_post.status = 'reserved' AND p_new_status = 'active' THEN
    UPDATE public.posts
    SET status = 'active', buyer_id = NULL, updated_at = now()
    WHERE id = p_post_id;

  ELSIF v_post.status = 'reserved' AND p_new_status = 'completed' THEN
    UPDATE public.posts
    SET status = 'completed', completed_at = now(), updated_at = now()
    WHERE id = p_post_id;

  ELSIF v_post.type = 'rental' AND v_post.status = 'completed' AND p_new_status = 'active' THEN
    UPDATE public.posts
    SET status = 'active', buyer_id = NULL, completed_at = NULL, updated_at = now()
    WHERE id = p_post_id;

  ELSIF p_new_status = 'hidden' AND v_post.status != 'hidden' THEN
    UPDATE public.posts
    SET status = 'hidden', updated_at = now()
    WHERE id = p_post_id;

  ELSIF v_post.status = 'hidden' AND p_new_status = 'active' THEN
    UPDATE public.posts
    SET status = 'active', updated_at = now()
    WHERE id = p_post_id;

  ELSE
    RAISE EXCEPTION 'Invalid status transition: % -> %', v_post.status, p_new_status;
  END IF;

  RETURN jsonb_build_object('success', true, 'new_status', p_new_status);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check keyword alerts on new post
CREATE OR REPLACE FUNCTION check_keyword_alerts()
RETURNS TRIGGER AS $$
DECLARE
  v_alert RECORD;
BEGIN
  FOR v_alert IN
    SELECT ka.user_id, ka.keyword
    FROM public.keyword_alerts ka
    JOIN public.profiles p ON p.id = ka.user_id
    WHERE ka.is_active = true
      AND p.apartment_id = NEW.apartment_id
      AND ka.user_id != NEW.author_id
      AND (NEW.title ILIKE '%' || ka.keyword || '%'
           OR NEW.description ILIKE '%' || ka.keyword || '%')
  LOOP
    INSERT INTO public.notifications (user_id, type, title, body, data)
    VALUES (
      v_alert.user_id,
      'keyword_match',
      '키워드 알림: ' || v_alert.keyword,
      NEW.title,
      jsonb_build_object('post_id', NEW.id, 'keyword', v_alert.keyword)
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_keyword_alerts
  AFTER INSERT ON public.posts
  FOR EACH ROW
  WHEN (NEW.status = 'active')
  EXECUTE FUNCTION check_keyword_alerts();

-- Function: Update manner score on new review
CREATE OR REPLACE FUNCTION update_manner_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET manner_score = (
    SELECT ROUND(36.5 + (AVG(rating) - 3) * 5, 1)
    FROM public.reviews
    WHERE reviewee_id = NEW.reviewee_id
  ),
  updated_at = now()
  WHERE id = NEW.reviewee_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_manner_score
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_manner_score();
-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('post-images', 'post-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-images', 'chat-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- Seed: Test apartment complex
INSERT INTO public.apartments (id, name, address, city, district, dong, total_units, is_active)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  '래미안 블레스티지',
  '서울특별시 서초구 반포대로 235',
  '서울특별시',
  '서초구',
  '반포동',
  2444,
  true
);

-- Seed: Apartment locations (preset meeting spots)
INSERT INTO public.apartment_locations (apartment_id, name, description, sort_order) VALUES
('a0000000-0000-0000-0000-000000000001', '정문 경비실', '정문 경비실 앞', 1),
('a0000000-0000-0000-0000-000000000001', '후문 경비실', '후문 경비실 앞', 2),
('a0000000-0000-0000-0000-000000000001', '단지 내 놀이터', '중앙 놀이터 벤치', 3),
('a0000000-0000-0000-0000-000000000001', '지하주차장 B1', '지하 1층 엘리베이터 앞', 4),
('a0000000-0000-0000-0000-000000000001', '단지 내 상가', '상가 1층 입구', 5),
('a0000000-0000-0000-0000-000000000001', '택배 보관소', '택배 보관소 앞', 6);

-- Seed: Categories
INSERT INTO public.categories (name, icon, sort_order) VALUES
('가전/디지털', '💻', 1),
('가구/인테리어', '🪑', 2),
('유아/아동', '👶', 3),
('생활/주방', '🍳', 4),
('의류/잡화', '👕', 5),
('도서/취미', '📚', 6),
('스포츠/레저', '⚽', 7),
('반려동물', '🐾', 8),
('식품', '🥬', 9),
('기타', '📦', 10);
