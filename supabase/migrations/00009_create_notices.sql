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
