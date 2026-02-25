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
