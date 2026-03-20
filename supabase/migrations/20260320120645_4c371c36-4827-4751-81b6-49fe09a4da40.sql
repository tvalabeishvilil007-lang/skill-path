-- Create private storage bucket for course videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('course-videos', 'course-videos', false, 524288000, ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']);

-- Create private storage bucket for course materials
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('course-materials', 'course-materials', false, 104857600, ARRAY[
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'application/x-zip-compressed',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain'
]);

-- Create public storage bucket for course covers
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('course-covers', 'course-covers', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

-- RLS policies for course-videos bucket
CREATE POLICY "Admins can manage course videos"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'course-videos' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'course-videos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users with access can view course videos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'course-videos'
  AND EXISTS (
    SELECT 1 FROM public.lessons l
    JOIN public.modules m ON m.id = l.module_id
    JOIN public.access_rights ar ON ar.course_id = m.course_id
    WHERE l.video_url = storage.objects.name
    AND ar.user_id = auth.uid()
    AND ar.status = 'active'
  )
);

-- RLS policies for course-materials bucket
CREATE POLICY "Admins can manage course materials"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'course-materials' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'course-materials' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users with access can view course materials"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'course-materials'
  AND EXISTS (
    SELECT 1 FROM public.lesson_materials lm
    JOIN public.lessons l ON l.id = lm.lesson_id
    JOIN public.modules m ON m.id = l.module_id
    JOIN public.access_rights ar ON ar.course_id = m.course_id
    WHERE lm.file_url = storage.objects.name
    AND ar.user_id = auth.uid()
    AND ar.status = 'active'
  )
);

-- RLS policies for course-covers bucket
CREATE POLICY "Anyone can view course covers"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'course-covers');

CREATE POLICY "Admins can manage course covers"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'course-covers' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'course-covers' AND public.has_role(auth.uid(), 'admin'));

-- Function to auto-generate unique slug from title
CREATE OR REPLACE FUNCTION public.generate_unique_slug(
  p_title text,
  p_table text,
  p_existing_id uuid DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 1;
  slug_exists boolean;
BEGIN
  base_slug := lower(p_title);
  base_slug := translate(base_slug,
    'абвгдеёжзийклмнопрстуфхцчшщъыьэюя',
    'abvgdeezziiklmnoprstufhccsss_y_eua');
  base_slug := regexp_replace(base_slug, '[^a-z0-9]+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  IF base_slug = '' THEN base_slug := 'item'; END IF;

  final_slug := base_slug;

  LOOP
    IF p_table = 'courses' THEN
      SELECT EXISTS(SELECT 1 FROM courses WHERE slug = final_slug AND (p_existing_id IS NULL OR id != p_existing_id)) INTO slug_exists;
    ELSIF p_table = 'lessons' THEN
      SELECT EXISTS(SELECT 1 FROM lessons WHERE slug = final_slug AND (p_existing_id IS NULL OR id != p_existing_id)) INTO slug_exists;
    ELSE
      slug_exists := false;
    END IF;

    EXIT WHEN NOT slug_exists;
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  RETURN final_slug;
END;
$$;