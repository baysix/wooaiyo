-- 1) open_chats에 category, eligibility, images 추가
ALTER TABLE public.open_chats ADD COLUMN category VARCHAR(20) NOT NULL DEFAULT '기타';
ALTER TABLE public.open_chats ADD COLUMN eligibility TEXT;
ALTER TABLE public.open_chats ADD COLUMN images TEXT[] DEFAULT '{}';

-- 기존 image_url 데이터 마이그레이션
UPDATE public.open_chats SET images = ARRAY[image_url]
  WHERE image_url IS NOT NULL AND image_url != '';

-- 2) open_chat_reviews 테이블 생성
CREATE TABLE public.open_chat_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  open_chat_id UUID NOT NULL REFERENCES public.open_chats(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(open_chat_id, reviewer_id)
);
CREATE INDEX idx_ocr_chat ON public.open_chat_reviews(open_chat_id, created_at DESC);
