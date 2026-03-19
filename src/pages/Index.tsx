import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import ReviewCard from "@/components/ReviewCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { mockCourses } from "@/data/mockCourses";
import { motion } from "framer-motion";
import {
  Play,
  Award,
  Clock,
  Users,
  Star,
  Shield,
  Zap,
  Monitor,
  ArrowRight,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
  }),
};

const features = [
  { icon: Play, title: "HD Видеоуроки", desc: "Профессиональное видео с примерами из реальных проектов" },
  { icon: Award, title: "Сертификация", desc: "Именной сертификат после успешного завершения курса" },
  { icon: Clock, title: "Вечный доступ", desc: "Возвращайтесь к материалам в любое время без ограничений" },
  { icon: Users, title: "Менторство", desc: "Поддержка преподавателей и закрытое комьюнити студентов" },
  { icon: Shield, title: "Гарантия", desc: "Полный возврат средств в течение 14 дней после покупки" },
  { icon: Zap, title: "Практика", desc: "Реальные проекты и задания для закрепления знаний" },
];

const faqs = [
  { q: "Как начать обучение?", a: "Зарегистрируйтесь, выберите курс и оплатите его. Доступ откроется моментально после оплаты." },
  { q: "Можно ли вернуть деньги?", a: "Да, мы предоставляем возврат в течение 14 дней после покупки, если вы прошли менее 30% курса." },
  { q: "Как долго длится доступ?", a: "Большинство курсов предоставляют бессрочный доступ. Для некоторых курсов срок указан на странице." },
  { q: "Получу ли я сертификат?", a: "Да, после прохождения всех уроков курса вы получите именной сертификат." },
  { q: "Можно ли учиться с телефона?", a: "Да, платформа полностью адаптирована для мобильных устройств." },
];

const reviews = [
  { name: "Анна К.", course: "Веб-разработка", text: "Отличный курс! Устроилась на работу через 2 месяца после завершения. Рекомендую всем, кто хочет сменить профессию.", rating: 5 },
  { name: "Михаил Д.", course: "UX/UI Дизайн", text: "Очень структурированная подача материала. Преподаватель — практик из индустрии, это чувствуется.", rating: 5 },
  { name: "Елена В.", course: "Python", text: "Преподаватель объясняет сложные вещи простым языком. За 3 месяца освоила Python с нуля!", rating: 4 },
];

const steps = [
  { step: "01", title: "Регистрация", desc: "Создайте аккаунт за 30 секунд" },
  { step: "02", title: "Выбор курса", desc: "Найдите курс по вашей теме" },
  { step: "03", title: "Обучение", desc: "Смотрите уроки в удобном темпе" },
  { step: "04", title: "Результат", desc: "Получите навыки и сертификат" },
];

const stats = [
  { value: "50+", label: "курсов" },
  { value: "10 000+", label: "студентов" },
  { value: "4.8", label: "средний рейтинг" },
  { value: "95%", label: "завершают курс" },
];

const Index = () => {
  const featuredCourses = mockCourses.filter((c) => c.isFeatured);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative py-24 md:py-36 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/5 blur-3xl" />
        
        <div className="container relative">
          <motion.div className="max-w-3xl space-y-8" initial="hidden" animate="visible">
            <motion.div variants={fadeUp} custom={0}>
              <Badge variant="outline" className="px-4 py-1.5 text-sm">
                🚀 Новая платформа для обучения
              </Badge>
            </motion.div>
            
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight"
            >
              Учитесь у лучших.{" "}
              <span className="text-gradient">Растите быстрее.</span>
            </motion.h1>
            
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed"
            >
              Онлайн-курсы от практикующих экспертов. Видеоуроки, практические задания и&nbsp;поддержка на&nbsp;каждом шаге вашего пути.
            </motion.p>
            
            <motion.div variants={fadeUp} custom={3} className="flex gap-4 flex-wrap">
              <Button variant="hero" size="xl" asChild>
                <Link to="/catalog">Смотреть курсы <ArrowRight className="h-5 w-5" /></Link>
              </Button>
              <Button variant="hero-outline" size="xl" asChild>
                <Link to="/register">Начать бесплатно</Link>
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeUp} custom={4} className="flex flex-wrap gap-8 pt-4">
              {stats.map((s) => (
                <div key={s.label} className="space-y-1">
                  <p className="text-2xl font-bold text-primary">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Platform preview */}
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-2xl border border-border bg-card overflow-hidden premium-shadow"
          >
            <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-surface via-card to-muted">
              <div className="text-center space-y-4">
                <div className="mx-auto rounded-2xl bg-primary/10 p-6 w-fit">
                  <Monitor className="h-12 w-12 text-primary" />
                </div>
                <p className="text-lg font-semibold">Превью платформы</p>
                <p className="text-sm text-muted-foreground">Интерактивный интерфейс для комфортного обучения</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline">Возможности</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Почему выбирают нас</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Всё, что нужно для эффективного обучения, в одном месте
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="rounded-2xl border border-border bg-card p-6 space-y-4 card-hover"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Courses */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="flex items-end justify-between mb-10 gap-4">
            <div className="space-y-2">
              <Badge variant="outline">Курсы</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">Популярные курсы</h2>
            </div>
            <Button variant="outline" asChild>
              <Link to="/catalog">Все курсы <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline">Процесс</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Как проходит обучение</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="relative text-center space-y-3"
              >
                <div className="text-5xl font-bold text-primary/15">{s.step}</div>
                <h3 className="font-semibold text-lg">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 -right-4 w-8">
                    <ArrowRight className="h-4 w-4 text-muted-foreground/30" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline">Отзывы</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Что говорят студенты</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((r, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
              >
                <ReviewCard {...r} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 md:py-24">
        <div className="container max-w-2xl">
          <div className="text-center mb-12 space-y-4">
            <Badge variant="outline">FAQ</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Частые вопросы</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-2xl bg-card px-5">
                <AccordionTrigger className="text-sm font-medium hover:no-underline py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="container relative text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold">Готовы начать обучение?</h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-lg">
            Присоединяйтесь к тысячам студентов, которые уже меняют свою карьеру
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Button variant="hero" size="xl" asChild>
              <Link to="/register">Начать сейчас <ArrowRight className="h-5 w-5" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
