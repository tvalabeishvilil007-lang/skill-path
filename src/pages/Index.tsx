import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import ReviewCard from "@/components/ReviewCard";
import { motion } from "framer-motion";
import {
  Lock,
  Shield,
  Zap,
  Monitor,
  ArrowRight,
  BookOpen,
  PlayCircle,
  BarChart3,
  RefreshCw,
  Layers,
  Smartphone,
  UserCheck,
  KeyRound,
  Eye,
  Library,
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
    transition: { delay: i * 0.08, duration: 0.5, ease: [0, 0, 0.2, 1] as const },
  }),
};

const features = [
  { icon: Lock, title: "Закрытый кабинет", desc: "Персональное пространство обучения с доступом только для участников" },
  { icon: Library, title: "Единая библиотека", desc: "Все материалы собраны в структурированную систему внутри платформы" },
  { icon: PlayCircle, title: "Удобный просмотр", desc: "Видеоуроки в HD-качестве с удобным плеером и навигацией" },
  { icon: BarChart3, title: "Отслеживание прогресса", desc: "Визуальная статистика обучения и персональные достижения" },
  { icon: RefreshCw, title: "Обновляемый контент", desc: "Библиотека регулярно дополняется новыми материалами" },
  { icon: Smartphone, title: "Доступ с любого устройства", desc: "Учитесь с компьютера, планшета или телефона без ограничений" },
];

const faqs = [
  { q: "Как получить доступ к платформе?", a: "Оформите участие на странице тарифов, пройдите регистрацию — и доступ откроется моментально." },
  { q: "Как работает подписка?", a: "Вы выбираете тариф с нужным сроком доступа. После оплаты все материалы доступны внутри вашего личного кабинета." },
  { q: "Можно ли смотреть с телефона?", a: "Да, платформа полностью адаптирована для мобильных устройств и планшетов." },
  { q: "Как долго действует доступ?", a: "Срок зависит от выбранного тарифа — от 1 месяца до бессрочного доступа." },
  { q: "Как попасть внутрь платформы?", a: "После оформления доступа и регистрации вы сразу попадаете в закрытый личный кабинет с материалами." },
];

const reviews = [
  { name: "Анна К.", course: "Участник платформы", text: "Наконец нашла место, где всё структурировано и понятно. Закрытый формат создаёт атмосферу серьёзного обучения.", rating: 5 },
  { name: "Михаил Д.", course: "Участник платформы", text: "Удобный кабинет, качественные материалы. Ощущение, что ты в приватном клубе знаний — это мотивирует.", rating: 5 },
  { name: "Елена В.", course: "Участник платформы", text: "Прогресс отслеживается автоматически, библиотека постоянно обновляется. Очень довольна качеством.", rating: 4 },
];

const steps = [
  { step: "01", title: "Оформляете доступ", desc: "Выберите подходящий тариф на странице доступа" },
  { step: "02", title: "Регистрация", desc: "Создайте аккаунт за 30 секунд" },
  { step: "03", title: "Закрытый кабинет", desc: "Получите доступ в персональное пространство" },
  { step: "04", title: "Обучение", desc: "Изучайте материалы внутри платформы" },
];

const insideItems = [
  { icon: PlayCircle, title: "Видеоуроки", desc: "Профессиональные уроки в HD-качестве" },
  { icon: Layers, title: "Структурированные модули", desc: "Пошаговые программы обучения" },
  { icon: BookOpen, title: "Практические материалы", desc: "Задания, шаблоны и рабочие файлы" },
  { icon: RefreshCw, title: "Обновляемая библиотека", desc: "Новые материалы добавляются регулярно" },
  { icon: Eye, title: "Подборки по темам", desc: "Каталог материалов по направлениям" },
  { icon: BarChart3, title: "Прогресс и история", desc: "Личный кабинет с отслеживанием обучения" },
];

const stats = [
  { value: "50+", label: "материалов" },
  { value: "1 000+", label: "участников" },
  { value: "4.8", label: "средний рейтинг" },
  { value: "24/7", label: "доступ" },
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative py-24 md:py-36 overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/5 blur-3xl" />

        <div className="container relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div className="space-y-8" initial="hidden" animate="visible">
              <motion.div variants={fadeUp} custom={0}>
                <Badge variant="outline" className="px-4 py-1.5 text-sm">
                  🔒 Закрытая образовательная платформа
                </Badge>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                custom={1}
                className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight"
              >
                Приватный клуб{" "}
                <span className="text-gradient">знаний.</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={2}
                className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed"
              >
                Закрытая платформа с&nbsp;библиотекой обучающих материалов, персональным кабинетом и&nbsp;системой отслеживания прогресса. Доступ — только для участников.
              </motion.p>

              <motion.div variants={fadeUp} custom={3} className="flex gap-4 flex-wrap">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/pricing">Получить доступ <ArrowRight className="h-5 w-5" /></Link>
                </Button>
                <Button variant="hero-outline" size="xl" asChild>
                  <Link to="/login">Войти</Link>
                </Button>
              </motion.div>

              <motion.div variants={fadeUp} custom={4} className="flex flex-wrap gap-8 pt-4">
                {stats.map((s) => (
                  <div key={s.label} className="space-y-1">
                    <p className="text-2xl font-bold text-primary">{s.value}</p>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Abstract platform mockup */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="hidden lg:block"
            >
              <div className="relative rounded-2xl border border-border bg-card overflow-hidden premium-shadow">
                <div className="p-1">
                  <div className="flex items-center gap-1.5 px-3 py-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-warning/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-success/60" />
                    <div className="ml-auto text-[10px] text-muted-foreground font-mono">platform.app</div>
                  </div>
                  <div className="bg-surface rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Lock className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="h-3 w-32 rounded bg-foreground/10" />
                        <div className="h-2 w-20 rounded bg-muted-foreground/10 mt-1.5" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-lg bg-card border border-border p-3 space-y-2">
                          <div className="h-2 w-full rounded bg-primary/15" />
                          <div className="h-2 w-3/4 rounded bg-muted-foreground/10" />
                          <div className="h-1.5 w-full rounded-full bg-muted mt-2">
                            <div className="h-1.5 rounded-full bg-primary/40" style={{ width: `${30 + i * 20}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1 rounded-lg bg-card border border-border p-3 space-y-2">
                        <div className="h-16 rounded bg-primary/10 flex items-center justify-center">
                          <PlayCircle className="h-6 w-6 text-primary/40" />
                        </div>
                        <div className="h-2 w-3/4 rounded bg-foreground/10" />
                        <div className="h-2 w-1/2 rounded bg-muted-foreground/10" />
                      </div>
                      <div className="w-32 rounded-lg bg-card border border-border p-3 space-y-2">
                        <div className="h-2 w-full rounded bg-foreground/10" />
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                            <div className="h-1.5 w-full rounded bg-muted-foreground/10" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline">Возможности</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Что вы получаете</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Закрытое пространство для обучения с полным набором инструментов
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

      {/* How it works */}
      <section id="how-it-works" className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline">Процесс</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Как получить доступ</h2>
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

      {/* What's inside */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline">Платформа</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Что внутри платформы</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Полноценная система обучения в закрытом кабинете
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {insideItems.map((item, i) => (
              <motion.div
                key={item.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="rounded-2xl border border-border bg-card p-6 space-y-4 card-hover"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <item.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
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
            <h2 className="text-3xl md:text-4xl font-bold">Что говорят участники</h2>
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
          <h2 className="text-3xl md:text-5xl font-bold">Получите доступ к закрытой платформе</h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-lg">
            Присоединяйтесь к участникам, которые уже обучаются внутри приватного пространства
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Button variant="hero" size="xl" asChild>
              <Link to="/pricing">Оформить участие <ArrowRight className="h-5 w-5" /></Link>
            </Button>
            <Button variant="hero-outline" size="xl" asChild>
              <Link to="/login">Войти</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
