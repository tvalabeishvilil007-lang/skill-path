import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useCourses, useUserCourses } from "@/hooks/useCourses";
import { useUserRequests } from "@/hooks/useRequests";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ShoppingBag, FileText, Loader2, ArrowRight } from "lucide-react";
import { useState } from "react";
import RequestDialog from "@/components/RequestDialog";

const STATUS_LABELS: Record<string, string> = { new: "Новая", in_progress: "В обработке", awaiting_payment: "Ожидает оплату", paid: "Оплачено", access_granted: "Доступ открыт", rejected: "Отклонена" };
const STATUS_CLS: Record<string, string> = { new: "bg-blue-100 text-blue-800", in_progress: "bg-yellow-100 text-yellow-800", awaiting_payment: "bg-orange-100 text-orange-800", paid: "bg-emerald-100 text-emerald-800", access_granted: "bg-green-100 text-green-800", rejected: "bg-red-100 text-red-800" };

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
      <main className="flex-1 container py-8">
        <h1 className="text-2xl font-bold mb-6">Добро пожаловать!</h1>
        <Tabs defaultValue="home" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="home">Главная</TabsTrigger>
            <TabsTrigger value="shop">Магазин</TabsTrigger>
            <TabsTrigger value="courses">Мои курсы</TabsTrigger>
            <TabsTrigger value="requests">Заявки</TabsTrigger>
          </TabsList>

          <TabsContent value="home">
            <div className="grid gap-4 sm:grid-cols-3">
              <Card><CardHeader className="flex flex-row items-center gap-3 pb-2"><ShoppingBag className="h-8 w-8 text-primary shrink-0" /><div><CardTitle className="text-lg">Магазин курсов</CardTitle><p className="text-sm text-muted-foreground">{courses?.length || 0} курсов</p></div></CardHeader></Card>
              <Card><CardHeader className="flex flex-row items-center gap-3 pb-2"><BookOpen className="h-8 w-8 text-primary shrink-0" /><div><CardTitle className="text-lg">Мои курсы</CardTitle><p className="text-sm text-muted-foreground">{myCourses.length} открыто</p></div></CardHeader></Card>
              <Card><CardHeader className="flex flex-row items-center gap-3 pb-2"><FileText className="h-8 w-8 text-primary shrink-0" /><div><CardTitle className="text-lg">Мои заявки</CardTitle><p className="text-sm text-muted-foreground">{requests?.length || 0} заявок</p></div></CardHeader></Card>
            </div>
          </TabsContent>

          <TabsContent value="shop">
            {coursesLoading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : !courses?.length ? <p className="text-center text-muted-foreground py-12">Курсы пока не добавлены</p> : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course: any) => {
                  const access = hasAccess(course.id);
                  const req = getRequest(course.id);
                  return (
                    <Card key={course.id} className="overflow-hidden">
                      {course.cover_url && <img src={course.cover_url} alt={course.title} className="w-full h-40 object-cover" />}
                      <CardContent className="p-4 space-y-3">
                        <h3 className="font-semibold text-lg">{course.title}</h3>
                        {course.short_description && <p className="text-sm text-muted-foreground line-clamp-2">{course.short_description}</p>}
                        {course.price > 0 && <p className="font-bold">{Number(course.price).toLocaleString("ru-RU")} ₽</p>}
                        {access ? (
                          <div className="space-y-2">
                            <Badge className="bg-green-100 text-green-800">Доступ открыт</Badge>
                            <Button asChild className="w-full" size="sm"><Link to={`/course/${course.slug}`}>Перейти к курсу <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
                          </div>
                        ) : req ? (
                          <Badge className={STATUS_CLS[req.status] || ""}>{STATUS_LABELS[req.status] || req.status}</Badge>
                        ) : (
                          <Button className="w-full" size="sm" onClick={() => setRequestCourse({ id: course.id, title: course.title })}>Оформить заявку</Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="courses">
            {!myCourses.length ? <p className="text-center text-muted-foreground py-12">У вас пока нет доступных курсов</p> : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {myCourses.map((course: any) => (
                  <Card key={course.id}>
                    {course.cover_url && <img src={course.cover_url} alt={course.title} className="w-full h-40 object-cover rounded-t-lg" />}
                    <CardContent className="p-4"><h3 className="font-semibold mb-3">{course.title}</h3><Button asChild className="w-full" size="sm"><Link to={`/course/${course.slug}`}>Перейти к курсу</Link></Button></CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests">
            {!requests?.length ? <p className="text-center text-muted-foreground py-12">У вас пока нет заявок</p> : (
              <div className="space-y-3">
                {requests.map((req: any) => (
                  <Card key={req.id}><CardContent className="p-4 flex items-center justify-between"><div><p className="font-medium">{req.courses?.title || "Курс"}</p><p className="text-sm text-muted-foreground">{new Date(req.created_at).toLocaleDateString("ru-RU")}</p></div><Badge className={STATUS_CLS[req.status] || ""}>{STATUS_LABELS[req.status] || req.status}</Badge></CardContent></Card>
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
