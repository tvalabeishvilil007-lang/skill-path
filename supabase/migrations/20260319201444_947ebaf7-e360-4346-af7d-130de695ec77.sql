
CREATE TYPE public.request_status AS ENUM (
  'new', 'in_progress', 'awaiting_payment', 'paid', 'access_granted', 'rejected'
);

CREATE TABLE public.requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  telegram text NOT NULL,
  phone text,
  comment text,
  status public.request_status NOT NULL DEFAULT 'new',
  manager_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own requests" ON public.requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create requests" ON public.requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all requests" ON public.requests
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Managers can manage all requests" ON public.requests
  FOR ALL USING (public.has_role(auth.uid(), 'manager'));

CREATE TRIGGER update_requests_updated_at
  BEFORE UPDATE ON public.requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
