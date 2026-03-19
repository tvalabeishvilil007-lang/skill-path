import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useParams, Link } from "react-router-dom";
import { mockCourses } from "@/data/mockCourses";
import { useAuth } from "@/contexts/AuthContext";
import { useTier } from "@/contexts/TierContext";
import { canAccess, getRequiredTierForCourse, TIER_CONFIG } from "@/lib/tiers";
import AccessRestricted from "@/components/AccessRestricted";
import {
  Clock, BookOpen, BarChart, User, Lock, Play,
  CheckCircle2, ArrowRight, Crown,
} from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("ru-RU").format(price) + " ₽";

const CoursePage = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const { tier } = useTier();
  const course = mockCourses.find((c) => c.slug === slug);

  if (!user) return <AccessRestricted />;

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Материал не найден</h1>
            <Button asChild><Link to="/catalog">Вернуться в библиотеку</Link></Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const requiredTier = getRequiredTierForCourse(course.id);
  const hasAccess = canAccess(tier.level, requiredTier);
  const requiredConfig = TIER_CONFIG[requiredTier];
  const isPremiumCourse = requiredTier === "premium";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Locked overlay banner */}
      {!hasAccess && (
        <div className="bg-card border-b border-border">
          <div className="container py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">Этот материал доступен на тарифе <Badge className={requiredConfig.badgeCls}>{requiredConfig.name}</Badge></p>
                <p className="text-xs text-muted-foreground">Улучшите тариф, чтобы открыть доступ</p>
              </div>
            </div>
            <Button variant="hero" size="sm" asChild>
              <Link to="/pricing" className="gap-1.5">Улучшить тариф <ArrowRight className="h-3.5 w-3.5" /></Link>
            </Button>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className={`hero-gradient py-12 md:py-20 ${!hasAccess ? "opacity-70" : ""}`}>
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-5">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{course.category}</Badge>
                {isPremiumCourse && hasAccess && (
                  <Badge className="bg-warning/10 text-warning gap-1"><Crown className="h-3 w-3" /> Premium</Badge>
                )}
                {!hasAccess && (
                  <Badge className={requiredConfig.badgeCls}><Lock className="h-3 w-3 mr-1" /> {requiredConfig.name}</Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold leading-tight">{course.title}</h1>
              <p className="text-muted-foreground text-lg max-w-xl">{course.shortDescription}</p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {course.duration}</span>
                <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" /> {course.lessonsCount} уроков</span>
                <span className="flex items-center gap-1.5"><BarChart className="h-4 w-4" /> {course.level}</span>
                <span className="flex items-center gap-1.5"><User className="h-4 w-4" /> {course.authorName}</span>
              </div>
            </div>

            {/* Action card */}
            <div className={`rounded-2xl border p-6 space-y-5 self-start ${
              isPremiumCourse && hasAccess ? "border-warning/30 bg-card glow-accent" : "border-border bg-card"
            }`}>
              {hasAccess ? (
                <>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <span className="font-semibold text-success">Доступно на вашем тарифе</span>
                  </div>
                  <Button variant="hero" size="lg" className="w-full" asChild>
                    <Link to={course.modules.length > 0 ? `/lesson/${course.slug}/${course.modules[0].lessons[0].id}` : "#"}>
                      Начать обучение <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold">Требуется тариф {requiredConfig.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Улучшите тариф, чтобы получить доступ к этому материалу и другим программам.</p>
                  <Button variant="hero" size="lg" className="w-full" asChild>
                    <Link to="/pricing">Улучшить тариф <ArrowRight className="h-4 w-4" /></Link>
                  </Button>
                </>
              )}
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> {course.modulesCount} модулей, {course.lessonsCount} уроков</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> {course.duration} обучения</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Уровень: {course.level}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="py-12">
        <div className="container max-w-3xl">
          <h2 className="text-2xl font-bold mb-4">О программе</h2>
          <p className="text-muted-foreground leading-relaxed">{course.fullDescription}</p>
        </div>
      </section>

      {/* Program */}
      {course.modules.length > 0 && (
        <section className="py-12 bg-surface">
          <div className="container max-w-3xl">
            <h2 className="text-2xl font-bold mb-6">Содержание программы</h2>
            <Accordion type="multiple" className="space-y-3">
              {course.modules.map((mod) => (
                <AccordionItem key={mod.id} value={mod.id} className="border border-border rounded-2xl bg-card px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <span className="font-semibold">{mod.title}</span>
                      <Badge variant="secondary" className="text-xs">{mod.lessons.length} уроков</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 pt-1">
                      {mod.lessons.map((lesson) => (
                        <li key={lesson.id} className="flex items-center justify-between text-sm py-2 border-t border-border/50 first:border-0">
                          <span className="flex items-center gap-2">
                            {hasAccess || lesson.isFreePreview ? (
                              <Play className="h-3.5 w-3.5 text-primary" />
                            ) : (
                              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                            <span>{lesson.title}</span>
                            {lesson.isFreePreview && <Badge variant="outline" className="text-[10px] px-1.5 py-0">Превью</Badge>}
                          </span>
                          <span className="text-muted-foreground">{lesson.duration}</span>
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
          <h2 className="text-2xl font-bold mb-4">Автор</h2>
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
