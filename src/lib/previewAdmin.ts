import { supabase } from "@/integrations/supabase/client";

const PREVIEW_HOST_MATCHERS = [
  /(^|\.)localhost$/,
  /(^|\.)127\.0\.0\.1$/,
  /(^|\.)lovable\.app$/,
  /(^|\.)lovableproject\.com$/,
];

export function isPreviewEnvironment() {
  if (typeof window === "undefined") return false;

  return import.meta.env.DEV || PREVIEW_HOST_MATCHERS.some((pattern) => pattern.test(window.location.hostname));
}

export async function requestPreviewAdminAccess() {
  const { data, error } = await supabase.functions.invoke("preview-admin-bootstrap");

  if (error) {
    throw new Error(error.message || "Не удалось выдать admin-доступ");
  }

  return data;
}
