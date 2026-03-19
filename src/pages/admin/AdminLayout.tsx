import { Outlet, Navigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel,
  SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard, FolderOpen, BookOpen, Layers, Play, CreditCard,
  Users, Receipt, Loader2, FileText, ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/categories", label: "Категории", icon: FolderOpen },
  { to: "/admin/courses", label: "Курсы", icon: BookOpen },
  { to: "/admin/modules", label: "Модули", icon: Layers },
  { to: "/admin/lessons", label: "Уроки", icon: Play },
  { to: "/admin/materials", label: "Материалы", icon: FileText },
  { to: "/admin/plans", label: "Тарифы", icon: CreditCard },
  { to: "/admin/users", label: "Пользователи", icon: Users },
  { to: "/admin/orders", label: "Заказы", icon: Receipt },
];

const AdminLayout = () => {
  const { user, loading } = useAuth();

  const { data: isAdmin, isLoading: roleLoading } = useQuery({
    queryKey: ["admin-role", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.rpc("has_role", { _user_id: user!.id, _role: "admin" });
      return !!data;
    },
  });

  if (loading || roleLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (!user || !isAdmin) return <Navigate to="/" replace />;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs uppercase tracking-wider">CMS Платформы</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton asChild>
                        <NavLink to={item.to} end={item.end} className="hover:bg-muted/50" activeClassName="bg-primary/10 text-primary font-medium">
                          <item.icon className="mr-2 h-4 w-4" />
                          <span>{item.label}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b border-border flex items-center px-4 gap-3 shrink-0 bg-background">
            <SidebarTrigger />
            <span className="text-sm font-medium text-muted-foreground">Админ-панель</span>
            <div className="ml-auto">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/" className="gap-1.5"><ArrowLeft className="h-3.5 w-3.5" /> На сайт</Link>
              </Button>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
