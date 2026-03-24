import { Outlet, Navigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel,
  SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard, FolderOpen, BookOpen, Layers, Play,
  Users, Receipt, Loader2, FileText, ExternalLink, ShieldCheck, ClipboardList,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS, useUserRole } from "@/hooks/useUserRole";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const contentNav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/categories", label: "Категории", icon: FolderOpen },
  { to: "/admin/courses", label: "Курсы", icon: BookOpen },
  { to: "/admin/modules", label: "Модули", icon: Layers },
  { to: "/admin/lessons", label: "Уроки", icon: Play },
];

const salesNav = [
  { to: "/admin/requests", label: "Заявки", icon: ClipboardList },
  { to: "/admin/payments", label: "Оплаты", icon: Receipt },
  { to: "/admin/orders", label: "Заказы", icon: Receipt },
];

const managementNav = [
  { to: "/admin/users", label: "Пользователи", icon: Users },
];

const NavGroup = ({ label, items }: { label: string; items: typeof contentNav }) => (
  <SidebarGroup>
    <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.12em] font-semibold text-sidebar-foreground/40 px-3 mb-0.5">
      {label}
    </SidebarGroupLabel>
    <SidebarGroupContent>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.to}>
            <SidebarMenuButton asChild>
              <NavLink
                to={item.to}
                end={item.end}
                className="rounded-lg hover:bg-sidebar-accent/60 transition-all duration-200 text-sidebar-foreground/70 hover:text-sidebar-foreground py-2"
                activeClassName="bg-sidebar-primary/10 text-sidebar-primary font-medium !border-l-2 !border-sidebar-primary"
              >
                <item.icon className="mr-2.5 h-4 w-4 shrink-0" />
                <span className="text-[13px]">{item.label}</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
);

const AdminLayout = () => {
  const { user, loading } = useAuth();
  const { isAdmin, isLoading: roleLoading, role, isAuthError } = useUserRole();

  if (loading || roleLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!user || isAuthError) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/access-denied" replace />;

  const initials = user.email ? user.email.slice(0, 2).toUpperCase() : "AD";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="border-r border-sidebar-border">
          <SidebarContent className="py-4 gap-1">
            {/* Logo */}
            <div className="px-4 pb-4 mb-2 border-b border-sidebar-border/60">
              <Link to="/admin" className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-sidebar-foreground">Admin</p>
                  <p className="text-[10px] text-sidebar-foreground/40">Управление платформой</p>
                </div>
              </Link>
            </div>

            <NavGroup label="Контент" items={contentNav} />
            <NavGroup label="Продажи" items={salesNav} />
            <NavGroup label="Управление" items={managementNav} />
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b border-border/40 flex items-center px-5 gap-3 shrink-0 bg-surface/50 backdrop-blur-xl">
            <SidebarTrigger />
            <div className="ml-auto flex items-center gap-3">
              <Link
                to="/"
                className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                На сайт
              </Link>
              <div className="h-4 w-px bg-border/60" />
              <Badge variant="secondary" className="gap-1.5 hidden sm:inline-flex text-[10px] uppercase tracking-wider font-semibold">
                {role ? ROLE_LABELS[role] : "Admin"}
              </Badge>
              <Avatar className="h-7 w-7 border border-border/60">
                <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
          </header>
          <main className="flex-1 p-5 md:p-7 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
