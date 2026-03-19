import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { mockCourses } from "@/data/mockCourses";
import { Progress } from "@/components/ui/progress";
import { User, BookOpen, Receipt, Settings, Play } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const myCourses = mockCourses.slice(0, 2).map((c, i) => ({
  ...c,
  progress: i === 0 ? 45 : 12,
  completedLessons: i === 0 ? 5 : 1,
}));

const Dashboard = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Личный кабинет</h1>
          <p className="text-muted-foreground">Добро пожаловать, Студент!</p>
        </div>

        <Tabs defaultValue="courses">
          <TabsList className="mb-6">
            <TabsTrigger value="courses" className="gap-2">
              <BookOpen className="h-4 w-4" /> Мои курсы
            </TabsTrigger>
            <TabsTrigger value="purchases" className="gap-2">
              <Receipt className="h-4 w-4" /> Покупки
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" /> Профиль
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            {myCourses.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <p className="text-muted-foreground">У вас пока нет курсов</p>
                <Button asChild>
                  <Link to="/catalog">Перейти в каталог</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {myCourses.map((course) => (
                  <div
                    key={course.id}
                    className="flex flex-col sm:flex-row items-start gap-4 border border-border rounded-lg bg-card p-5"
                  >
                    <div className="w-full sm:w-40 aspect-video rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <BookOpen className="h-8 w-8 text-primary/40" />
                    </div>
                    <div className="flex-1 space-y-2 min-w-0">
                      <h3 className="font-semibold">{course.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>
                          {course.completedLessons} из {course.lessonsCount} уроков
                        </span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        Прогресс: {course.progress}%
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="shrink-0 gap-1.5" asChild>
                      <Link to={`/course/${course.slug}`}>
                        <Play className="h-3.5 w-3.5" /> Продолжить
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="purchases">
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
                  {myCourses.map((c) => (
                    <tr key={c.id} className="border-t border-border">
                      <td className="p-3">{c.title}</td>
                      <td className="p-3 hidden sm:table-cell text-muted-foreground">12.03.2026</td>
                      <td className="p-3">{new Intl.NumberFormat("ru-RU").format(c.price)} ₽</td>
                      <td className="p-3">
                        <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success font-medium">
                          Оплачен
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <div className="max-w-md space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Имя</label>
                <input className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" defaultValue="Студент" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <input className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" defaultValue="student@example.com" />
              </div>
              <Button>Сохранить</Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
