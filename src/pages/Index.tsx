import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { mockCourses } from "@/data/mockCourses";
import { motion } from "framer-motion";
import {
  Play,
  Award,
  Clock,
  Users,
  ChevronDown,
  Star,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const features = [
  { icon: Play, title: "Видеоуроки", desc: "Качественное видео с практическими примерами" },
  { icon: Award, title: "Сертификаты", desc: "Подтверждение навыков после завершения курса" },
  { icon: Clock, title: "Доступ навсегда", desc: "Возвращайтесь к материалам в любое время" },
  { icon: Users, title: "Поддержка", desc: "Помощь преподавателей и сообщество студентов" },
];

const faqs = [
  { q: "Как начать обучение?", a: "Зарегистрируйтесь, выберите курс и оплатите его. Доступ откроется моментально после оплаты." },
  { q: "Можно ли вернуть деньги?", a: "Да, мы предоставляем возврат в течение 14 дней после покупки, если вы прошли менее 30% курса." },
  { q: "Как долго длится доступ?", a: "Большинство курсов предоставляют бессрочный доступ. Для некоторых курсов срок указан на странице." },
  { q: "Получу ли я сертификат?", a: "Да, после прохождения всех уроков курса вы получите именной сертификат." },
  { q: "Можно ли учиться с телефона?", a: "Да, платформа полностью адаптирована для мобильных устройств." },
];

const reviews = [
  { name: "Анна К.", course: "Веб-разработка", text: "Отличный курс! Устроилась на работу через 2 месяца после завершения.", rating: 5 },
  { name: "Михаил Д.", course: "UX/UI Дизайн", text: "Очень структурированная подача материала. Рекомендую всем начинающим.", rating: 5 },
  { name: "Елена В.", course: "Python", text: "Преподаватель объясняет сложные вещи простым языком. Супер!", rating: 4 },
];

const Index = () => {
  const featuredCourses = mockCourses.filter((c) => c.isFeatured);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="hero-gradient text-hero-foreground py-20 md:py-32">
        <div className="container">
          <motion.div
            className="max-w-2xl space-y-6"
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              variants={fadeUp}
              custom={0}
              className="text-4xl md:text-6xl font-bold leading-tight"
            >
              Учитесь у лучших.{" "}
              <span className="text-gradient">Растите быстрее.</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-lg text-hero-muted max-w-xl"
            >
              Онлайн-курсы от практикующих экспертов. Видеоуроки, практические задания и поддержка на каждом шаге.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="flex gap-4 flex-wrap">
              <Button variant="hero" size="lg" asChild>
                <Link to="/catalog">Смотреть курсы</Link>
              </Button>
              <Button variant="hero-outline" size="lg" asChild>
                <Link to="/register">Начать бесплатно</Link>
              </Button>
            </motion.div>
            <motion.div variants={fadeUp} custom={3} className="flex gap-8 pt-4 text-sm text-hero-muted">
              <span><strong className="text-hero-foreground">50+</strong> курсов</span>
              <span><strong className="text-hero-foreground">10 000+</strong> студентов</span>
              <span><strong className="text-hero-foreground">4.8</strong> средний рейтинг</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 bg-surface">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Почему выбирают нас</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="rounded-lg border border-border bg-card p-6 text-center space-y-3"
              >
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Courses */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold">Популярные курсы</h2>
            <Button variant="outline" asChild>
              <Link to="/catalog">Все курсы</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-16 md:py-24 bg-surface">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Отзывы студентов</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((r, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="rounded-lg border border-border bg-card p-6 space-y-3"
              >
                <div className="flex gap-1">
                  {Array.from({ length: r.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">«{r.text}»</p>
                <div>
                  <p className="font-semibold text-sm">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.course}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-24">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Как проходит обучение</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Регистрация", desc: "Создайте аккаунт за 30 секунд" },
              { step: "02", title: "Выбор курса", desc: "Найдите курс по вашей теме" },
              { step: "03", title: "Обучение", desc: "Смотрите уроки в удобном темпе" },
              { step: "04", title: "Результат", desc: "Получите навыки и сертификат" },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="text-center space-y-2"
              >
                <div className="text-4xl font-bold text-primary/20">{s.step}</div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-surface">
        <div className="container max-w-2xl">
          <h2 className="text-3xl font-bold text-center mb-12">Часто задаваемые вопросы</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-lg bg-card px-4">
                <AccordionTrigger className="text-sm font-medium hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="hero-gradient text-hero-foreground py-16 md:py-24">
        <div className="container text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">Готовы начать обучение?</h2>
          <p className="text-hero-muted max-w-lg mx-auto">
            Присоединяйтесь к тысячам студентов, которые уже меняют свою карьеру
          </p>
          <Button variant="hero" size="lg" asChild>
            <Link to="/register">Начать сейчас</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
