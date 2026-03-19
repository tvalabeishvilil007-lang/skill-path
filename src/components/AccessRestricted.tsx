import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Lock,
  ArrowRight,
  PlayCircle,
  BarChart3,
  Library,
  Smartphone,
  CheckCircle2,
  Shield,
  GraduationCap,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0, 0, 0.2, 1] as const },
  }),
};

const benefits = [
  "200+ часов структурированных материалов",
  "Видеоуроки в HD-качестве",
  "Персональный кабинет с прогрессом",
  "Скачиваемые материалы и шаблоны",
  "Доступ с любого устройства",
  "Обновляемая библиотека",
];

const AccessRestricted = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1">
      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />

        <div className="container relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div className="space-y-8" initial="hidden" animate="visible">
              <motion.div variants={fadeUp} custom={0}>
                <Badge variant="outline" className="px-4 py-1.5 text-sm">
                  🔒 Закрытый раздел
                </Badge>
              </motion.div>

              <motion.h1 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-bold leading-tight">
                Этот раздел доступен только <span className="text-gradient">участникам платформы</span>
              </motion.h1>

              <motion.p variants={fadeUp} custom={2} className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                Вы пытаетесь открыть закрытый раздел образовательной платформы. Библиотека материалов, уроки и личный кабинет доступны только после оформления доступа.
              </motion.p>

              <motion.div variants={fadeUp} custom={3} className="space-y-3">
                {benefits.map((b, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    <span className="text-sm">{b}</span>
                  </div>
                ))}
              </motion.div>

              <motion.div variants={fadeUp} custom={4} className="flex gap-4 flex-wrap">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/pricing">Получить доступ <ArrowRight className="h-5 w-5" /></Link>
                </Button>
                <Button variant="hero-outline" size="xl" asChild>
                  <Link to="/login">Войти</Link>
                </Button>
              </motion.div>

              <motion.div variants={fadeUp} custom={5} className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-success" /> Гарантия возврата 14 дней</div>
                <div className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-primary" /> Безопасная оплата</div>
              </motion.div>
            </motion.div>

            {/* Preview mockup */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="hidden lg:block"
            >
              <div className="rounded-2xl border border-border bg-card overflow-hidden premium-shadow relative">
                {/* Blur overlay */}
                <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Lock className="h-7 w-7 text-primary" />
                    </div>
                    <p className="font-semibold">Доступ закрыт</p>
                    <p className="text-xs text-muted-foreground">Оформите участие для просмотра</p>
                  </div>
                </div>
                {/* Background content */}
                <div className="p-1">
                  <div className="flex items-center gap-1.5 px-3 py-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-warning/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-success/60" />
                  </div>
                  <div className="bg-surface rounded-xl p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <GraduationCap className="h-4 w-4 text-primary" />
                      </div>
                      <div className="h-3 w-32 rounded bg-foreground/10" />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-lg bg-card border border-border p-3 space-y-2">
                          <div className="h-8 rounded bg-primary/10 flex items-center justify-center">
                            <PlayCircle className="h-4 w-4 text-primary/20" />
                          </div>
                          <div className="h-2 w-3/4 rounded bg-foreground/8" />
                          <div className="h-1.5 w-full rounded-full bg-muted" />
                        </div>
                      ))}
                    </div>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-2 rounded-md bg-card border border-border px-3 py-2">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/20" />
                        <div className="h-2 flex-1 rounded bg-muted-foreground/8" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default AccessRestricted;
