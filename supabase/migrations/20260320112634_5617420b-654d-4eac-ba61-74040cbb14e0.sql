
-- Drop old trigger (only on UPDATE)
DROP TRIGGER IF EXISTS on_course_published ON public.courses;

-- Replace function to handle both INSERT and UPDATE, with dedup
CREATE OR REPLACE FUNCTION public.notify_new_course()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only if new status is published
  IF NEW.status = 'published' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'published') THEN
    -- Skip if notifications already exist for this course
    IF NOT EXISTS (SELECT 1 FROM public.notifications WHERE course_id = NEW.id AND type = 'new_course' LIMIT 1) THEN
      INSERT INTO public.notifications (user_id, type, title, message, course_id)
      SELECT ur.user_id, 'new_course', 'Новый курс', 'Добавлен новый курс: ' || NEW.title, NEW.id
      FROM public.user_roles ur
      WHERE ur.role = 'user';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for both INSERT and UPDATE
CREATE TRIGGER on_course_published
  AFTER INSERT OR UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_course();
