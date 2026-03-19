import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import LessonListItem from "@/components/LessonListItem";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Play,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Download,
  BookOpen,
  Info,
  GraduationCap,
  Menu,
  X,
} from "lucide-react";
import { mockCourses } from "@/data/mockCourses";

const LessonPage = () => {
  const { courseSlug, lessonSlug } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [completed, setCompleted] = useState(false);

  const course = mockCourses.find((c) => c.slug === courseSlug) || mockCourses[0];
  const allLessons = course.modules.flatMap((m) => m.lessons);
  const currentLesson = allLessons.find((l) => l.id === lessonSlug) || allLessons[0];
  const currentIndex = allLessons.indexOf(currentLesson);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-80' : 'w-0'} shrink-0 border-r border-border bg-sidebar overflow-hidden transition-all duration-300 hidden md:block`}>
        <div className="h-full flex flex-col w-80">
          <div className="p-4 border-b border-sidebar-border">
            <Link to="/" className="flex items-center gap-2 text-sm font-bold text-sidebar-foreground">
              <GraduationCap className="h-4 w-4 text-sidebar-primary" />
              EduPlatform
            </Link>
          </div>

          <div className="p-4 border-b border-sidebar-border space-y-3">
            <h3 className="font-semibold text-sm text-sidebar-foreground line-clamp-2">{course.title}</h3>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-sidebar-foreground/60">
                <span>Прогресс</span>
                <span>35%</span>
              </div>
              <Progress value={35} className="h-1.5" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <Accordion type="multiple" defaultValue={course.modules.map((m) => m.id)}>
              {course.modules
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((mod) => (
                  <AccordionItem key={mod.id} value={mod.id} className="border-0">
                    <AccordionTrigger className="px-3 py-2.5 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider hover:no-underline">
                      {mod.title}
                    </AccordionTrigger>
                    <AccordionContent className="pb-2">
                      {mod.lessons.map((lesson) => (
                        <LessonListItem
                          key={lesson.id}
                          title={lesson.title}
                          duration={lesson.duration}
                          isActive={lesson.id === currentLesson?.id}
                          isCompleted={false}
                          isLocked={!lesson.isFreePreview && false}
                          isFreePreview={lesson.isFreePreview}
                          onClick={() => {}}
                        />
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl px-4 md:px-6 h-14 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-xl hover:bg-muted hidden md:block">
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild><Link to="/dashboard">Кабинет</Link></BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild><Link to={`/course/${course.slug}`}>{course.title}</Link></BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <span className="text-foreground text-sm">{currentLesson?.title}</span>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
          {/* Lesson title */}
          <div className="space-y-2">
            <Badge variant="outline">Урок {currentIndex + 1} из {allLessons.length}</Badge>
            <h1 className="text-2xl md:text-3xl font-bold">{currentLesson?.title}</h1>
          </div>

          {/* Video player placeholder */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden premium-shadow">
            <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-surface via-card to-muted relative">
              <button className="rounded-2xl bg-primary/20 p-6 hover:bg-primary/30 transition-colors group">
                <Play className="h-12 w-12 text-primary group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>

          {/* Lesson description */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h2 className="font-semibold text-lg">Описание урока</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              В этом уроке мы рассмотрим основные концепции и практические примеры. Вы научитесь применять полученные знания в реальных проектах и сможете закрепить навыки на практике.
            </p>
          </div>

          {/* Materials */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h2 className="font-semibold text-lg">Материалы к уроку</h2>
            <div className="space-y-2">
              {["Презентация.pdf", "Исходный код.zip", "Шпаргалка.pdf"].map((file) => (
                <div key={file} className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface border border-border">
                  <span className="text-sm">{file}</span>
                  <Button size="sm" variant="ghost"><Download className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          </div>

          {/* Info callout */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 flex items-start gap-4">
            <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="font-medium text-sm">Совет</p>
              <p className="text-sm text-muted-foreground">
                Попробуйте выполнить практическое задание самостоятельно перед тем, как смотреть решение.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
            <Button
              variant={completed ? "success" : "outline"}
              size="lg"
              onClick={() => setCompleted(!completed)}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {completed ? "Урок пройден ✓" : "Отметить как пройденный"}
            </Button>

            <div className="flex gap-3">
              {prevLesson && (
                <Button variant="outline">
                  <ChevronLeft className="h-4 w-4 mr-1" />Назад
                </Button>
              )}
              {nextLesson && (
                <Button>
                  Далее<ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LessonPage;
