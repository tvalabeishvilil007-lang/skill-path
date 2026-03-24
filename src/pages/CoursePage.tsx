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
import { Loader2, Play, Lock, ArrowRight, ArrowLeft, Clock, User, BarChart3 } from "lucide-react";
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
  if (!course) return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Курс не найден</h1>
          <Button asChild variant="outline" className="rounded-xl"><Link to="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />Вернуться</Link></Button>
        </div>
      </main>
      <Footer />
    </div>
  );

  const hasAccess = !!accessRight;
  const existingRequest = requests?.find((r: any) => r.course_id === course.id);
  const firstLesson = course.modules?.[0]?.lessons?.sort((a: any, b: any) => a.sort_order - b.sort_order)?.[0];
  const totalLessons = course.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8 px-4">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Назад к кабинету
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {course.cover_url && (
              <div className="rounded-2xl overflow-hidden">
                <img src={course.cover_url} alt={course.title} className="w-full object-cover max-h-80" />
              </div>
            )}
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">{course.title}</h1>

            {/* Meta */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {course.author_name && <span className="flex items-center gap-1.5"><User className="h-4 w-4" /> {course.author_name}</span>}
              {course.duration && <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {course.duration}</span>}
              {course.level && <span className="flex items-center gap-1.5"><BarChart3 className="h-4 w-4" /> {course.level}</span>}
              {totalLessons > 0 && <span className="flex items-center gap-1.5"><Play className="h-4 w-4" /> {totalLessons} уроков</span>}
            </div>

            {course.short_description && <p className="text-lg text-muted-foreground leading-relaxed">{course.short_description}</p>}
            {course.full_description && <div className="prose prose-invert max-w-none text-foreground/90 leading-relaxed"><p>{course.full_description}</p></div>}

            {course.modules?.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4">Программа курса</h2>
                <Accordion type="multiple" className="space-y-2">
                  {course.modules.map((mod: any, i: number) => (
                    <AccordionItem key={mod.id} value={mod.id} className="border border-border rounded-xl px-5 bg-card/50 data-[state=open]:bg-card">
                      <AccordionTrigger className="hover:no-underline py-4">
                        <span className="text-left flex items-center gap-3">
                          <span className="rounded-lg bg-muted w-8 h-8 flex items-center justify-center text-sm font-bold text-muted-foreground shrink-0">{i + 1}</span>
                          <span>
                            <span className="font-semibold">{mod.title}</span>
                            <span className="text-sm text-muted-foreground ml-2">({mod.lessons?.length || 0} уроков)</span>
                          </span>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <ul className="space-y-1 ml-11">
                          {mod.lessons?.sort((a: any, b: any) => a.sort_order - b.sort_order).map((lesson: any) => (
                            <li key={lesson.id}>
                              {hasAccess ? (
                                <Link to={`/lesson/${course.slug}/${lesson.slug}`} className="flex items-center gap-2.5 py-2 px-3 rounded-lg text-sm hover:bg-muted/50 text-primary transition-colors">
                                  <Play className="h-3.5 w-3.5 shrink-0" /> {lesson.title}
                                </Link>
                              ) : (
                                <span className="flex items-center gap-2.5 py-2 px-3 text-sm text-muted-foreground">
                                  <Lock className="h-3.5 w-3.5 shrink-0" /> {lesson.title}
                                </span>
                              )}
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

          {/* Sidebar */}
          <div>
            <Card className="sticky top-20 rounded-2xl">
              <CardContent className="p-6 space-y-5">
                {course.price > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Стоимость</p>
                    <p className="text-3xl font-extrabold">{Number(course.price).toLocaleString("ru-RU")} ₽</p>
                  </div>
                )}
                {hasAccess ? (
                  <Button asChild className="w-full rounded-xl h-12 text-base glow-primary" size="lg">
                    <Link to={firstLesson ? `/lesson/${course.slug}/${firstLesson.slug}` : "#"}>
                      Начать обучение <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button asChild className="w-full rounded-xl h-12 text-base glow-primary" size="lg">
                    <Link to={`/purchase/${course.slug}`}>
                      Оформить покупку <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
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
