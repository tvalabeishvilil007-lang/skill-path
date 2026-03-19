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
  const { role, isAdmin } = useUserRole();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 font-bold text-xl shrink-0">
          <BookOpen className="h-6 w-6 text-primary" />
          <span>Закрытый клуб</span>
        </Link>

        <nav className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Кабинет
              </Link>
              {isAdmin && (
                <Link to="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Админка
                </Link>
              )}
              {role && (
                <Badge variant="secondary" className="gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {ROLE_LABELS[role]}
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={signOut} className="gap-1.5">
                <LogOut className="h-4 w-4" /> Выйти
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Войти
              </Link>
              <Button asChild size="sm">
                <Link to="/register">Зарегистрироваться</Link>
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
          {user ? (
            <>
              {role && (
                <Badge variant="secondary" className="gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {ROLE_LABELS[role]}
                </Badge>
              )}
              <Link to="/dashboard" className="block text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>
                Кабинет
              </Link>
              {isAdmin && (
                <Link to="/admin" className="block text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>
                  Админка
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={() => { signOut(); setMobileOpen(false); }} className="w-full justify-start gap-1.5">
                <LogOut className="h-4 w-4" /> Выйти
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="block text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>
                Войти
              </Link>
              <Button asChild size="sm" className="w-full">
                <Link to="/register" onClick={() => setMobileOpen(false)}>Зарегистрироваться</Link>
              </Button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
