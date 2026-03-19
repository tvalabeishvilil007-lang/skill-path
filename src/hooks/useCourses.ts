import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCourses = () => {
  return useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*, categories(name)")
        .eq("status", "published")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useCourseBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["course", slug],
    queryFn: async () => {
      const { data: course, error } = await supabase
        .from("courses")
        .select("*, categories(name)")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (error) throw error;
      if (!course) return null;

      const { data: modules } = await supabase
        .from("modules")
        .select("*, lessons(*)")
        .eq("course_id", course.id)
        .eq("is_published", true)
        .order("sort_order");

      return { ...course, modules: modules ?? [] };
    },
    enabled: !!slug,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });
};

export const useUserCourses = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["user-courses", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("access_rights")
        .select("*, courses(*, categories(name))")
        .eq("user_id", userId!)
        .eq("status", "active");
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useUserOrders = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["user-orders", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, courses(title)")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useCourseProgress = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["course-progress", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_progress")
        .select("*")
        .eq("user_id", userId!);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};
