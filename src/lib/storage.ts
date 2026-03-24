import { supabase } from "@/integrations/supabase/client";

type Bucket = "course-videos" | "course-materials" | "course-covers";

export async function uploadFile(bucket: Bucket, file: File, path?: string) {
  const cleanFileName = file.name
    .toLowerCase()
    .replace(/[^a-z0-9.\-]/g, "_");

  let filePath: string;

  if (path) {
    const parts = path.split("/");
    const originalName = parts.pop() || `${Date.now()}-${cleanFileName}`;
    const folder = parts.join("/");

    const safeName = originalName
      .toLowerCase()
      .replace(/[^a-z0-9.\-]/g, "_");

    filePath = folder ? `${folder}/${safeName}` : safeName;
  } else {
    filePath = `${Date.now()}-${cleanFileName}`;
  }

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
