import { supabase } from "@/integrations/supabase/client";

type Bucket = 'course-videos' | 'course-materials' | 'course-covers';

export async function uploadFile(bucket: Bucket, file: File, path?: string) {
  const ext = file.name.split('.').pop() || '';
  const filePath = path || `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, { upsert: true });
  
  if (error) throw error;
  return data.path;
}

export async function deleteFile(bucket: Bucket, path: string) {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

export function getPublicUrl(bucket: Bucket, path: string) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function getSignedUrl(bucket: Bucket, path: string, expiresIn = 3600) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}
