
CREATE TABLE IF NOT EXISTS public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  period_days integer,
  description text,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  excluded_features jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  is_recommended boolean NOT NULL DEFAULT false,
  categories_open integer NOT NULL DEFAULT 0,
  materials_open integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage plans" ON public.plans FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can read active plans" ON public.plans FOR SELECT USING (is_active = true);

INSERT INTO public.plans (name, slug, price, period_days, description, features, excluded_features, is_recommended, categories_open, materials_open, sort_order) VALUES
('Базовый', 'basic', 2990, 30, 'Доступ на 1 месяц', '["Доступ к библиотеке (3 категории)", "Личный кабинет с прогрессом", "Видеоуроки в HD-качестве", "Доступ с любого устройства"]'::jsonb, '["Скачиваемые материалы", "Приоритетные обновления", "Приватное комьюнити"]'::jsonb, false, 3, 15, 1),
('Оптимальный', 'optimal', 6990, 90, 'Доступ на 3 месяца', '["Всё из Базового тарифа", "5 категорий материалов", "Скачиваемые материалы и шаблоны", "Приоритетные обновления", "Поддержка участников"]'::jsonb, '["Бессрочный доступ", "Приватное комьюнити"]'::jsonb, true, 5, 35, 2),
('Premium', 'premium', 14990, NULL, 'Бессрочный доступ', '["Всё из Оптимального тарифа", "Все 6 категорий без ограничений", "Бессрочный доступ", "Приватное комьюнити", "Персональная поддержка", "Ранний доступ к новым материалам"]'::jsonb, '[]'::jsonb, false, 6, 50, 3);
