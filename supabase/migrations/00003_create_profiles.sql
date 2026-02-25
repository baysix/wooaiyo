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
