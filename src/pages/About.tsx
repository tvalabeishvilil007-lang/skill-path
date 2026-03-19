import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, PlayCircle, Layers, BarChart3, Smartphone, ArrowRight, KeyRound, BookOpen } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0, 0, 0.2, 1] as const },
  }),
};

const formats = [
  { icon: PlayCircle, title: "Видеоуроки", desc: "Профессиональные уроки в HD-качестве с удобным плеером" },
  { icon: Layers, title: "Структурированные модули", desc: "Материалы разбиты на пошаговые программы обучения" },
  { icon: BookOpen, title: "Практические задания", desc: "Файлы, шаблоны и задания для закрепления знаний" },
  { icon: BarChart3, title: "Личный прогресс", desc: "Отслеживание пройденных уроков и достижений" },
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
            Закрытая образовательная <span className="text-gradient">платформа</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Приватное пространство обучения с&nbsp;единой библиотекой материалов, удобным личным кабинетом и&nbsp;системой отслеживания прогресса. Доступ — только для участников.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-24">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Как устроена платформа</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Закрытый формат</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Все материалы доступны только зарегистрированным участникам внутри персонального кабинета. Это создаёт атмосферу серьёзного обучения.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <KeyRound className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Персональный доступ</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                После оформления доступа вы получаете персональный кабинет с библиотекой материалов, прогрессом и историей обучения.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Любое устройство</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Платформа полностью адаптирована для компьютеров, планшетов и мобильных устройств.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Прогресс обучения</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Система автоматически отслеживает пройденные уроки, показывает статистику и сохраняет позицию просмотра.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Formats */}
      <section className="py-16 md:py-24">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Форматы материалов</h2>
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

      {/* CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="container relative text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">Готовы начать?</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Оформите доступ и начните обучение внутри закрытой платформы
          </p>
          <Button variant="hero" size="xl" asChild>
            <Link to="/pricing">Получить доступ <ArrowRight className="h-5 w-5" /></Link>
          </Button>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default About;
