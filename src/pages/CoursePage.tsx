import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useParams, Link } from "react-router-dom";
import { mockCourses } from "@/data/mockCourses";
import {
  Clock,
  BookOpen,
  BarChart,
  User,
  Lock,
  Play,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("ru-RU").format(price) + " ₽";

const CoursePage = () => {
  const { slug } = useParams();
  const course = mockCourses.find((c) => c.slug === slug);

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Курс не найден</h1>
            <Button asChild>
              <Link to="/catalog">Вернуться в каталог</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="hero-gradient text-hero-foreground py-12 md:py-20">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-5">
              <Badge variant="secondary">{course.category}</Badge>
              <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                {course.title}
              </h1>
              <p className="text-hero-muted text-lg max-w-xl">
                {course.shortDescription}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-hero-muted">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> {course.duration}
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" /> {course.lessonsCount} уроков
                </span>
                <span className="flex items-center gap-1.5">
                  <BarChart className="h-4 w-4" /> {course.level}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" /> {course.authorName}
                </span>
              </div>
            </div>

            {/* Price Card */}
            <div className="rounded-xl border border-border/20 bg-card text-card-foreground p-6 space-y-5 self-start">
              <div className="space-y-1">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-primary">
                    {formatPrice(course.price)}
                  </span>
                  {course.oldPrice && (
                    <span className="text-lg text-muted-foreground line-through">
                      {formatPrice(course.oldPrice)}
                    </span>
                  )}
                </div>
                {course.oldPrice && (
                  <p className="text-sm text-success font-medium">
                    Скидка {Math.round((1 - course.price / course.oldPrice) * 100)}%
                  </p>
                )}
              </div>
              <Button variant="hero" size="lg" className="w-full" asChild>
                <Link to="/login">Купить курс</Link>
              </Button>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  {course.accessType === "forever" ? "Доступ навсегда" : `Доступ на ${course.accessPeriodDays} дней`}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  {course.modulesCount} модулей, {course.lessonsCount} уроков
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  Сертификат по окончании
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="py-12">
        <div className="container max-w-3xl">
          <h2 className="text-2xl font-bold mb-4">О курсе</h2>
          <p className="text-muted-foreground leading-relaxed">
            {course.fullDescription}
          </p>
        </div>
      </section>

      {/* Program */}
      {course.modules.length > 0 && (
        <section className="py-12 bg-surface">
          <div className="container max-w-3xl">
            <h2 className="text-2xl font-bold mb-6">Программа курса</h2>
            <Accordion type="multiple" className="space-y-3">
              {course.modules.map((mod) => (
                <AccordionItem
                  key={mod.id}
                  value={mod.id}
                  className="border border-border rounded-lg bg-card px-4"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <span className="font-semibold">{mod.title}</span>
                      <Badge variant="secondary" className="text-xs">
                        {mod.lessons.length} уроков
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 pt-1">
                      {mod.lessons.map((lesson) => (
                        <li
                          key={lesson.id}
                          className="flex items-center justify-between text-sm py-2 border-t border-border/50 first:border-0"
                        >
                          <span className="flex items-center gap-2">
                            {lesson.isFreePreview ? (
                              <Play className="h-3.5 w-3.5 text-primary" />
                            ) : (
                              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                            <span>{lesson.title}</span>
                            {lesson.isFreePreview && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                Бесплатно
                              </Badge>
                            )}
                          </span>
                          <span className="text-muted-foreground">
                            {lesson.duration}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      )}

      {/* Author */}
      <section className="py-12">
        <div className="container max-w-3xl">
          <h2 className="text-2xl font-bold mb-4">Преподаватель</h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-lg">{course.authorName}</p>
              <p className="text-sm text-muted-foreground">Эксперт-практик</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CoursePage;
