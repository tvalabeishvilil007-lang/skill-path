import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, BookOpen, Receipt, CreditCard, Loader2, TrendingUp } from "lucide-react";
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

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const cards = [
    { label: "Пользователи", value: stats?.totalUsers || 0, icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: "Активные доступы", value: stats?.activeAccess || 0, icon: CreditCard, color: "text-success", bg: "bg-success/10" },
    { label: "Курсов", value: stats?.totalCourses || 0, icon: BookOpen, color: "text-accent", bg: "bg-accent/10" },
    { label: "Заказов", value: stats?.totalOrders || 0, icon: Receipt, color: "text-warning", bg: "bg-warning/10" },
    { label: "Категорий", value: stats?.totalCategories || 0, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
    { label: "Выручка", value: `${new Intl.NumberFormat("ru-RU").format(stats?.totalRevenue || 0)} ₽`, icon: Receipt, color: "text-success", bg: "bg-success/10" },
  ];

  const statusCls: Record<string, string> = {
    paid: "bg-success/10 text-success border-success/20",
    created: "bg-muted text-muted-foreground border-border",
    pending_payment: "bg-warning/10 text-warning border-warning/20",
    waiting_admin: "bg-warning/10 text-warning border-warning/20",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="rounded-2xl">
            <CardContent className="p-4 space-y-3">
              <div className={`rounded-xl ${c.bg} w-10 h-10 flex items-center justify-center`}>
                <c.icon className={`h-5 w-5 ${c.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{c.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{c.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl">
          <CardContent className="p-0">
            <div className="p-5 border-b border-border">
              <h2 className="font-bold">Последние заказы</h2>
            </div>
            <div className="divide-y divide-border">
              {(stats?.recentOrders || []).slice(0, 5).map((o: any) => (
                <div key={o.id} className="px-5 py-3.5 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{o.courses?.title || "—"}</p>
                    <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString("ru-RU")}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{new Intl.NumberFormat("ru-RU").format(Number(o.amount))} ₽</span>
                    <Badge className={`${statusCls[o.payment_status] || "bg-muted text-muted-foreground"} border text-xs`}>
                      {o.payment_status}
                    </Badge>
                  </div>
                </div>
              ))}
              {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                <p className="p-5 text-sm text-muted-foreground">Нет заказов</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-0">
            <div className="p-5 border-b border-border">
              <h2 className="font-bold">Новые пользователи</h2>
            </div>
            <div className="divide-y divide-border">
              {(stats?.recentUsers || []).map((u: any) => (
                <div key={u.id} className="px-5 py-3.5 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{u.name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString("ru-RU")}</span>
                </div>
              ))}
              {(!stats?.recentUsers || stats.recentUsers.length === 0) && (
                <p className="p-5 text-sm text-muted-foreground">Нет пользователей</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
