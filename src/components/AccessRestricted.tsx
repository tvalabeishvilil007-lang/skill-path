import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Lock, ArrowRight } from "lucide-react";

const AccessRestricted = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 flex items-center justify-center">
      <div className="container max-w-md text-center space-y-6 py-20">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold">Доступ только для участников</h1>
        <p className="text-muted-foreground leading-relaxed">
          Этот раздел доступен только зарегистрированным участникам платформы. Войдите или оформите доступ, чтобы продолжить.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="hero" size="lg" asChild>
            <Link to="/pricing">Получить доступ <ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/login">Войти</Link>
          </Button>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default AccessRestricted;
