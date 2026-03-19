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
import { BookOpen, ShoppingBag, FileText, Loader2, ArrowRight, Inbox } from "lucide-react";
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

const EmptyBlock = ({ icon: Icon, title, desc }: { icon: any; title: string; desc?: string }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="rounded-2xl bg-muted/50 p-4 mb-4">
      <Icon className="h-7 w-7 text-muted-foreground" />
    </div>
    <h3 className="font-semibold text-lg mb-1">{title}</h3>
    {desc && <p className="text-sm text-muted-foreground max-w-sm">{desc}</p>}
  </div>
);

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: courses, isLoading: coursesLoading } = useCourses();
  const { data: accessRights } = useUserCourses(user?.id);
  const { data: requests } = useUserRequests(user?.id);
  const [requestCourse, setRequestCourse] = useState<{ id: string; title: string } | null>(null);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to="/login" replace />;

  const hasAccess = (courseId: string) => accessRights?.some((a: any) => a.course_id === courseId);
  const getRequest = (courseId: string) => requests?.find((r: any) => r.course_id === courseId);
  const myCourses = courses?.filter((c: any) => hasAccess(c.id)) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8 px-4">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Добро пожаловать! 👋</h1>
          <p className="text-muted-foreground">Ваш личный кабинет</p>
        </div>

        <Tabs defaultValue="home" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 h-11 rounded-xl bg-card border border-border p-1">
            <TabsTrigger value="home" className="rounded-lg text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">Главная</TabsTrigger>
            <TabsTrigger value="shop" className="rounded-lg text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">Магазин</TabsTrigger>
            <TabsTrigger value="courses" className="rounded-lg text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">Мои курсы</TabsTrigger>
            <TabsTrigger value="requests" className="rounded-lg text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">Заявки</TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="animate-fade-in">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: ShoppingBag, label: "Магазин курсов", value: `${courses?.length || 0} курсов`, color: "text-primary", bg: "bg-primary/10" },
                { icon: BookOpen, label: "Мои курсы", value: `${myCourses.length} открыто`, color: "text-accent", bg: "bg-accent/10" },
                { icon: FileText, label: "Мои заявки", value: `${requests?.length || 0} заявок`, color: "text-warning", bg: "bg-warning/10" },
              ].map((item) => (
                <Card key={item.label} className="card-hover">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className={`rounded-xl ${item.bg} p-3 shrink-0`}>
                      <item.icon className={`h-6 w-6 ${item.color}`} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="text-lg font-bold">{item.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="shop" className="animate-fade-in">
            {coursesLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : !courses?.length ? (
              <EmptyBlock icon={ShoppingBag} title="Курсы пока не добавлены" desc="Скоро здесь появятся программы обучения" />
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
                        <div className="aspect-[16/9] bg-muted/50 flex items-center justify-center">
                          <BookOpen className="h-10 w-10 text-muted-foreground/30" />
                        </div>
                      )}
                      <CardContent className="p-5 space-y-3">
                        <h3 className="font-bold text-lg leading-tight">{course.title}</h3>
                        {course.short_description && <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{course.short_description}</p>}
                        {course.price > 0 && <p className="text-xl font-bold text-foreground">{Number(course.price).toLocaleString("ru-RU")} ₽</p>}
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

          <TabsContent value="courses" className="animate-fade-in">
            {!myCourses.length ? (
              <EmptyBlock icon={BookOpen} title="У вас пока нет курсов" desc="Откройте магазин и оформите заявку на интересующий курс" />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {myCourses.map((course: any) => (
                  <Card key={course.id} className="overflow-hidden card-hover group">
                    {course.cover_url ? (
                      <div className="aspect-[16/9] overflow-hidden">
                        <img src={course.cover_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    ) : (
                      <div className="aspect-[16/9] bg-muted/50 flex items-center justify-center">
                        <BookOpen className="h-10 w-10 text-muted-foreground/30" />
                      </div>
                    )}
                    <CardContent className="p-5">
                      <h3 className="font-bold text-lg mb-3">{course.title}</h3>
                      <Button asChild className="w-full rounded-xl" size="sm">
                        <Link to={`/course/${course.slug}`}>Перейти к курсу <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests" className="animate-fade-in">
            {!requests?.length ? (
              <EmptyBlock icon={Inbox} title="У вас пока нет заявок" desc="Оформите заявку на курс в магазине" />
            ) : (
              <div className="space-y-3">
                {requests.map((req: any) => (
                  <Card key={req.id}>
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{req.courses?.title || "Курс"}</p>
                        <p className="text-sm text-muted-foreground">{new Date(req.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}</p>
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
