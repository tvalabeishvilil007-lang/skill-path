import { Outlet, Navigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel,
  SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard, FolderOpen, BookOpen, Layers, Play,
  Users, Receipt, Loader2, FileText, ArrowLeft, ShieldCheck, ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS, useUserRole } from "@/hooks/useUserRole";

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
  const { isAdmin, isLoading: roleLoading, role, isAuthError } = useUserRole();

  if (loading || roleLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!user || isAuthError) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/access-denied" replace />;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs uppercase tracking-wider">CMS платформы</SidebarGroupLabel>
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
            <div className="ml-auto flex items-center gap-3">
              <Badge variant="secondary" className="gap-1.5 hidden sm:inline-flex">
                <ShieldCheck className="h-3.5 w-3.5" />
                {role ? ROLE_LABELS[role] : "Admin"}
              </Badge>
              <span className="hidden md:block text-xs text-muted-foreground">{user.email}</span>
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
