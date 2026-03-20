import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, BookOpen, Receipt, CreditCard, Loader2, TrendingUp,
  Layers, ShoppingBag, PackageOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const AdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [users, courses, orders, access, categories] = await Promise.all([
        supabase.from("profiles").select("id, created_at, name, email", { count: "exact", head: false }).order("created_at", { ascending: false }).limit(5),
        supabase.from("courses").select("id, title, status, created_at", { count: "exact", head: false }),
        supabase.from("orders").select("id, amount, payment_status, created_at, courses(title)", { count: "exact", head: false }).order("created_at", { ascending: false }).limit(10),
        supabase.from("access_rights").select("id, status", { count: "exact", head: false }).eq("status", "active"),
        supabase.from("categories").select("id", { count: "exact", head: true }),
      ]);
      return {
        totalUsers: users.count || 0,
        recentUsers: users.data || [],
        totalCourses: courses.count || 0,
        courses: courses.data || [],
        totalOrders: orders.count || 0,
        recentOrders: orders.data || [],
        activeAccess: access.count || 0,
        totalCategories: categories.count || 0,
        paidOrders: (orders.data || []).filter((o) => o.payment_status === "paid"),
        totalRevenue: (orders.data || []).filter((o) => o.payment_status === "paid").reduce((s, o) => s + Number(o.amount), 0),
      };
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="h-9 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-card border border-border/50 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="h-72 rounded-2xl bg-card border border-border/50 animate-pulse" />
          <div className="h-72 rounded-2xl bg-card border border-border/50 animate-pulse" />
        </div>
      </div>
    );
  }

  const metricCards = [
    {
      label: "Пользователи",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
      borderAccent: "border-primary/20",
    },
    {
      label: "Активные доступы",
      value: stats?.activeAccess || 0,
      icon: CreditCard,
      color: "text-success",
      bg: "bg-success/10",
      borderAccent: "border-success/20",
    },
    {
      label: "Курсов",
      value: stats?.totalCourses || 0,
      icon: BookOpen,
      color: "text-accent",
      bg: "bg-accent/10",
      borderAccent: "border-accent/20",
    },
    {
      label: "Заказов",
      value: stats?.totalOrders || 0,
      icon: ShoppingBag,
      color: "text-warning",
      bg: "bg-warning/10",
      borderAccent: "border-warning/20",
    },
    {
      label: "Категорий",
      value: stats?.totalCategories || 0,
      icon: Layers,
      color: "text-info",
      bg: "bg-info/10",
      borderAccent: "border-info/20",
    },
  ];

  const statusCls: Record<string, string> = {
    paid: "bg-success/10 text-success border-success/20",
    created: "bg-muted text-muted-foreground border-border",
    pending_payment: "bg-warning/10 text-warning border-warning/20",
    waiting_admin: "bg-warning/10 text-warning border-warning/20",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const statusLabel: Record<string, string> = {
    paid: "Оплачен",
    created: "Создан",
    pending_payment: "Ожидает оплаты",
    waiting_admin: "На проверке",
    rejected: "Отклонён",
  };

  return (
    <div className="space-y-7 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Обзор ключевых показателей платформы</p>
      </div>

      {/* Revenue highlight */}
      <Card className="border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card relative overflow-hidden group hover:border-primary/30 transition-all duration-300">
        <CardContent className="p-6 flex items-center justify-between relative z-10">
          <div className="space-y-1.5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Общая выручка</p>
            <p className="text-4xl font-extrabold tracking-tight text-foreground">
              {new Intl.NumberFormat("ru-RU").format(stats?.totalRevenue || 0)}{" "}
              <span className="text-lg font-medium text-muted-foreground">₽</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {stats?.paidOrders?.length || 0} оплаченных заказов
            </p>
          </div>
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <TrendingUp className="h-7 w-7 text-primary" />
          </div>
        </CardContent>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/3 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      </Card>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {metricCards.map((c) => (
          <Card
            key={c.label}
            className={`border ${c.borderAccent} hover:border-opacity-60 group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10`}
          >
            <CardContent className="p-5 space-y-4">
              <div className={`rounded-xl ${c.bg} w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <c.icon className={`h-5 w-5 ${c.color}`} />
              </div>
              <div>
                <p className="text-3xl font-bold tracking-tight">{c.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{c.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent orders */}
        <Card className="border border-border/60">
          <CardContent className="p-0">
            <div className="p-5 border-b border-border/50">
              <h2 className="font-semibold text-sm">Последние заказы</h2>
            </div>
            {(!stats?.recentOrders || stats.recentOrders.length === 0) ? (
              <div className="p-10 flex flex-col items-center justify-center text-center">
                <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
                  <PackageOpen className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Заказов пока нет</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Здесь появятся оплаченные заказы</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {stats.recentOrders.slice(0, 5).map((o: any) => (
                  <div key={o.id} className="px-5 py-3.5 flex items-center justify-between text-sm hover:bg-muted/20 transition-colors">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{o.courses?.title || "—"}</p>
                      <p className="text-xs text-muted-foreground/70 mt-0.5">
                        {new Date(o.created_at).toLocaleDateString("ru-RU")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-semibold tabular-nums">
                        {new Intl.NumberFormat("ru-RU").format(Number(o.amount))} ₽
                      </span>
                      <Badge className={`${statusCls[o.payment_status] || "bg-muted text-muted-foreground"} border text-[10px]`}>
                        {statusLabel[o.payment_status] || o.payment_status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent users */}
        <Card className="border border-border/60">
          <CardContent className="p-0">
            <div className="p-5 border-b border-border/50">
              <h2 className="font-semibold text-sm">Новые пользователи</h2>
            </div>
            {(!stats?.recentUsers || stats.recentUsers.length === 0) ? (
              <div className="p-10 flex flex-col items-center justify-center text-center">
                <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
                  <Users className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Нет пользователей</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Здесь появятся новые регистрации</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {stats.recentUsers.map((u: any) => (
                  <div key={u.id} className="px-5 py-3.5 flex items-center justify-between text-sm hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-primary">
                          {(u.name || u.email || "?").slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{u.name || "—"}</p>
                        <p className="text-xs text-muted-foreground/70 truncate">{u.email}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground/60 shrink-0">
                      {new Date(u.created_at).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
