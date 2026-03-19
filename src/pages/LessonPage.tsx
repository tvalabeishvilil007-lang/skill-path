import { useParams, Link, Navigate } from "react-router-dom";
import { useCourseBySlug } from "@/hooks/useCourses";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft, ArrowRight, Play, Lock, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";

const LessonPage = () => {
  const { courseSlug, lessonSlug } = useParams();
  const { user, loading: authLoading } = useAuth();
  const { data: course, isLoading } = useCourseBySlug(courseSlug || "");

  const { data: accessRight } = useQuery({
    queryKey: ["user-access", user?.id, course?.id],
    queryFn: async () => {
      const { data } = await supabase.from("access_rights").select("*").eq("user_id", user!.id).eq("course_id", course!.id).eq("status", "active").maybeSingle();
      return data;
    },
    enabled: !!user?.id && !!course?.id,
  });

  const allLessons = useMemo(() => {
    if (!course?.modules) return [];
    return course.modules.sort((a: any, b: any) => a.sort_order - b.sort_order).flatMap((m: any) => (m.lessons || []).sort((a: any, b: any) => a.sort_order - b.sort_order));
  }, [course]);

  const currentIndex = allLessons.findIndex((l: any) => l.slug === lessonSlug);
  const currentLesson = allLessons[currentIndex];
  const prevLesson = allLessons[currentIndex - 1];
  const nextLesson = allLessons[currentIndex + 1];

  if (authLoading || isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to="/login" replace />;

  if (!course || !currentLesson) return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Урок не найден</h1>
          <Button asChild variant="outline" className="rounded-xl"><Link to="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />Вернуться</Link></Button>
        </div>
      </main>
    </div>
  );

  if (!accessRight) return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="rounded-2xl bg-muted/50 p-5 w-fit mx-auto">
            <Lock className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Доступ закрыт</h1>
          <p className="text-muted-foreground">У вас нет доступа к этому курсу</p>
          <Button asChild className="rounded-xl"><Link to={`/course/${courseSlug}`}>К странице курса</Link></Button>
        </div>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-8 px-4">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8 max-w-6xl mx-auto">
          {/* Main content */}
          <div className="space-y-6">
            <Link to={`/course/${courseSlug}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" /> {course.title}
            </Link>

            <h1 className="text-2xl md:text-3xl font-bold">{currentLesson.title}</h1>

            {currentLesson.video_url && (
              <div className="aspect-video bg-card rounded-2xl overflow-hidden border border-border">
                <iframe src={currentLesson.video_url} className="w-full h-full" allowFullScreen allow="autoplay; fullscreen" />
              </div>
            )}

            {currentLesson.description && (
              <Card className="rounded-2xl">
                <CardContent className="p-6 prose prose-invert max-w-none text-foreground/90 leading-relaxed">
                  <p>{currentLesson.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4">
              {prevLesson ? (
                <Button asChild variant="outline" className="rounded-xl gap-2">
                  <Link to={`/lesson/${courseSlug}/${prevLesson.slug}`}><ArrowLeft className="h-4 w-4" /> Назад</Link>
                </Button>
              ) : <div />}
              {nextLesson ? (
                <Button asChild className="rounded-xl gap-2">
                  <Link to={`/lesson/${courseSlug}/${nextLesson.slug}`}>Далее <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              ) : (
                <Button asChild variant="outline" className="rounded-xl gap-2">
                  <Link to={`/course/${courseSlug}`}><CheckCircle className="h-4 w-4" /> Завершить</Link>
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar lesson list */}
          <div className="hidden lg:block">
            <Card className="sticky top-20 rounded-2xl">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Уроки</h3>
                <div className="space-y-0.5">
                  {allLessons.map((lesson: any, i: number) => (
                    <Link
                      key={lesson.id}
                      to={`/lesson/${courseSlug}/${lesson.slug}`}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all ${
                        lesson.slug === lessonSlug
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="w-6 h-6 rounded-md bg-muted flex items-center justify-center text-xs font-medium shrink-0">{i + 1}</span>
                      <span className="truncate">{lesson.title}</span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mobile lesson list */}
        <div className="lg:hidden mt-10">
          <h2 className="text-lg font-bold mb-4">Все уроки</h2>
          <div className="space-y-1">
            {allLessons.map((lesson: any, i: number) => (
              <Link
                key={lesson.id}
                to={`/lesson/${courseSlug}/${lesson.slug}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  lesson.slug === lessonSlug
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="w-6 h-6 rounded-md bg-muted flex items-center justify-center text-xs font-medium shrink-0">{i + 1}</span>
                <span>{lesson.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LessonPage;
