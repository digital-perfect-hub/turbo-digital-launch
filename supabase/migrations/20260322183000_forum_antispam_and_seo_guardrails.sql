BEGIN;

-- -------------------------------------------------------------------
-- Forum anti-spam / rate-limit / redirect-resolver
-- -------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.resolve_forum_redirect(p_source_path text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT fr.target_path
  FROM public.forum_redirects fr
  WHERE fr.source_path = trim(p_source_path)
    AND fr.is_active = true
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.resolve_forum_redirect(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_forum_redirect(text) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.count_forum_urls(p_content text)
RETURNS integer
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT COALESCE((
    SELECT COUNT(*)::integer
    FROM regexp_matches(lower(COALESCE(p_content, '')), '(https?://|www\.)', 'g')
  ), 0)
$$;

CREATE OR REPLACE FUNCTION public.guard_forum_reply_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_thread public.forum_threads%ROWTYPE;
  v_last_reply_at timestamptz;
  v_recent_replies integer;
  v_normalized_content text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'forum_reply_auth_required'
      USING ERRCODE = 'P0001',
            MESSAGE = 'forum_reply_auth_required: Du musst eingeloggt sein, um zu antworten.';
  END IF;

  IF NEW.author_id IS NULL THEN
    NEW.author_id := auth.uid();
  END IF;

  IF NEW.author_id <> auth.uid() AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'forum_reply_author_mismatch'
      USING ERRCODE = 'P0001',
            MESSAGE = 'forum_reply_author_mismatch: author_id passt nicht zum eingeloggten User.';
  END IF;

  v_normalized_content := trim(regexp_replace(COALESCE(NEW.content, ''), '\s+', ' ', 'g'));
  NEW.content := v_normalized_content;

  IF char_length(v_normalized_content) < 12 THEN
    RAISE EXCEPTION 'forum_reply_min_length'
      USING ERRCODE = 'P0001',
            MESSAGE = 'forum_reply_min_length: Antworten müssen mindestens 12 Zeichen haben.';
  END IF;

  IF char_length(v_normalized_content) > 5000 THEN
    RAISE EXCEPTION 'forum_reply_max_length'
      USING ERRCODE = 'P0001',
            MESSAGE = 'forum_reply_max_length: Antworten dürfen maximal 5000 Zeichen haben.';
  END IF;

  IF public.count_forum_urls(v_normalized_content) > 2 THEN
    RAISE EXCEPTION 'forum_reply_url_limit'
      USING ERRCODE = 'P0001',
            MESSAGE = 'forum_reply_url_limit: Maximal zwei Links pro Antwort sind erlaubt.';
  END IF;

  SELECT *
  INTO v_thread
  FROM public.forum_threads
  WHERE id = NEW.thread_id;

  IF NOT FOUND OR v_thread.is_active IS NOT TRUE OR v_thread.status <> 'published' THEN
    RAISE EXCEPTION 'forum_reply_thread_unavailable'
      USING ERRCODE = 'P0001',
            MESSAGE = 'forum_reply_thread_unavailable: Thread ist nicht verfügbar.';
  END IF;

  IF v_thread.is_locked THEN
    RAISE EXCEPTION 'forum_reply_locked'
      USING ERRCODE = 'P0001',
            MESSAGE = 'forum_reply_locked: Dieser Thread ist geschlossen.';
  END IF;

  SELECT fr.created_at
  INTO v_last_reply_at
  FROM public.forum_replies fr
  WHERE fr.author_id = NEW.author_id
  ORDER BY fr.created_at DESC
  LIMIT 1;

  IF v_last_reply_at IS NOT NULL AND v_last_reply_at > now() - interval '30 seconds' THEN
    RAISE EXCEPTION 'forum_rate_limit_reply'
      USING ERRCODE = 'P0001',
            MESSAGE = 'forum_rate_limit_reply: Bitte warte 30 Sekunden zwischen zwei Antworten.';
  END IF;

  SELECT COUNT(*)::integer
  INTO v_recent_replies
  FROM public.forum_replies fr
  WHERE fr.author_id = NEW.author_id
    AND fr.created_at > now() - interval '10 minutes';

  IF v_recent_replies >= 8 THEN
    RAISE EXCEPTION 'forum_reply_burst_limit'
      USING ERRCODE = 'P0001',
            MESSAGE = 'forum_reply_burst_limit: Zu viele Antworten in kurzer Zeit.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.forum_replies fr
    WHERE fr.author_id = NEW.author_id
      AND lower(trim(fr.content)) = lower(v_normalized_content)
      AND fr.created_at > now() - interval '24 hours'
  ) THEN
    RAISE EXCEPTION 'forum_reply_duplicate'
      USING ERRCODE = 'P0001',
            MESSAGE = 'forum_reply_duplicate: Gleiche oder sehr ähnliche Antwort wurde bereits gesendet.';
  END IF;

  IF NEW.author_name IS NULL OR btrim(NEW.author_name) = '' THEN
    NEW.author_name := 'Mitglied';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS forum_replies_insert_guard ON public.forum_replies;
CREATE TRIGGER forum_replies_insert_guard
BEFORE INSERT ON public.forum_replies
FOR EACH ROW
EXECUTE FUNCTION public.guard_forum_reply_insert();

CREATE OR REPLACE FUNCTION public.guard_forum_reply_like_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reply_author_id uuid;
  v_reply_active boolean;
  v_reply_spam boolean;
  v_thread_active boolean;
  v_thread_status text;
  v_thread_locked boolean;
BEGIN
  IF auth.uid() IS NULL OR NEW.user_id <> auth.uid() THEN
    RAISE EXCEPTION 'forum_like_auth_mismatch'
      USING ERRCODE = 'P0001',
            MESSAGE = 'forum_like_auth_mismatch: Like-User passt nicht zur aktiven Session.';
  END IF;

  SELECT
    fr.author_id,
    fr.is_active,
    fr.is_spam,
    ft.is_active,
    ft.status,
    ft.is_locked
  INTO
    v_reply_author_id,
    v_reply_active,
    v_reply_spam,
    v_thread_active,
    v_thread_status,
    v_thread_locked
  FROM public.forum_replies fr
  JOIN public.forum_threads ft
    ON ft.id = fr.thread_id
  WHERE fr.id = NEW.reply_id;

  IF NOT FOUND OR v_reply_active IS NOT TRUE OR v_reply_spam IS TRUE OR v_thread_active IS NOT TRUE OR v_thread_status <> 'published' OR v_thread_locked IS TRUE THEN
    RAISE EXCEPTION 'forum_like_reply_unavailable'
      USING ERRCODE = 'P0001',
            MESSAGE = 'forum_like_reply_unavailable: Diese Antwort kann aktuell nicht geliked werden.';
  END IF;

  IF v_reply_author_id = NEW.user_id THEN
    RAISE EXCEPTION 'forum_like_own_reply'
      USING ERRCODE = 'P0001',
            MESSAGE = 'forum_like_own_reply: Eigene Antworten dürfen nicht geliked werden.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.forum_reply_likes frl
    WHERE frl.user_id = NEW.user_id
      AND frl.created_at > now() - interval '3 seconds'
  ) THEN
    RAISE EXCEPTION 'forum_rate_limit_like'
      USING ERRCODE = 'P0001',
            MESSAGE = 'forum_rate_limit_like: Bitte kurz warten, bevor du weitere Likes setzt.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS forum_reply_likes_insert_guard ON public.forum_reply_likes;
CREATE TRIGGER forum_reply_likes_insert_guard
BEFORE INSERT ON public.forum_reply_likes
FOR EACH ROW
EXECUTE FUNCTION public.guard_forum_reply_like_insert();

NOTIFY pgrst, 'reload schema';

COMMIT;
