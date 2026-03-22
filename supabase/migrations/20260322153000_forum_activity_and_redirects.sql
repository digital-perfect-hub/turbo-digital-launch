BEGIN;

-- -------------------------------------------------------------------
-- Forum hardening: activity sync + slug redirects
-- -------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.forum_redirects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_path text NOT NULL UNIQUE,
  target_path text NOT NULL,
  entity_type text NOT NULL CHECK (entity_type IN ('thread', 'category')),
  entity_id uuid,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT forum_redirects_source_target_diff CHECK (source_path <> target_path)
);

CREATE INDEX IF NOT EXISTS idx_forum_redirects_entity_lookup
  ON public.forum_redirects(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_forum_redirects_is_active
  ON public.forum_redirects(is_active);

ALTER TABLE public.forum_redirects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Forum redirects public read" ON public.forum_redirects;
CREATE POLICY "Forum redirects public read"
ON public.forum_redirects
FOR SELECT
USING (is_active = true);

DROP POLICY IF EXISTS "Forum redirects admin insert" ON public.forum_redirects;
CREATE POLICY "Forum redirects admin insert"
ON public.forum_redirects
FOR INSERT
TO authenticated
WITH CHECK (public.app_role()::text = 'admin');

DROP POLICY IF EXISTS "Forum redirects admin update" ON public.forum_redirects;
CREATE POLICY "Forum redirects admin update"
ON public.forum_redirects
FOR UPDATE
TO authenticated
USING (public.app_role()::text = 'admin')
WITH CHECK (public.app_role()::text = 'admin');

DROP POLICY IF EXISTS "Forum redirects admin delete" ON public.forum_redirects;
CREATE POLICY "Forum redirects admin delete"
ON public.forum_redirects
FOR DELETE
TO authenticated
USING (public.app_role()::text = 'admin');

DROP TRIGGER IF EXISTS update_forum_redirects_updated_at ON public.forum_redirects;
CREATE TRIGGER update_forum_redirects_updated_at
BEFORE UPDATE ON public.forum_redirects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.refresh_forum_thread_last_activity(p_thread_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_thread_id IS NULL THEN
    RETURN;
  END IF;

  UPDATE public.forum_threads AS ft
  SET last_activity_at = COALESCE(
    (
      SELECT MAX(fr.created_at)
      FROM public.forum_replies fr
      WHERE fr.thread_id = p_thread_id
        AND fr.is_active = true
        AND fr.is_spam = false
    ),
    ft.created_at
  )
  WHERE ft.id = p_thread_id;
END;
$$;

REVOKE ALL ON FUNCTION public.refresh_forum_thread_last_activity(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.refresh_forum_thread_last_activity(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.handle_forum_reply_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.refresh_forum_thread_last_activity(NEW.thread_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.refresh_forum_thread_last_activity(OLD.thread_id);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.thread_id IS DISTINCT FROM OLD.thread_id THEN
      PERFORM public.refresh_forum_thread_last_activity(OLD.thread_id);
      PERFORM public.refresh_forum_thread_last_activity(NEW.thread_id);
    ELSIF NEW.is_active IS DISTINCT FROM OLD.is_active
       OR NEW.is_spam IS DISTINCT FROM OLD.is_spam
       OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      PERFORM public.refresh_forum_thread_last_activity(NEW.thread_id);
    END IF;
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS forum_replies_activity_sync ON public.forum_replies;
CREATE TRIGGER forum_replies_activity_sync
AFTER INSERT OR UPDATE OF thread_id, is_active, is_spam, created_at OR DELETE
ON public.forum_replies
FOR EACH ROW
EXECUTE FUNCTION public.handle_forum_reply_activity();

UPDATE public.forum_threads ft
SET last_activity_at = COALESCE(
  (
    SELECT MAX(fr.created_at)
    FROM public.forum_replies fr
    WHERE fr.thread_id = ft.id
      AND fr.is_active = true
      AND fr.is_spam = false
  ),
  ft.created_at
);

CREATE OR REPLACE FUNCTION public.sync_forum_thread_redirect()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_target text;
  v_old_source text;
BEGIN
  IF NEW.slug IS NOT DISTINCT FROM OLD.slug THEN
    RETURN NEW;
  END IF;

  v_new_target := '/forum/' || NEW.slug;
  v_old_source := '/forum/' || OLD.slug;

  UPDATE public.forum_redirects
  SET target_path = v_new_target,
      is_active = true,
      updated_at = now()
  WHERE entity_type = 'thread'
    AND entity_id = NEW.id;

  IF v_old_source <> v_new_target THEN
    INSERT INTO public.forum_redirects (
      source_path,
      target_path,
      entity_type,
      entity_id,
      is_active
    )
    VALUES (
      v_old_source,
      v_new_target,
      'thread',
      NEW.id,
      true
    )
    ON CONFLICT (source_path) DO UPDATE
    SET target_path = EXCLUDED.target_path,
        entity_type = EXCLUDED.entity_type,
        entity_id = EXCLUDED.entity_id,
        is_active = true,
        updated_at = now();
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_forum_category_redirect()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_target text;
  v_old_source text;
BEGIN
  IF NEW.slug IS NOT DISTINCT FROM OLD.slug THEN
    RETURN NEW;
  END IF;

  v_new_target := '/forum/kategorie/' || NEW.slug;
  v_old_source := '/forum/kategorie/' || OLD.slug;

  UPDATE public.forum_redirects
  SET target_path = v_new_target,
      is_active = true,
      updated_at = now()
  WHERE entity_type = 'category'
    AND entity_id = NEW.id;

  IF v_old_source <> v_new_target THEN
    INSERT INTO public.forum_redirects (
      source_path,
      target_path,
      entity_type,
      entity_id,
      is_active
    )
    VALUES (
      v_old_source,
      v_new_target,
      'category',
      NEW.id,
      true
    )
    ON CONFLICT (source_path) DO UPDATE
    SET target_path = EXCLUDED.target_path,
        entity_type = EXCLUDED.entity_type,
        entity_id = EXCLUDED.entity_id,
        is_active = true,
        updated_at = now();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS forum_threads_slug_redirect_sync ON public.forum_threads;
CREATE TRIGGER forum_threads_slug_redirect_sync
AFTER UPDATE OF slug ON public.forum_threads
FOR EACH ROW
WHEN (OLD.slug IS DISTINCT FROM NEW.slug)
EXECUTE FUNCTION public.sync_forum_thread_redirect();

DROP TRIGGER IF EXISTS forum_categories_slug_redirect_sync ON public.forum_categories;
CREATE TRIGGER forum_categories_slug_redirect_sync
AFTER UPDATE OF slug ON public.forum_categories
FOR EACH ROW
WHEN (OLD.slug IS DISTINCT FROM NEW.slug)
EXECUTE FUNCTION public.sync_forum_category_redirect();

NOTIFY pgrst, 'reload schema';

COMMIT;
