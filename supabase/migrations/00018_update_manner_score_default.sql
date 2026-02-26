-- Change default manner_score from 36.5 to 50
ALTER TABLE public.profiles ALTER COLUMN manner_score SET DEFAULT 50;

-- Update existing users who still have the old default
UPDATE public.profiles SET manner_score = 50 WHERE manner_score = 36.5;

-- Update formula: base 50, scale by (avg - 3) * 5
CREATE OR REPLACE FUNCTION update_manner_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET manner_score = (
    SELECT ROUND(50 + (AVG(rating) - 3) * 5, 1)
    FROM public.reviews
    WHERE reviewee_id = NEW.reviewee_id
  ),
  updated_at = now()
  WHERE id = NEW.reviewee_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
