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
