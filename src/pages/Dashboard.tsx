import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, Navigate } from "react-router-dom";
import { useUserCourses, useUserOrders, useCourseProgress } from "@/hooks/useCourses";
import { useAuth } from "@/contexts/AuthContext";
import { useTier } from "@/contexts/TierContext";
import { Progress } from "@/components/ui/progress";
import { TIER_CONFIG, TIER_FEATURES, canAccess } from "@/lib/tiers";
import {
  User, BookOpen, Receipt, Play, Loader2, TrendingUp,
  Clock, Award, FolderOpen, ArrowRight, Sparkles, BarChart3,
  Library, Settings, Crown, Lock, Zap, ChevronRight, Star, Eye,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { tier } = useTier();
  const { data: accessRights, isLoading: coursesLoading } = useUserCourses(user?.id);
  const { data: orders } = useUserOrders(user?.id);
  const { data: progressData } = useCourseProgress(user?.id);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");

  useEffect(() => {
    if (user) {
      setProfileEmail(user.email || "");
      supabase.from("profiles").select("name").eq("id", user.id).maybeSingle()
        .then(({ data }) => { if (data?.name) setProfileName(data.name); });
    }
  }, [user]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to="/login" replace />;

  const handleSaveProfile = async () => {
    const { error } = await supabase.from("profiles").update({ name: profileName }).eq("id", user.id);
    if (error) toast.error("Ошибка сохранения");
    else toast.success("Профиль обновлён");
  };

  const getProgress = (courseId: string) => progressData?.find((p) => p.course_id === courseId);
  const formatPrice = (n: number) => new Intl.NumberFormat("ru-RU").format(n) + " ₽";

  const totalProgress = progressData?.length ? Math.round(progressData.reduce((s, p) => s + p.progress_percent, 0) / progressData.length) : 0;
  const totalCompleted = progressData?.reduce((s, p) => s + p.completed_lessons, 0) || 0;
  const totalLessons = progressData?.reduce((s, p) => s + p.total_lessons, 0) || 0;

  const tierConfig = TIER_CONFIG[tier.level];
  const tierFeatures = TIER_FEATURES[tier.level];
  const isPremium = tier.level === "premium";

  const statusLabels: Record<string, { label: string; cls: string }> = {
    paid: { label: "Оплачен", cls: "bg-success/10 text-success" },
    created: { label: "Создан", cls: "bg-muted text-muted-foreground" },
    pending_payment: { label: "Ожидает оплаты", cls: "bg-warning/10 text-warning" },
    waiting_admin: { label: "На проверке", cls: "bg-warning/10 text-warning" },
    rejected: { label: "Отклонён", cls: "bg-destructive/10 text-destructive" },
    refunded: { label: "Возврат", cls: "bg-muted text-muted-foreground" },
    canceled: { label: "Отменён", cls: "bg-muted text-muted-foreground" },
  };

  // Available content for tier
  const availableCategories = [
    { name: "Программирование", tier: "basic" as const },
    { name: "Дизайн", tier: "basic" as const },
    { name: "Маркетинг", tier: "basic" as const },
    { name: "Data Science", tier: "optimal" as const },
    { name: "Мобильная разработка", tier: "optimal" as const },
    { name: "Финансы", tier: "premium" as const },
  ];

  const accessibleCategories = availableCategories.filter((c) => canAccess(tier.level, c.tier));
  const lockedCategories = availableCategories.filter((c) => !canAccess(tier.level, c.tier));

  // Upsell items
  const upsellItems = tier.level !== "premium" ? [
    { label: "Продвинутые модули и практика", description: "Углублённые программы для профессионалов" },
    { label: "Скачиваемые шаблоны и материалы", description: "Рабочие файлы для реальных проектов" },
    { label: "Приватное комьюнити", description: "Общение с другими участниками платформы" },
  ] : [];

  // New materials
  const newMaterials = [
    { title: "Новый модуль: Продуктовый дизайн", badge: "Новое", color: "success" },
    { title: "Обновлённые уроки по аналитике", badge: "Обновлено", color: "primary" },
    { title: "Практические задания: верстка", badge: "Практика", color: "accent" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Welcome */}
        <section className="hero-gradient py-10 md:py-14">
          <div className="container">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isPremium ? "bg-warning/10" : "bg-primary/10"}`}>
                  {isPremium ? <Crown className="h-6 w-6 text-warning" /> : <Sparkles className="h-6 w-6 text-primary" />}
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">
                    Добро пожаловать{profileName ? `, ${profileName}` : ""}!
                  </h1>
                  <p className="text-muted-foreground text-sm">Ваше приватное пространство обучения</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={tierConfig.badgeCls + " text-xs px-3 py-1"}>
                  {isPremium && <Crown className="h-3 w-3 mr-1" />}
                  {tier.name}
                </Badge>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/my-plan" className="gap-2"><Settings className="h-4 w-4" /> Мой тариф</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/catalog" className="gap-2"><Library className="h-4 w-4" /> Библиотека</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div className="container py-8 space-y-8">
          {/* Tier + Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tier card */}
            <div className={`rounded-2xl border p-6 space-y-5 ${isPremium ? "border-warning/30 bg-card glow-accent" : "border-border bg-card"}`}>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Ваш тариф</h2>
                <Badge className={tierConfig.badgeCls}>
                  {isPremium && <Crown className="h-3 w-3 mr-1" />}
                  {tier.name}
                </Badge>
              </div>
              {tier.expiresAt && (
                <div className="text-sm text-muted-foreground">
                  Доступ до: <span className="text-foreground font-medium">{new Date(tier.expiresAt).toLocaleDateString("ru-RU")}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-surface border border-border p-3 text-center">
                  <p className="text-lg font-bold text-primary">{tier.categoriesOpen}/{tier.totalCategories}</p>
                  <p className="text-xs text-muted-foreground">Категорий</p>
                </div>
                <div className="rounded-xl bg-surface border border-border p-3 text-center">
                  <p className="text-lg font-bold text-accent">{tier.materialsOpen}/{tier.totalMaterials}</p>
                  <p className="text-xs text-muted-foreground">Материалов</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Включено в тариф</p>
                {tierFeatures.slice(0, 4).map((f) => (
                  <div key={f} className="flex items-center gap-2 text-xs">
                    <Zap className="h-3 w-3 text-success shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full gap-1.5" asChild>
                <Link to="/my-plan">
                  {tier.level !== "premium" ? <>Улучшить тариф <ArrowRight className="h-3.5 w-3.5" /></> : <>Управление доступом <ChevronRight className="h-3.5 w-3.5" /></>}
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Общий прогресс", value: `${totalProgress}%`, icon: TrendingUp, color: "text-primary" },
                { label: "Пройдено уроков", value: `${totalCompleted}/${totalLessons}`, icon: Award, color: "text-success" },
                { label: "Активных программ", value: `${accessRights?.length || 0}`, icon: FolderOpen, color: "text-accent" },
                { label: "Покупок", value: `${orders?.length || 0}`, icon: Receipt, color: "text-warning" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-border bg-card p-5 space-y-3">
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Available by tier */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FolderOpen className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Доступно по вашему тарифу</h2>
              </div>
              <Badge variant="secondary" className="text-xs">{accessibleCategories.length} из {availableCategories.length} категорий</Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {accessibleCategories.map((c) => (
                <div key={c.name} className="rounded-xl bg-surface border border-border p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-[10px] text-success">Включено в тариф</p>
                  </div>
                </div>
              ))}
              {lockedCategories.map((c) => (
                <div key={c.name} className="rounded-xl bg-surface border border-border p-4 flex items-center gap-3 opacity-60">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground">Тариф {TIER_CONFIG[c.tier].name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* New materials */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-accent" />
              <h2 className="font-semibold">Новые материалы для вас</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {newMaterials.map((m) => (
                <div key={m.title} className="rounded-xl bg-surface border border-border p-4 space-y-2">
                  <Badge variant={m.color === "success" ? "success" : m.color === "accent" ? "accent" : "default"} className="text-[10px]">
                    {m.badge}
                  </Badge>
                  <p className="text-sm font-medium">{m.title}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          {totalLessons > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <h2 className="font-semibold">Общий прогресс</h2>
                </div>
                <span className="text-sm font-bold text-primary">{totalProgress}%</span>
              </div>
              <Progress value={totalProgress} className="h-3" />
            </div>
          )}

          {/* Upsell: what opens after upgrade */}
          {upsellItems.length > 0 && (
            <div className="rounded-2xl border border-primary/15 bg-card p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Что откроется после апгрейда</h2>
              </div>
              <div className="space-y-3">
                {upsellItems.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-xl bg-surface border border-border px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">Апгрейд</Badge>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/pricing" className="gap-1.5">Улучшить тариф <ChevronRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </div>
          )}

          {/* Premium recommendations */}
          {tier.level !== "premium" && (
            <div className="rounded-2xl border border-warning/15 bg-card p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Crown className="h-5 w-5 text-warning" />
                <h2 className="font-semibold">Premium-рекомендации</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                С Premium-доступом вы получите все категории без ограничений, бессрочный доступ и приватное комьюнити
              </p>
              <div className="grid grid-cols-3 gap-3">
                {["Все 6 категорий", "50 материалов", "Бессрочно"].map((v) => (
                  <div key={v} className="rounded-xl bg-warning/5 border border-warning/10 p-3 text-center">
                    <p className="text-sm font-semibold text-warning">{v}</p>
                  </div>
                ))}
              </div>
              <Button variant="accent" size="sm" asChild>
                <Link to="/pricing?highlight=premium" className="gap-1.5">
                  <Crown className="h-3.5 w-3.5" /> Перейти на Premium
                </Link>
              </Button>
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="courses">
            <TabsList className="mb-6">
              <TabsTrigger value="courses" className="gap-2"><BookOpen className="h-4 w-4" /> Мои материалы</TabsTrigger>
              <TabsTrigger value="purchases" className="gap-2"><Receipt className="h-4 w-4" /> Покупки</TabsTrigger>
              <TabsTrigger value="profile" className="gap-2"><Settings className="h-4 w-4" /> Профиль</TabsTrigger>
            </TabsList>

            <TabsContent value="courses">
              {coursesLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : !accessRights || accessRights.length === 0 ? (
                <div className="rounded-2xl border border-border bg-card p-12 text-center space-y-4">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Library className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">Начните изучение</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Перейдите в библиотеку и начните обучение по доступным на вашем тарифе программам
                  </p>
                  <Button asChild><Link to="/catalog" className="gap-2">Библиотека <ArrowRight className="h-4 w-4" /></Link></Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {accessRights.map((ar) => {
                    const course = ar.courses as any;
                    const progress = getProgress(ar.course_id);
                    return (
                      <div key={ar.id} className="flex flex-col sm:flex-row items-start gap-4 border border-border rounded-2xl bg-card p-5 card-hover">
                        <div className="w-full sm:w-40 aspect-video rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <BookOpen className="h-8 w-8 text-primary/40" />
                        </div>
                        <div className="flex-1 space-y-3 min-w-0">
                          <h3 className="font-semibold">{course?.title}</h3>
                          <Progress value={progress?.progress_percent || 0} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            Прогресс: {progress?.progress_percent || 0}%
                            {progress ? ` • ${progress.completed_lessons}/${progress.total_lessons} уроков` : ""}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" className="shrink-0 gap-1.5" asChild>
                          <Link to={`/course/${course?.slug}`}><Play className="h-3.5 w-3.5" /> Продолжить</Link>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="purchases">
              {!orders || orders.length === 0 ? (
                <div className="rounded-2xl border border-border bg-card p-12 text-center space-y-4">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-warning/10 flex items-center justify-center">
                    <Receipt className="h-7 w-7 text-warning" />
                  </div>
                  <h3 className="font-semibold text-lg">Нет покупок</h3>
                  <p className="text-sm text-muted-foreground">История покупок будет здесь</p>
                </div>
              ) : (
                <div className="border border-border rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-surface">
                      <tr>
                        <th className="text-left p-4 font-medium">Программа</th>
                        <th className="text-left p-4 font-medium hidden sm:table-cell">Дата</th>
                        <th className="text-left p-4 font-medium">Сумма</th>
                        <th className="text-left p-4 font-medium">Статус</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => {
                        const s = statusLabels[o.payment_status] || { label: o.payment_status, cls: "" };
                        return (
                          <tr key={o.id} className="border-t border-border">
                            <td className="p-4">{(o.courses as any)?.title}</td>
                            <td className="p-4 hidden sm:table-cell text-muted-foreground">{new Date(o.created_at).toLocaleDateString("ru-RU")}</td>
                            <td className="p-4">{formatPrice(Number(o.amount))}</td>
                            <td className="p-4"><span className={`text-xs px-2.5 py-1 rounded-full font-medium ${s.cls}`}>{s.label}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="profile">
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="max-w-md space-y-4">
                  <h3 className="font-semibold mb-4">Настройки профиля</h3>
                  <div className="rounded-xl bg-surface border border-border p-4 flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Текущий тариф</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={tierConfig.badgeCls}>{isPremium && <Crown className="h-3 w-3 mr-1" />}{tier.name}</Badge>
                        {tier.expiresAt && <span className="text-xs text-muted-foreground">до {new Date(tier.expiresAt).toLocaleDateString("ru-RU")}</span>}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild><Link to="/my-plan">Управление</Link></Button>
                  </div>
                  <div className="space-y-2"><Label>Имя</Label><Input value={profileName} onChange={(e) => setProfileName(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Email</Label><Input value={profileEmail} disabled /></div>
                  <Button onClick={handleSaveProfile}>Сохранить</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
