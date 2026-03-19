import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();

  const publicLinks = [
    { to: "/about", label: "О платформе" },
    { to: "/#how-it-works", label: "Как это работает" },
    { to: "/pricing", label: "Тарифы" },
    { to: "/#faq", label: "FAQ" },
  ];

  const authLinks = [
    { to: "/dashboard", label: "Кабинет" },
    { to: "/catalog", label: "Каталог" },
  ];

  const links = user ? authLinks : publicLinks;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
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
            <Button variant="ghost" size="sm" onClick={signOut} className="gap-1.5">
              <LogOut className="h-4 w-4" /> Выйти
            </Button>
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
