
-- Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'new_course',
  title text NOT NULL,
  message text NOT NULL,
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can manage all notifications
CREATE POLICY "Admins can manage notifications"
  ON public.notifications FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Function to create notifications for all users when course is first published
CREATE OR REPLACE FUNCTION public.notify_new_course()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only fire when status changes TO 'published' (not already published before)
  IF NEW.status = 'published' AND (OLD.status IS DISTINCT FROM 'published') THEN
    INSERT INTO public.notifications (user_id, type, title, message, course_id)
    SELECT
      ur.user_id,
      'new_course',
      'Новый курс',
      'Добавлен новый курс: ' || NEW.title,
      NEW.id
    FROM public.user_roles ur
    WHERE ur.role = 'user';
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger on courses update
CREATE TRIGGER on_course_published
  AFTER UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_course();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
