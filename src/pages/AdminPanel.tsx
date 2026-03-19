import { useState } from "react";
import { Link } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Users,
  ShoppingCart,
  Tag,
  FileText,
  Search,
  Plus,
  MoreHorizontal,
  TrendingUp,
  DollarSign,
  Loader2,
} from "lucide-react";

const formatPrice = (n: number) => new Intl.NumberFormat("ru-RU").format(n) + " ₽";

const adminSidebarLinks = [
  { icon: LayoutDashboard, label: "Дашборд", tab: "dashboard" },
  { icon: BookOpen, label: "Курсы", tab: "courses" },
  { icon: FileText, label: "Уроки", tab: "lessons" },
  { icon: Users, label: "Пользователи", tab: "users" },
  { icon: ShoppingCart, label: "Заказы", tab: "orders" },
  { icon: Tag, label: "Промокоды", tab: "promos" },
];

const mockUsers = [
  { id: "1", name: "Анна Козлова", email: "anna@test.com", role: "user", status: "active", created: "2026-01-15" },
  { id: "2", name: "Михаил Петров", email: "mikhail@test.com", role: "admin", status: "active", created: "2025-12-20" },
  { id: "3", name: "Елена Сидорова", email: "elena@test.com", role: "user", status: "active", created: "2026-02-10" },
];

const mockOrders = [
  { id: "ORD-001", user: "Анна Козлова", course: "Веб-разработка", amount: 12990, status: "paid", date: "2026-03-15", method: "Карта" },
  { id: "ORD-002", user: "Михаил Петров", course: "UX/UI Дизайн", amount: 15990, status: "pending_payment", date: "2026-03-18", method: "—" },
  { id: "ORD-003", user: "Елена Сидорова", course: "Python", amount: 9990, status: "refunded", date: "2026-03-10", method: "Карта" },
];

const mockPromos = [
  { code: "WELCOME20", discount: "20%", type: "percent", uses: 45, limit: 100, active: true },
  { code: "VIP50", discount: "50%", type: "percent", uses: 12, limit: 20, active: true },
  { code: "SALE1000", discount: "1 000 ₽", type: "fixed", uses: 30, limit: 30, active: false },
];

const statusMap: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "outline" }> = {
  paid: { label: "Оплачен", variant: "success" },
  pending_payment: { label: "Ожидает оплаты", variant: "warning" },
  refunded: { label: "Возвращён", variant: "destructive" },
  rejected: { label: "Отклонён", variant: "destructive" },
  created: { label: "Создан", variant: "outline" },
};

const AdminPanel = () => {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-border bg-sidebar hidden md:flex flex-col">
        <div className="p-4 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2 font-bold text-sm">
            <div className="rounded-xl bg-sidebar-primary/10 p-1.5">
              <GraduationCap className="h-5 w-5 text-sidebar-primary" />
            </div>
            <div>
              <span className="text-sidebar-foreground">Admin Panel</span>
              <p className="text-[10px] text-sidebar-foreground/50 font-normal">EduPlatform</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {adminSidebarLinks.map((link) => (
            <button
              key={link.tab}
              onClick={() => setActiveTab(link.tab)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                activeTab === link.tab
                  ? "bg-sidebar-primary/10 text-sidebar-primary font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <link.icon className="h-4 w-4 shrink-0" />
              <span>{link.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <Button variant="ghost" size="sm" asChild className="w-full justify-start text-sidebar-foreground/70">
            <Link to="/dashboard">← Личный кабинет</Link>
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8 max-w-7xl space-y-8">
          {/* Dashboard */}
          {activeTab === "dashboard" && (
            <>
              <h1 className="text-2xl font-bold">Дашборд</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={BookOpen} title="Курсов" value="12" change="+2 за месяц" changeType="positive" />
                <StatCard icon={Users} title="Пользователей" value="1 250" change="+86 за месяц" changeType="positive" />
                <StatCard icon={ShoppingCart} title="Заказов" value="324" change="+24 за неделю" changeType="positive" />
                <StatCard icon={DollarSign} title="Доход" value="₽ 2.4M" change="+12% vs прошлый месяц" changeType="positive" />
              </div>
            </>
          )}

          {/* Courses */}
          {activeTab === "courses" && (
            <>
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Курсы</h1>
                <Button><Plus className="h-4 w-4 mr-2" />Создать курс</Button>
              </div>
              <div className="flex gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Поиск курсов..." className="pl-11 h-11 rounded-xl bg-card border-border" />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[140px] h-11 rounded-xl bg-card border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все</SelectItem>
                    <SelectItem value="published">Опубликован</SelectItem>
                    <SelectItem value="draft">Черновик</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      {["Название", "Статус", "Цена", "Студенты", ""].map((h) => (
                        <th key={h} className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { title: "Веб-разработка с нуля", status: "published", price: 12990, students: 456 },
                      { title: "UX/UI Дизайн", status: "published", price: 15990, students: 234 },
                      { title: "Python для начинающих", status: "draft", price: 9990, students: 0 },
                    ].map((c) => (
                      <tr key={c.title} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-4 text-sm font-medium">{c.title}</td>
                        <td className="p-4">
                          <Badge variant={c.status === "published" ? "success" : "outline"}>
                            {c.status === "published" ? "Опубликован" : "Черновик"}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm">{formatPrice(c.price)}</td>
                        <td className="p-4 text-sm text-muted-foreground">{c.students}</td>
                        <td className="p-4">
                          <Button size="sm" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Lessons */}
          {activeTab === "lessons" && (
            <>
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Уроки</h1>
                <Button><Plus className="h-4 w-4 mr-2" />Добавить урок</Button>
              </div>
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      {["Урок", "Курс", "Тип", "Опубликован", ""].map((h) => (
                        <th key={h} className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { title: "Введение в HTML", course: "Веб-разработка", type: "video", published: true },
                      { title: "Основы CSS", course: "Веб-разработка", type: "video", published: true },
                      { title: "Figma для начинающих", course: "UX/UI Дизайн", type: "video", published: false },
                    ].map((l) => (
                      <tr key={l.title} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-4 text-sm font-medium">{l.title}</td>
                        <td className="p-4 text-sm text-muted-foreground">{l.course}</td>
                        <td className="p-4"><Badge variant="outline">{l.type}</Badge></td>
                        <td className="p-4">
                          <Badge variant={l.published ? "success" : "outline"}>
                            {l.published ? "Да" : "Нет"}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Button size="sm" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Users */}
          {activeTab === "users" && (
            <>
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Пользователи</h1>
              </div>
              <div className="relative max-w-sm">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Поиск пользователей..." className="pl-11 h-11 rounded-xl bg-card border-border" />
              </div>
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      {["Имя", "Email", "Роль", "Статус", "Дата регистрации"].map((h) => (
                        <th key={h} className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mockUsers.map((u) => (
                      <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-4 text-sm font-medium">{u.name}</td>
                        <td className="p-4 text-sm text-muted-foreground">{u.email}</td>
                        <td className="p-4">
                          <Badge variant={u.role === "admin" ? "accent" : "outline"}>{u.role}</Badge>
                        </td>
                        <td className="p-4"><Badge variant="success">Активен</Badge></td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {new Date(u.created).toLocaleDateString("ru-RU")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Orders */}
          {activeTab === "orders" && (
            <>
              <h1 className="text-2xl font-bold">Заказы</h1>
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      {["ID", "Пользователь", "Курс", "Сумма", "Метод", "Статус", "Дата"].map((h) => (
                        <th key={h} className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mockOrders.map((o) => {
                      const st = statusMap[o.status] || statusMap.created;
                      return (
                        <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="p-4 text-sm font-mono text-muted-foreground">{o.id}</td>
                          <td className="p-4 text-sm font-medium">{o.user}</td>
                          <td className="p-4 text-sm text-muted-foreground">{o.course}</td>
                          <td className="p-4 text-sm font-medium">{formatPrice(o.amount)}</td>
                          <td className="p-4 text-sm text-muted-foreground">{o.method}</td>
                          <td className="p-4"><Badge variant={st.variant}>{st.label}</Badge></td>
                          <td className="p-4 text-sm text-muted-foreground">{new Date(o.date).toLocaleDateString("ru-RU")}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Promo Codes */}
          {activeTab === "promos" && (
            <>
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Промокоды</h1>
                <Button><Plus className="h-4 w-4 mr-2" />Создать промокод</Button>
              </div>
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      {["Код", "Скидка", "Использований", "Лимит", "Статус"].map((h) => (
                        <th key={h} className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mockPromos.map((p) => (
                      <tr key={p.code} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-4 text-sm font-mono font-medium">{p.code}</td>
                        <td className="p-4 text-sm">{p.discount}</td>
                        <td className="p-4 text-sm text-muted-foreground">{p.uses}</td>
                        <td className="p-4 text-sm text-muted-foreground">{p.limit}</td>
                        <td className="p-4">
                          <Badge variant={p.active ? "success" : "outline"}>
                            {p.active ? "Активен" : "Неактивен"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
