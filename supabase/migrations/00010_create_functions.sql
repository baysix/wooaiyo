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
