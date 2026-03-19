import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Lock, Users, BookOpen, Shield, Loader2 } from "lucide-react";

const benefits = [
  { icon: BookOpen, title: "Эксклюзивные курсы", desc: "Уникальные программы обучения от экспертов" },
  { icon: Lock, title: "Закрытый доступ", desc: "Контент только для участников клуба" },
  { icon: Shield, title: "Персональный подход", desc: "Ручная выдача доступа и поддержка менеджера" },
  { icon: Users, title: "Личный кабинет", desc: "Удобное управление курсами и прогрессом" },
];

const Index = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-foreground"><Loader2 className="h-8 w-8 animate-spin text-background" /></div>;
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen flex flex-col bg-foreground text-background">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <div className="inline-flex items-center gap-2 rounded-full border border-background/20 px-4 py-1.5 mb-8">
          <Lock className="h-4 w-4" />
          <span className="text-sm font-medium tracking-wide uppercase">Закрытый клуб</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-center max-w-3xl mb-6 tracking-tight">Закрытый клуб обучения</h1>
        <p className="text-lg md:text-xl text-background/60 text-center max-w-xl mb-12">Доступ к эксклюзивным курсам только после регистрации. Присоединяйтесь к сообществу.</p>
        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <Button asChild size="lg" className="bg-background text-foreground hover:bg-background/90 text-base px-8"><Link to="/register">Зарегистрироваться</Link></Button>
          <Button asChild size="lg" variant="outline" className="border-background/30 text-background hover:bg-background/10 text-base px-8"><Link to="/login">Войти</Link></Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl w-full">
          {benefits.map((b, i) => (
            <div key={i} className="rounded-xl border border-background/10 p-6 text-center hover:border-background/25 transition-colors">
              <b.icon className="h-8 w-8 mx-auto mb-4 text-background/70" />
              <h3 className="font-semibold mb-1.5">{b.title}</h3>
              <p className="text-sm text-background/50">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <footer className="text-center py-6 text-background/30 text-sm border-t border-background/10">© {new Date().getFullYear()} Закрытый клуб обучения</footer>
    </div>
  );
};

export default Index;
