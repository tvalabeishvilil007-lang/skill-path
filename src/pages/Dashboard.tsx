import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useUserCourses, useUserOrders, useCourseProgress } from "@/hooks/useCourses";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";
import { User, BookOpen, Receipt, Play, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: accessRights, isLoading: coursesLoading } = useUserCourses(user?.id);
  const { data: orders } = useUserOrders(user?.id);
  const { data: progressData } = useCourseProgress(user?.id);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");

  useEffect(() => {
    if (user) {
      setProfileEmail(user.email || "");
      supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.name) setProfileName(data.name);
        });
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const handleSaveProfile = async () => {
    const { error } = await supabase
      .from("profiles")
      .update({ name: profileName })
      .eq("id", user.id);
    if (error) toast.error("Ошибка сохранения");
    else toast.success("Профиль обновлён");
  };

  const getProgress = (courseId: string) => {
    return progressData?.find((p) => p.course_id === courseId);
  };

  const formatPrice = (n: number) => new Intl.NumberFormat("ru-RU").format(n) + " ₽";

  const statusLabels: Record<string, { label: string; cls: string }> = {
    paid: { label: "Оплачен", cls: "bg-success/10 text-success" },
    created: { label: "Создан", cls: "bg-muted text-muted-foreground" },
    pending_payment: { label: "Ожидает оплаты", cls: "bg-warning/10 text-warning" },
    waiting_admin: { label: "На проверке", cls: "bg-warning/10 text-warning" },
    rejected: { label: "Отклонён", cls: "bg-destructive/10 text-destructive" },
    refunded: { label: "Возврат", cls: "bg-muted text-muted-foreground" },
    canceled: { label: "Отменён", cls: "bg-muted text-muted-foreground" },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Личный кабинет</h1>
          <p className="text-muted-foreground">Добро пожаловать, {profileName || "Студент"}!</p>
        </div>

        <Tabs defaultValue="courses">
          <TabsList className="mb-6">
            <TabsTrigger value="courses" className="gap-2"><BookOpen className="h-4 w-4" /> Мои курсы</TabsTrigger>
            <TabsTrigger value="purchases" className="gap-2"><Receipt className="h-4 w-4" /> Покупки</TabsTrigger>
            <TabsTrigger value="profile" className="gap-2"><User className="h-4 w-4" /> Профиль</TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            {coursesLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : !accessRights || accessRights.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <p className="text-muted-foreground">У вас пока нет курсов</p>
                <Button asChild><Link to="/catalog">Перейти в каталог</Link></Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {accessRights.map((ar) => {
                  const course = ar.courses as any;
                  const progress = getProgress(ar.course_id);
                  return (
                    <div key={ar.id} className="flex flex-col sm:flex-row items-start gap-4 border border-border rounded-lg bg-card p-5">
                      <div className="w-full sm:w-40 aspect-video rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <BookOpen className="h-8 w-8 text-primary/40" />
                      </div>
                      <div className="flex-1 space-y-2 min-w-0">
                        <h3 className="font-semibold">{course?.title}</h3>
                        <Progress value={progress?.progress_percent || 0} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          Прогресс: {progress?.progress_percent || 0}%
                          {progress ? ` (${progress.completed_lessons}/${progress.total_lessons} уроков)` : ""}
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
              <p className="text-center text-muted-foreground py-12">Нет покупок</p>
            ) : (
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 font-medium">Курс</th>
                      <th className="text-left p-3 font-medium hidden sm:table-cell">Дата</th>
                      <th className="text-left p-3 font-medium">Сумма</th>
                      <th className="text-left p-3 font-medium">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => {
                      const s = statusLabels[o.payment_status] || { label: o.payment_status, cls: "" };
                      return (
                        <tr key={o.id} className="border-t border-border">
                          <td className="p-3">{(o.courses as any)?.title}</td>
                          <td className="p-3 hidden sm:table-cell text-muted-foreground">
                            {new Date(o.created_at).toLocaleDateString("ru-RU")}
                          </td>
                          <td className="p-3">{formatPrice(Number(o.amount))}</td>
                          <td className="p-3">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.cls}`}>{s.label}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile">
            <div className="max-w-md space-y-4">
              <div className="space-y-2">
                <Label>Имя</Label>
                <Input value={profileName} onChange={(e) => setProfileName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={profileEmail} disabled />
              </div>
              <Button onClick={handleSaveProfile}>Сохранить</Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
