import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useCourses, useUserCourses } from "@/hooks/useCourses";
import { useUserRequests } from "@/hooks/useRequests";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen, ShoppingBag, FileText, Loader2, ArrowRight, Inbox,
  Sparkles, Send, CheckCircle2, MousePointerClick, GraduationCap, Zap,
} from "lucide-react";
import { useState } from "react";
import RequestDialog from "@/components/RequestDialog";

const STATUS_LABELS: Record<string, string> = { new: "Новая", in_progress: "В обработке", awaiting_payment: "Ожидает оплату", paid: "Оплачено", access_granted: "Доступ открыт", rejected: "Отклонена" };

const STATUS_VARIANTS: Record<string, string> = {
  new: "bg-primary/10 text-primary border-primary/20",
  in_progress: "bg-warning/10 text-warning border-warning/20",
  awaiting_payment: "bg-warning/10 text-warning border-warning/20",
  paid: "bg-success/10 text-success border-success/20",
  access_granted: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: courses, isLoading: coursesLoading } = useCourses();
  const { data: accessRights } = useUserCourses(user?.id);
  const { data: requests } = useUserRequests(user?.id);
  const [requestCourse, setRequestCourse] = useState<{ id: string; title: string } | null>(null);
  const [activeTab, setActiveTab] = useState("home");
  const goToShop = () => setActiveTab("shop");

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to="/login" replace />;

  const hasAccess = (courseId: string) => accessRights?.some((a: any) => a.course_id === courseId);
  const getRequest = (courseId: string) => requests?.find((r: any) => r.course_id === courseId);
  const myCourses = courses?.filter((c: any) => hasAccess(c.id)) || [];
  const hasData = myCourses.length > 0 || (requests?.length || 0) > 0;
  const publishedCourses = courses?.filter((c: any) => c.status === "published") || [];
  const featuredCourses = publishedCourses.slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8 px-4 max-w-6xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 h-12 rounded-2xl bg-card border border-border/60 p-1 gap-1">
            {[
              { value: "home", label: "Главная", icon: Sparkles },
              { value: "shop", label: "Магазин", icon: ShoppingBag },
              { value: "courses", label: "Мои курсы", icon: BookOpen },
              { value: "requests", label: "Заявки", icon: FileText },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-xl text-sm font-medium gap-2 transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:shadow-primary/20"
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* HOME TAB */}
          <TabsContent value="home" className="space-y-8 animate-in fade-in duration-500">
            {/* Hero */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card relative overflow-hidden">
              <CardContent className="p-7 md:p-10 relative z-10">
                <div className="flex items-start gap-4 mb-2">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-4 mb-2">
                  {hasData ? `С возвращением! 👋` : `Начните обучение уже сегодня`}
                </h1>
                <p className="text-muted-foreground text-base md:text-lg max-w-xl mb-6 leading-relaxed">
                  {hasData
                    ? "Продолжайте обучение или выберите новый курс из нашего каталога."
                    : "Выберите курс, отправьте заявку и получите доступ через менеджера — всё просто и быстро."
                  }
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button size="lg" className="rounded-xl gap-2 shadow-lg shadow-primary/20" asChild>
                    <a href="#" onClick={(e) => { e.preventDefault(); document.querySelector<HTMLButtonElement>('[data-value="shop"]')?.click(); }}>
                      <ShoppingBag className="h-4 w-4" />
                      Перейти в магазин курсов
                    </a>
                  </Button>
                  {myCourses.length > 0 && (
                    <Button variant="outline" size="lg" className="rounded-xl gap-2" asChild>
                      <a href="#" onClick={(e) => { e.preventDefault(); document.querySelector<HTMLButtonElement>('[data-value="courses"]')?.click(); }}>
                        Мои курсы
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
              <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl" />
            </Card>

            {/* Onboarding or Stats */}
            {hasData ? (
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { icon: BookOpen, label: "Мои курсы", value: `${myCourses.length}`, sub: "открыто", color: "text-accent", bg: "bg-accent/10", border: "border-accent/20" },
                  { icon: FileText, label: "Мои заявки", value: `${requests?.length || 0}`, sub: "отправлено", color: "text-warning", bg: "bg-warning/10", border: "border-warning/20" },
                  { icon: ShoppingBag, label: "Каталог", value: `${publishedCourses.length}`, sub: "курсов", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
                ].map((item) => (
                  <Card key={item.label} className={`border ${item.border} card-hover`}>
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className={`rounded-xl ${item.bg} p-3 shrink-0`}>
                        <item.icon className={`h-5 w-5 ${item.color}`} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{item.value} <span className="text-sm font-normal text-muted-foreground">{item.sub}</span></p>
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              /* Onboarding steps */
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  {
                    step: "1",
                    icon: MousePointerClick,
                    title: "Выберите курс",
                    desc: "Откройте магазин и найдите подходящую программу обучения",
                    color: "text-primary", bg: "bg-primary/10", border: "border-primary/20",
                  },
                  {
                    step: "2",
                    icon: Send,
                    title: "Отправьте заявку",
                    desc: "Оставьте контакты — менеджер свяжется с вами через Telegram",
                    color: "text-warning", bg: "bg-warning/10", border: "border-warning/20",
                  },
                  {
                    step: "3",
                    icon: CheckCircle2,
                    title: "Получите доступ",
                    desc: "После подтверждения оплаты вам откроют доступ к курсу",
                    color: "text-success", bg: "bg-success/10", border: "border-success/20",
                  },
                ].map((s) => (
                  <Card key={s.step} className={`border ${s.border} card-hover relative overflow-hidden`}>
                    <CardContent className="p-6 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className={`rounded-xl ${s.bg} h-10 w-10 flex items-center justify-center`}>
                          <s.icon className={`h-5 w-5 ${s.color}`} />
                        </div>
                        <span className="text-xs font-bold text-muted-foreground/40 uppercase tracking-wider">Шаг {s.step}</span>
                      </div>
                      <h3 className="font-bold text-lg">{s.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Featured courses */}
            {featuredCourses.length > 0 && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-warning" />
                    <h2 className="font-bold text-lg">Популярные курсы</h2>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground gap-1"
                    onClick={() => document.querySelector<HTMLButtonElement>('[data-value="shop"]')?.click()}
                  >
                    Все курсы <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {featuredCourses.map((course: any) => {
                    const access = hasAccess(course.id);
                    const req = getRequest(course.id);
                    return (
                      <Card key={course.id} className="overflow-hidden card-hover group">
                        {course.cover_url ? (
                          <div className="aspect-[16/9] overflow-hidden">
                            <img src={course.cover_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                        ) : (
                          <div className="aspect-[16/9] bg-muted/30 flex items-center justify-center">
                            <BookOpen className="h-10 w-10 text-muted-foreground/20" />
                          </div>
                        )}
                        <CardContent className="p-5 space-y-3">
                          <h3 className="font-bold leading-tight">{course.title}</h3>
                          {course.price > 0 && <p className="text-lg font-bold">{Number(course.price).toLocaleString("ru-RU")} ₽</p>}
                          {access ? (
                            <Button asChild className="w-full rounded-xl" size="sm">
                              <Link to={`/course/${course.slug}`}>Перейти к курсу <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
                            </Button>
                          ) : req ? (
                            <Badge className={`${STATUS_VARIANTS[req.status] || ""} border`}>{STATUS_LABELS[req.status] || req.status}</Badge>
                          ) : (
                            <Button className="w-full rounded-xl" size="sm" onClick={() => setRequestCourse({ id: course.id, title: course.title })}>
                              Оформить заявку
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>

          {/* SHOP TAB */}
          <TabsContent value="shop" className="animate-in fade-in duration-500">
            {coursesLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : !courses?.length ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="rounded-2xl bg-muted/30 p-5 mb-5">
                  <ShoppingBag className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <h3 className="font-bold text-xl mb-2">Курсы скоро появятся</h3>
                <p className="text-sm text-muted-foreground max-w-sm">Мы готовим программы обучения. Загляните сюда позже!</p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course: any) => {
                  const access = hasAccess(course.id);
                  const req = getRequest(course.id);
                  return (
                    <Card key={course.id} className="overflow-hidden card-hover group">
                      {course.cover_url ? (
                        <div className="aspect-[16/9] overflow-hidden">
                          <img src={course.cover_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      ) : (
                        <div className="aspect-[16/9] bg-muted/30 flex items-center justify-center">
                          <BookOpen className="h-10 w-10 text-muted-foreground/20" />
                        </div>
                      )}
                      <CardContent className="p-5 space-y-3">
                        <h3 className="font-bold text-lg leading-tight">{course.title}</h3>
                        {course.short_description && <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{course.short_description}</p>}
                        {course.price > 0 && <p className="text-xl font-bold">{Number(course.price).toLocaleString("ru-RU")} ₽</p>}
                        {access ? (
                          <div className="space-y-2 pt-1">
                            <Badge className="bg-success/10 text-success border border-success/20">✓ Доступ открыт</Badge>
                            <Button asChild className="w-full rounded-xl" size="sm">
                              <Link to={`/course/${course.slug}`}>Перейти к курсу <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
                            </Button>
                          </div>
                        ) : req ? (
                          <Badge className={`${STATUS_VARIANTS[req.status] || ""} border`}>{STATUS_LABELS[req.status] || req.status}</Badge>
                        ) : (
                          <Button className="w-full rounded-xl" size="sm" onClick={() => setRequestCourse({ id: course.id, title: course.title })}>
                            Оформить заявку
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* MY COURSES TAB */}
          <TabsContent value="courses" className="animate-in fade-in duration-500">
            {!myCourses.length ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="rounded-2xl bg-accent/10 p-5 mb-5">
                  <BookOpen className="h-8 w-8 text-accent/60" />
                </div>
                <h3 className="font-bold text-xl mb-2">У вас пока нет курсов</h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-5">Откройте магазин, выберите интересующий курс и оформите заявку — менеджер свяжется с вами.</p>
                <Button
                  className="rounded-xl gap-2"
                  onClick={() => document.querySelector<HTMLButtonElement>('[data-value="shop"]')?.click()}
                >
                  <ShoppingBag className="h-4 w-4" />
                  Открыть магазин
                </Button>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {myCourses.map((course: any) => (
                  <Card key={course.id} className="overflow-hidden card-hover group">
                    {course.cover_url ? (
                      <div className="aspect-[16/9] overflow-hidden">
                        <img src={course.cover_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    ) : (
                      <div className="aspect-[16/9] bg-muted/30 flex items-center justify-center">
                        <BookOpen className="h-10 w-10 text-muted-foreground/20" />
                      </div>
                    )}
                    <CardContent className="p-5">
                      <h3 className="font-bold text-lg mb-4">{course.title}</h3>
                      <Button asChild className="w-full rounded-xl gap-2" size="sm">
                        <Link to={`/course/${course.slug}`}>
                          Продолжить обучение <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* REQUESTS TAB */}
          <TabsContent value="requests" className="animate-in fade-in duration-500">
            {!requests?.length ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="rounded-2xl bg-warning/10 p-5 mb-5">
                  <Inbox className="h-8 w-8 text-warning/60" />
                </div>
                <h3 className="font-bold text-xl mb-2">Заявок пока нет</h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-5">Выберите курс в магазине и оформите заявку — мы свяжемся с вами.</p>
                <Button
                  className="rounded-xl gap-2"
                  onClick={() => document.querySelector<HTMLButtonElement>('[data-value="shop"]')?.click()}
                >
                  <ShoppingBag className="h-4 w-4" />
                  Открыть магазин
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((req: any) => (
                  <Card key={req.id} className="hover:border-border transition-colors">
                    <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{req.courses?.title || "Курс"}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {new Date(req.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      </div>
                      <Badge className={`${STATUS_VARIANTS[req.status] || ""} border shrink-0`}>
                        {STATUS_LABELS[req.status] || req.status}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
      {requestCourse && <RequestDialog open={!!requestCourse} onOpenChange={(open) => !open && setRequestCourse(null)} courseId={requestCourse.id} courseTitle={requestCourse.title} />}
    </div>
  );
};

export default Dashboard;
