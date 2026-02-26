-- 공지사항에 이미지 첨부 기능 추가 (최대 3장)
ALTER TABLE public.notices ADD COLUMN images TEXT[] DEFAULT '{}';
