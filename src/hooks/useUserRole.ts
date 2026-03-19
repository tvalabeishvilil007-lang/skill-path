import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "moderator" | "content_manager" | "user";

const ROLE_PRIORITY: AppRole[] = ["admin", "content_manager", "moderator", "user"];

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Admin",
  content_manager: "Content manager",
  moderator: "Moderator",
  user: "Member",
};

export function useUserRole() {
  const { user, loading: authLoading } = useAuth();

  const query = useQuery({
    queryKey: ["user-role", user?.id],
    enabled: !authLoading && !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id);

      if (error) throw error;

      const roles = (data ?? []).map((item) => item.role as AppRole);
      const primaryRole = ROLE_PRIORITY.find((role) => roles.includes(role)) ?? null;

      return {
        roles,
        role: primaryRole,
      };
    },
  });

  return {
    role: query.data?.role ?? null,
    roles: query.data?.roles ?? [],
    isAdmin: query.data?.role === "admin",
    isLoading: authLoading || query.isLoading,
    error: query.error,
  };
}
