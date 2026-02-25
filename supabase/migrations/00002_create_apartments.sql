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
