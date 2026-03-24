
-- Payment settings (admin-managed payment details)
CREATE TABLE public.payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_details text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  set_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage payment settings" ON public.payment_settings
  FOR ALL TO public USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated can read active settings" ON public.payment_settings
  FOR SELECT TO authenticated USING (is_active = true);

-- Payment requests
CREATE TABLE public.payment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid NOT NULL REFERENCES public.courses(id),
  status text NOT NULL DEFAULT 'created',
  payment_details_snapshot text,
  receipt_url text,
  receipt_file_type text,
  admin_id uuid,
  access_source text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payment requests" ON public.payment_requests
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create own payment requests" ON public.payment_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payment requests" ON public.payment_requests
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all payment requests" ON public.payment_requests
  FOR ALL TO public USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Managers can manage all payment requests" ON public.payment_requests
  FOR ALL TO public USING (has_role(auth.uid(), 'manager'::app_role));

-- Payment messages (chat)
CREATE TABLE public.payment_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_request_id uuid NOT NULL REFERENCES public.payment_requests(id) ON DELETE CASCADE,
  sender_id uuid,
  sender_type text NOT NULL DEFAULT 'system',
  message_type text NOT NULL DEFAULT 'text',
  content text NOT NULL,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages of own requests" ON public.payment_messages
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.payment_requests pr WHERE pr.id = payment_request_id AND pr.user_id = auth.uid())
  );

CREATE POLICY "Users can send messages to own requests" ON public.payment_messages
  FOR INSERT TO authenticated WITH CHECK (
    sender_type = 'client' AND sender_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.payment_requests pr WHERE pr.id = payment_request_id AND pr.user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all messages" ON public.payment_messages
  FOR ALL TO public USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Managers can manage all messages" ON public.payment_messages
  FOR ALL TO public USING (has_role(auth.uid(), 'manager'::app_role));

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.payment_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payment_requests;

-- Triggers for updated_at
CREATE TRIGGER update_payment_settings_updated_at BEFORE UPDATE ON public.payment_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_requests_updated_at BEFORE UPDATE ON public.payment_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
