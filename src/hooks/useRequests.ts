import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useUserRequests = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["user-requests", userId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("requests")
        .select("*, courses(title, cover_url, price, currency)")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};
