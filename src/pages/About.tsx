import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Lock, PlayCircle, Layers, BarChart3, Smartphone, ArrowRight,
  KeyRound, BookOpen, RefreshCw, Shield, CheckCircle2, Video,
  FolderOpen, GraduationCap, Clock, Users, Eye,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0, 0, 0.2, 1] as const },
  }),
};

const platformFeatures = [
  { icon: Lock, title: "Закрытый формат", desc: "Все материалы доступны только зарегистрированным участникам. Это создаёт атмосферу серьёзного обучения и фокусирует на результате." },
  { icon: KeyRound, title: "Персональный доступ", desc: "После оформления вы получаете персональный кабинет с библиотекой, прогрессом и историей обучения." },
  { icon: PlayCircle, title: "HD-видеоуроки", desc: "Профессиональные видеоуроки с удобным плеером, сохранением позиции и возможностью ускорения." },
  { icon: Layers, title: "Структурированные модули", desc: "Материалы организованы в пошаговые программы — от базовых концепций к продвинутым темам." },
  { icon: Smartphone, title: "Любое устройство", desc: "Компьютер, планшет, телефон — прогресс синхронизируется между всеми устройствами автоматически." },
  { icon: BarChart3, title: "Прогресс обучения", desc: "Система отслеживает пройденные уроки, показывает статистику и сохраняет позицию просмотра." },
];

const formats = [
  { icon: Video, title: "Видеоуроки", desc: "200+ часов профессионального контента в HD" },
  { icon: Layers, title: "Модули", desc: "30+ тематических модулей с пошаговой структурой" },
  { icon: BookOpen, title: "Практика", desc: "Задания, шаблоны, чек-листы и рабочие файлы" },
  { icon: RefreshCw, title: "Обновления", desc: "Новые материалы добавляются ежемесячно" },
];

const learningSteps = [
  { title: "Выбираете направление", desc: "Изучаете категории библиотеки и выбираете интересующую тему" },
  { title: "Проходите модули", desc: "Смотрите видеоуроки и выполняете практические задания в удобном темпе" },
  { title: "Отслеживаете прогресс", desc: "Видите свою статистику, пройденные уроки и достижения" },
  { title: "Возвращаетесь к материалам", desc: "Система запоминает позицию, можно продолжить в любой момент" },
];

const advantages = [
  "Сфокусированная среда без отвлечений",
  "Мотивация через закрытое сообщество",
  "Высокое качество контента от практиков",
  "Персонализированный опыт обучения",
  "Постоянное обновление библиотеки",
  "Техническая поддержка участников",
];

const About = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1">
      {/* Hero */}
      <section className="hero-gradient py-20 md:py-28">
        <div className="container max-w-3xl text-center space-y-6">
          <Badge variant="outline" className="px-4 py-1.5">О платформе</Badge>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Закрытая образовательная <span className="text-gradient">экосистема</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Приватное пространство обучения с&nbsp;библиотекой из&nbsp;200+ часов материалов, структурированными модулями и&nbsp;персональным отслеживанием прогресса. Доступ — только для участников.
          </p>
          <div className="flex items-center justify-center gap-6 pt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> 200+ часов</div>
            <div className="flex items-center gap-2"><Layers className="h-4 w-4 text-accent" /> 30+ модулей</div>
            <div className="flex items-center gap-2"><Users className="h-4 w-4 text-success" /> 1 000+ участников</div>
          </div>
        </div>
      </section>

      {/* Platform features */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold">Как устроена платформа</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Полноценная образовательная система в закрытом формате</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformFeatures.map((f, i) => (
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

      {/* Formats */}
      <section className="py-16 md:py-24">
        <div className="container max-w-4xl">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl font-bold">Форматы материалов</h2>
            <p className="text-muted-foreground">Библиотека включает разнообразные форматы обучения</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {formats.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={i}
                className="rounded-2xl border border-border bg-card p-6 space-y-3 card-hover"
              >
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <f.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How learning works */}
      <section className="py-16 md:py-24">
        <div className="container max-w-3xl">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl font-bold">Как проходит обучение</h2>
          </div>
          <div className="space-y-6">
            {learningSteps.map((s, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={i}
                className="flex items-start gap-5"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                  <span className="text-sm font-bold text-primary">{i + 1}</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why closed format */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Почему закрытый формат удобен</h2>
              <p className="text-muted-foreground leading-relaxed">
                Закрытая платформа — это не ограничение, а преимущество. Участники получают сфокусированную среду без отвлечений, персонализированный опыт и высокое качество контента.
              </p>
              <div className="space-y-3">
                {advantages.map((a, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    <span className="text-sm">{a}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-8 premium-shadow space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold">Участник платформы</p>
                  <p className="text-xs text-muted-foreground">Активный доступ</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Пройдено", value: "78%", color: "primary" },
                  { label: "Модулей", value: "12/15", color: "accent" },
                  { label: "Часов", value: "42", color: "success" },
                  { label: "Серия дней", value: "14", color: "warning" },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg bg-surface border border-border p-3 text-center">
                    <p className={`text-lg font-bold text-${s.color}`}>{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary" style={{ width: "78%" }} />
              </div>
              <p className="text-xs text-muted-foreground text-center">Общий прогресс обучения</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="container relative text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">Станьте участником платформы</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Оформите доступ и начните обучение в закрытом приватном пространстве
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="hero" size="xl" asChild>
              <Link to="/pricing">Получить доступ <ArrowRight className="h-5 w-5" /></Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Гарантия возврата 14 дней • Моментальный доступ</p>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default About;
