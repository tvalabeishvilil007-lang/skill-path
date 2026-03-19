import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Lock, Users, BookOpen, Shield, Loader2, ArrowRight, MessageCircle, CheckCircle, UserPlus } from "lucide-react";

const benefits = [
  { icon: BookOpen, title: "Эксклюзивные курсы", desc: "Уникальные программы обучения от лучших экспертов отрасли" },
  { icon: Lock, title: "Закрытый доступ", desc: "Контент доступен только зарегистрированным участникам клуба" },
  { icon: Shield, title: "Персональный подход", desc: "Ручная проверка и выдача доступа. Поддержка менеджера" },
  { icon: Users, title: "Личный кабинет", desc: "Удобное управление курсами, заявками и прогрессом" },
];

const steps = [
  { num: "01", icon: UserPlus, title: "Регистрация", desc: "Создайте аккаунт за 30 секунд" },
  { num: "02", icon: BookOpen, title: "Выбор курса", desc: "Выберите программу обучения из каталога" },
  { num: "03", icon: MessageCircle, title: "Заявка", desc: "Оформите заявку — менеджер свяжется с вами" },
  { num: "04", icon: CheckCircle, title: "Доступ", desc: "После подтверждения оплаты доступ будет открыт" },
];

const Index = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(217_91%_60%/0.08),transparent_60%)]" />
        <div className="container relative flex flex-col items-center text-center px-4 pt-20 pb-24 md:pt-32 md:pb-32">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 backdrop-blur-sm px-5 py-2 mb-8 animate-fade-in">
            <Lock className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Закрытый клуб</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold max-w-4xl mb-6 leading-[1.1] animate-fade-in">
            Закрытый клуб<br />
            <span className="text-gradient">обучения</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed animate-fade-in">
            Эксклюзивные курсы и программы обучения. Доступ только после регистрации и подтверждения менеджером.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
            <Button asChild size="lg" className="text-base px-8 h-12 rounded-xl glow-primary">
              <Link to="/register">Зарегистрироваться <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base px-8 h-12 rounded-xl border-border hover:bg-card">
              <Link to="/login">Войти</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section-padding">
        <div className="container px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">Почему участники выбирают нас</h2>
          <p className="text-muted-foreground text-center max-w-xl mx-auto mb-12">Закрытая платформа с ручным контролем качества и персональным сопровождением</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {benefits.map((b, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-6 card-hover group">
                <div className="rounded-xl bg-primary/10 w-12 h-12 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                  <b.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section-padding bg-surface/50">
        <div className="container px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">Как получить доступ к курсу</h2>
          <p className="text-muted-foreground text-center max-w-xl mx-auto mb-12">Простой и прозрачный процесс в 4 шага</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((s, i) => (
              <div key={i} className="relative rounded-2xl border border-border bg-card p-6">
                <span className="text-5xl font-extrabold text-border/60 absolute top-4 right-5 select-none">{s.num}</span>
                <div className="rounded-xl bg-accent/10 w-10 h-10 flex items-center justify-center mb-4">
                  <s.icon className="h-4.5 w-4.5 text-accent" />
                </div>
                <h3 className="font-semibold mb-1.5">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="container px-4">
          <div className="rounded-3xl border border-border bg-card p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(217_91%_60%/0.06),transparent_70%)]" />
            <div className="relative">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Готовы начать обучение?</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">Зарегистрируйтесь, выберите курс и оформите заявку. Мы свяжемся с вами в Telegram.</p>
              <Button asChild size="lg" className="text-base px-10 h-12 rounded-xl glow-primary">
                <Link to="/register">Присоединиться к клубу <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Закрытый клуб обучения. Все права защищены.
        </div>
      </footer>
    </div>
  );
};

export default Index;
