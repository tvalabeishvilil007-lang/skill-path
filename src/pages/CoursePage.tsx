import { useParams, Link, Navigate } from "react-router-dom";
import { useCourseBySlug } from "@/hooks/useCourses";
import { useUserRequests } from "@/hooks/useRequests";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, Play, Lock, ArrowRight } from "lucide-react";
import { useState } from "react";
import RequestDialog from "@/components/RequestDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const CoursePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, loading: authLoading } = useAuth();
  const { data: course, isLoading } = useCourseBySlug(slug || "");
  const { data: requests } = useUserRequests(user?.id);
  const [requestOpen, setRequestOpen] = useState(false);

  const { data: accessRight } = useQuery({
    queryKey: ["user-access", user?.id, course?.id],
    queryFn: async () => {
      const { data } = await supabase.from("access_rights").select("*").eq("user_id", user!.id).eq("course_id", course!.id).eq("status", "active").maybeSingle();
      return data;
    },
    enabled: !!user?.id && !!course?.id,
  });

  if (authLoading || isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!course) return <div className="min-h-screen flex flex-col"><Header /><main className="flex-1 flex items-center justify-center"><div className="text-center space-y-4"><h1 className="text-2xl font-bold">Курс не найден</h1><Button asChild><Link to="/dashboard">Вернуться</Link></Button></div></main><Footer /></div>;

  const hasAccess = !!accessRight;
  const existingRequest = requests?.find((r: any) => r.course_id === course.id);
  const firstLesson = course.modules?.[0]?.lessons?.sort((a: any, b: any) => a.sort_order - b.sort_order)?.[0];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {course.cover_url && <img src={course.cover_url} alt={course.title} className="w-full rounded-xl object-cover max-h-80" />}
            <h1 className="text-3xl font-bold">{course.title}</h1>
            {course.short_description && <p className="text-lg text-muted-foreground">{course.short_description}</p>}
            {course.full_description && <div className="prose max-w-none"><p>{course.full_description}</p></div>}
            {course.modules?.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Программа курса</h2>
                <Accordion type="multiple" className="space-y-2">
                  {course.modules.map((mod: any, i: number) => (
                    <AccordionItem key={mod.id} value={mod.id} className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline"><span className="text-left"><span className="text-muted-foreground mr-2">{i + 1}.</span>{mod.title}<span className="text-sm text-muted-foreground ml-2">({mod.lessons?.length || 0} уроков)</span></span></AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-2">
                          {mod.lessons?.sort((a: any, b: any) => a.sort_order - b.sort_order).map((lesson: any) => (
                            <li key={lesson.id} className="flex items-center gap-2 py-1">
                              {hasAccess ? <Link to={`/lesson/${course.slug}/${lesson.slug}`} className="flex items-center gap-2 text-primary hover:underline"><Play className="h-4 w-4" /> {lesson.title}</Link> : <span className="flex items-center gap-2 text-muted-foreground"><Lock className="h-4 w-4" /> {lesson.title}</span>}
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </div>
          <div>
            <Card className="sticky top-20">
              <CardContent className="p-6 space-y-4">
                {course.price > 0 && <div className="text-3xl font-bold">{Number(course.price).toLocaleString("ru-RU")} ₽</div>}
                {course.author_name && <p className="text-sm text-muted-foreground">Автор: {course.author_name}</p>}
                {course.level && <p className="text-sm text-muted-foreground">Уровень: {course.level}</p>}
                {course.duration && <p className="text-sm text-muted-foreground">Длительность: {course.duration}</p>}
                {hasAccess ? (
                  <Button asChild className="w-full" size="lg"><Link to={firstLesson ? `/lesson/${course.slug}/${firstLesson.slug}` : "#"}>Начать обучение <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
                ) : existingRequest ? (
                  <div className="text-center space-y-2"><Badge variant="secondary">Заявка отправлена</Badge><p className="text-sm text-muted-foreground">Менеджер свяжется с вами</p></div>
                ) : (
                  <Button className="w-full" size="lg" onClick={() => setRequestOpen(true)}>Оформить заявку</Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
      <RequestDialog open={requestOpen} onOpenChange={setRequestOpen} courseId={course.id} courseTitle={course.title} />
    </div>
  );
};

export default CoursePage;
