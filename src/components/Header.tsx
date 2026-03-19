import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Menu, X, LogOut, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_LABELS, useUserRole } from "@/hooks/useUserRole";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { role } = useUserRole();

  const publicLinks = [
    { to: "/about", label: "О платформе" },
    { to: "/#how-it-works", label: "Как это работает" },
    { to: "/pricing", label: "Тарифы" },
    { to: "/#faq", label: "FAQ" },
  ];

  const authLinks = [
    { to: "/dashboard", label: "Кабинет" },
    { to: "/catalog", label: "Каталог" },
    { to: "/my-plan", label: "Мой тариф" },
  ];

  const links = user ? authLinks : publicLinks;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl shrink-0">
          <BookOpen className="h-6 w-6 text-primary" />
          <span>EduPlatform</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </Link>
          ))}
          {user ? (
            <div className="flex items-center gap-3">
              {role && (
                <Badge variant="secondary" className="gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {ROLE_LABELS[role]}
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={signOut} className="gap-1.5">
                <LogOut className="h-4 w-4" /> Выйти
              </Button>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Войти
              </Link>
              <Button asChild size="sm">
                <Link to="/pricing">Получить доступ</Link>
              </Button>
            </>
          )}
        </nav>

        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-3">
          {user && role && (
            <Badge variant="secondary" className="gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              {ROLE_LABELS[role]}
            </Badge>
          )}
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="block text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>
              {l.label}
            </Link>
          ))}
          {user ? (
            <Button variant="ghost" size="sm" onClick={() => { signOut(); setMobileOpen(false); }} className="w-full justify-start gap-1.5">
              <LogOut className="h-4 w-4" /> Выйти
            </Button>
          ) : (
            <>
              <Link to="/login" className="block text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>
                Войти
              </Link>
              <Button asChild size="sm" className="w-full">
                <Link to="/pricing" onClick={() => setMobileOpen(false)}>Получить доступ</Link>
              </Button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
