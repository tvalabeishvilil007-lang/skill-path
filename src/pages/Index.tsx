import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import ReviewCard from "@/components/ReviewCard";
import { motion } from "framer-motion";
import {
  Lock,
  PlayCircle,
  BarChart3,
  RefreshCw,
  Layers,
  Smartphone,
  ArrowRight,
  BookOpen,
  Eye,
  Library,
  Clock,
  GraduationCap,
  CheckCircle2,
  Sparkles,
  Shield,
  Users,
  Video,
  FolderOpen,
  TrendingUp,
  Zap,
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
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0, 0, 0.2, 1] as const },
  }),
};

const stats = [
  { value: "200+", label: "часов материалов", icon: Clock },
  { value: "150+", label: "видеоуроков", icon: Video },
  { value: "30+", label: "тематических модулей", icon: Layers },
  { value: "24/7", label: "доступ к библиотеке", icon: RefreshCw },
];

const features = [
  { icon: Lock, title: "Закрытый кабинет", desc: "Персональное пространство обучения с доступом только для участников платформы" },
  { icon: Library, title: "Единая библиотека", desc: "Все материалы собраны в структурированную систему с удобной навигацией" },
  { icon: PlayCircle, title: "Удобный просмотр", desc: "HD-видеоуроки с прогрессивным плеером, сохранением позиции и заметками" },
  { icon: BarChart3, title: "Отслеживание прогресса", desc: "Детальная статистика обучения, достижения и персональные рекомендации" },
  { icon: RefreshCw, title: "Обновляемый контент", desc: "Библиотека дополняется новыми материалами каждый месяц без доплат" },
  { icon: Smartphone, title: "Любое устройство", desc: "Компьютер, планшет, телефон — продолжайте обучение где угодно" },
];

const memberBenefits = [
  "Полный доступ к библиотеке видеоуроков и практических материалов",
  "Персональный кабинет с отслеживанием прогресса",
  "Структурированные модули с пошаговыми программами",
  "Скачиваемые материалы, шаблоны и рабочие файлы",
  "Автоматическое сохранение позиции просмотра",
  "Приоритетный доступ к новым материалам",
  "История обучения и статистика достижений",
  "Доступ с любого устройства без ограничений",
];

const afterAccess = [
  { icon: FolderOpen, text: "Просматривать всю библиотеку материалов по категориям" },
  { icon: PlayCircle, text: "Смотреть видеоуроки в HD с удобным плеером" },
  { icon: BookOpen, text: "Проходить структурированные модули с практикой" },
  { icon: TrendingUp, text: "Отслеживать свой прогресс и достижения" },
  { icon: Zap, text: "Скачивать практические материалы и шаблоны" },
  { icon: RefreshCw, text: "Получать доступ к новым материалам автоматически" },
];

const cabinetFeatures = [
  { title: "Библиотека материалов", desc: "Все программы, модули и уроки в одном месте с удобным поиском и фильтрами", color: "primary" },
  { title: "Прогресс обучения", desc: "Визуальная статистика: пройденные уроки, время обучения, процент завершения", color: "accent" },
  { title: "Продолжить просмотр", desc: "Система запоминает, где вы остановились, и предлагает продолжить", color: "success" },
  { title: "История и достижения", desc: "Полная история обучения, пройденные модули и персональные достижения", color: "warning" },
];

const insideItems = [
  { icon: Video, title: "Видеоуроки", desc: "Профессиональные уроки в HD-качестве от практиков" },
  { icon: Layers, title: "Структурированные модули", desc: "Пошаговые программы обучения по направлениям" },
  { icon: BookOpen, title: "Практические материалы", desc: "Задания, шаблоны, чек-листы и рабочие файлы" },
  { icon: RefreshCw, title: "Обновляемая библиотека", desc: "Новые материалы добавляются каждый месяц" },
  { icon: Eye, title: "Подборки по темам", desc: "Каталогизированные материалы по направлениям" },
  { icon: BarChart3, title: "Прогресс и история", desc: "Персональная статистика и достижения" },
];

const faqs = [
  { q: "Как получить доступ к платформе?", a: "Выберите подходящий тариф на странице доступа, пройдите регистрацию — и ваш персональный кабинет будет готов в течение нескольких минут." },
  { q: "Как работает доступ?", a: "После оплаты вы получаете доступ в закрытый личный кабинет, где доступна вся библиотека материалов. Срок зависит от выбранного тарифа — от 1 месяца до бессрочного." },
  { q: "Можно ли смотреть с телефона?", a: "Да, платформа полностью адаптирована для мобильных устройств и планшетов. Прогресс синхронизируется между устройствами." },
  { q: "Как долго действует доступ?", a: "Срок зависит от тарифа: 1 месяц, 3 месяца, 6 месяцев или бессрочный доступ. При бессрочном доступе все обновления включены." },
  { q: "Что будет после окончания доступа?", a: "Вы можете продлить доступ в любой момент. Ваш прогресс и история обучения сохраняются." },
];

const reviews = [
  { name: "Анна К.", course: "Участник платформы", text: "Наконец нашла место, где всё структурировано и понятно. Закрытый формат создаёт атмосферу серьёзного обучения. Прогресс отслеживается автоматически — это очень удобно.", rating: 5 },
  { name: "Михаил Д.", course: "Участник платформы", text: "Удобный кабинет, качественные материалы. Ощущение, что ты в приватном клубе знаний — это мотивирует. Уже прошёл несколько модулей.", rating: 5 },
  { name: "Елена В.", course: "Участник платформы", text: "Библиотека постоянно обновляется, новые материалы появляются каждый месяц. Плеер удобный, можно продолжить с того места, где остановилась.", rating: 4 },
];

const steps = [
  { step: "01", title: "Выберите тариф", desc: "Подберите подходящий план доступа к платформе" },
  { step: "02", title: "Регистрация", desc: "Создайте аккаунт за 30 секунд" },
  { step: "03", title: "Закрытый кабинет", desc: "Получите персональный доступ к библиотеке" },
  { step: "04", title: "Обучение", desc: "Изучайте материалы в удобном темпе" },
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

              <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
                Ваш приватный{" "}<span className="text-gradient">learning vault.</span>
              </motion.h1>

              <motion.p variants={fadeUp} custom={2} className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
                200+ часов структурированных материалов в&nbsp;закрытом личном кабинете. Видеоуроки, практика, модули и&nbsp;отслеживание прогресса — доступ только для участников.
              </motion.p>

              <motion.div variants={fadeUp} custom={3} className="flex gap-4 flex-wrap">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/pricing">Получить доступ <ArrowRight className="h-5 w-5" /></Link>
                </Button>
                <Button variant="hero-outline" size="xl" asChild>
                  <Link to="/login">Войти</Link>
                </Button>
              </motion.div>

              <motion.div variants={fadeUp} custom={4} className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 text-success" />
                  <span>Гарантия возврата 14 дней</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  <span>1 000+ участников</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Premium mockup */}
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
                    <div className="ml-auto text-[10px] text-muted-foreground font-mono">learning-vault.app</div>
                  </div>
                  <div className="bg-surface rounded-xl p-5 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                          <GraduationCap className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="h-3 w-24 rounded bg-foreground/15" />
                          <div className="h-2 w-16 rounded bg-muted-foreground/10 mt-1" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-6 w-16 rounded-md bg-primary/15 flex items-center justify-center">
                          <div className="h-2 w-10 rounded bg-primary/30" />
                        </div>
                      </div>
                    </div>
                    {/* Stats row */}
                    <div className="grid grid-cols-4 gap-2">
                      {["78%", "12/15", "4.2h", "3"].map((v, i) => (
                        <div key={i} className="rounded-lg bg-card border border-border p-2 text-center">
                          <div className="text-xs font-semibold text-primary">{v}</div>
                          <div className="h-1.5 w-8 mx-auto rounded bg-muted-foreground/10 mt-1" />
                        </div>
                      ))}
                    </div>
                    {/* Continue watching */}
                    <div className="space-y-2">
                      <div className="h-2 w-28 rounded bg-foreground/10" />
                      <div className="flex gap-2">
                        <div className="flex-1 rounded-lg bg-card border border-border p-2.5">
                          <div className="h-12 rounded bg-primary/8 flex items-center justify-center mb-2">
                            <PlayCircle className="h-5 w-5 text-primary/30" />
                          </div>
                          <div className="h-2 w-3/4 rounded bg-foreground/10" />
                          <div className="h-1.5 w-full rounded-full bg-muted mt-2">
                            <div className="h-1.5 rounded-full bg-primary/50" style={{ width: "65%" }} />
                          </div>
                        </div>
                        <div className="flex-1 rounded-lg bg-card border border-border p-2.5">
                          <div className="h-12 rounded bg-accent/8 flex items-center justify-center mb-2">
                            <PlayCircle className="h-5 w-5 text-accent/30" />
                          </div>
                          <div className="h-2 w-2/3 rounded bg-foreground/10" />
                          <div className="h-1.5 w-full rounded-full bg-muted mt-2">
                            <div className="h-1.5 rounded-full bg-accent/50" style={{ width: "30%" }} />
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Module list */}
                    <div className="space-y-1.5">
                      {[70, 100, 45, 0].map((p, i) => (
                        <div key={i} className="flex items-center gap-2 rounded-md bg-card border border-border px-3 py-1.5">
                          <div className={`w-2 h-2 rounded-full ${p === 100 ? "bg-success" : p > 0 ? "bg-primary" : "bg-muted-foreground/20"}`} />
                          <div className="h-1.5 flex-1 rounded bg-muted-foreground/10" />
                          <div className="text-[9px] text-muted-foreground font-mono">{p}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quantitative stats */}
      <section className="py-16 md:py-20 border-y border-border">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={i}
                className="text-center space-y-3"
              >
                <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
                <p className="text-3xl md:text-4xl font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline">Возможности</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Что вы получаете как участник</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Полноценная образовательная экосистема в закрытом формате
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={i}
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

      {/* What member gets */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <Badge variant="outline">Для участников</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">Что получает участник платформы</h2>
              <p className="text-muted-foreground leading-relaxed">
                Оформляя доступ, вы получаете полноценное образовательное пространство с&nbsp;библиотекой материалов, инструментами обучения и&nbsp;персональным прогрессом.
              </p>
              <div className="space-y-3">
                {memberBenefits.map((b, i) => (
                  <motion.div
                    key={i}
                    initial="hidden" whileInView="visible" viewport={{ once: true }}
                    variants={fadeUp} custom={i}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
                    <span className="text-sm leading-relaxed">{b}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-8 space-y-6 premium-shadow">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="h-5 w-5 text-accent" />
                <h3 className="font-semibold">Ваш персональный кабинет</h3>
              </div>
              {cabinetFeatures.map((cf, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 bg-${cf.color}`} />
                  <div>
                    <p className="font-medium text-sm">{cf.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{cf.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How cabinet works */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline">Личный кабинет</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Как устроен личный кабинет</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Всё для удобного и результативного обучения в одном интерфейсе
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {cabinetFeatures.map((cf, i) => (
              <motion.div
                key={cf.title}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={i}
                className="rounded-2xl border border-border bg-card p-6 space-y-3 card-hover"
              >
                <div className={`w-10 h-10 rounded-lg bg-${cf.color}/10 flex items-center justify-center`}>
                  <div className={`w-3 h-3 rounded-full bg-${cf.color}`} />
                </div>
                <h3 className="font-semibold">{cf.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{cf.desc}</p>
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
            <h2 className="text-3xl md:text-4xl font-bold">Что доступно внутри</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Полноценная система обучения без раскрытия конкретных программ до получения доступа
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {insideItems.map((item, i) => (
              <motion.div
                key={item.title}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={i}
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

      {/* After access */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/3 to-background" />
        <div className="container relative">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline">Результат</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">После получения доступа вы сможете</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {afterAccess.map((item, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={i}
                className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5"
              >
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                  <item.icon className="h-5 w-5 text-success" />
                </div>
                <p className="text-sm leading-relaxed">{item.text}</p>
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
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={i}
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
            <h2 className="text-3xl md:text-4xl font-bold">Что говорят участники</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((r, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
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
                <AccordionTrigger className="text-sm font-medium hover:no-underline py-5">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-5">{faq.a}</AccordionContent>
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
            Присоединяйтесь к 1 000+ участникам, которые уже обучаются внутри приватного пространства
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Button variant="hero" size="xl" asChild>
              <Link to="/pricing">Оформить участие <ArrowRight className="h-5 w-5" /></Link>
            </Button>
            <Button variant="hero-outline" size="xl" asChild>
              <Link to="/login">Войти</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Гарантия возврата 14 дней • Моментальный доступ после оплаты</p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
