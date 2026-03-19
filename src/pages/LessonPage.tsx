import { useParams, Link, Navigate } from "react-router-dom";
import { useCourseBySlug } from "@/hooks/useCourses";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft, ArrowRight, Play, Lock } from "lucide-react";
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
  if (!course || !currentLesson) return <div className="min-h-screen flex flex-col"><Header /><main className="flex-1 flex items-center justify-center"><div className="text-center space-y-4"><h1 className="text-2xl font-bold">Урок не найден</h1><Button asChild><Link to="/dashboard">Вернуться</Link></Button></div></main></div>;
  if (!accessRight) return <div className="min-h-screen flex flex-col"><Header /><main className="flex-1 flex items-center justify-center"><div className="text-center space-y-4"><Lock className="h-12 w-12 mx-auto text-muted-foreground" /><h1 className="text-2xl font-bold">Доступ закрыт</h1><p className="text-muted-foreground">У вас нет доступа к этому курсу</p><Button asChild><Link to={`/course/${courseSlug}`}>К странице курса</Link></Button></div></main></div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8 max-w-4xl">
        <Link to={`/course/${courseSlug}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="h-4 w-4" /> {course.title}</Link>
        <h1 className="text-2xl font-bold mb-6">{currentLesson.title}</h1>
        {currentLesson.video_url && <div className="aspect-video bg-muted rounded-xl mb-6 overflow-hidden"><iframe src={currentLesson.video_url} className="w-full h-full" allowFullScreen allow="autoplay; fullscreen" /></div>}
        {currentLesson.description && <Card className="mb-6"><CardContent className="p-6 prose max-w-none"><p>{currentLesson.description}</p></CardContent></Card>}
        <div className="flex items-center justify-between mt-8">
          {prevLesson ? <Button asChild variant="outline"><Link to={`/lesson/${courseSlug}/${prevLesson.slug}`}><ArrowLeft className="mr-2 h-4 w-4" /> Назад</Link></Button> : <div />}
          {nextLesson ? <Button asChild><Link to={`/lesson/${courseSlug}/${nextLesson.slug}`}>Далее <ArrowRight className="ml-2 h-4 w-4" /></Link></Button> : <Button asChild variant="outline"><Link to={`/course/${courseSlug}`}>Завершить</Link></Button>}
        </div>
        <div className="mt-10">
          <h2 className="text-lg font-semibold mb-4">Все уроки</h2>
          <div className="space-y-1">
            {allLessons.map((lesson: any, i: number) => (
              <Link key={lesson.id} to={`/lesson/${courseSlug}/${lesson.slug}`} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${lesson.slug === lessonSlug ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-muted-foreground"}`}>
                <Play className="h-3.5 w-3.5 shrink-0" /><span>{i + 1}. {lesson.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LessonPage;
