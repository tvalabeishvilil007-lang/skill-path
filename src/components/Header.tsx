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
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="container flex h-14 items-center justify-between gap-4 px-4">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 font-bold text-lg shrink-0">
          <div className="rounded-lg bg-primary/10 p-1.5">
            <BookOpen className="h-4 w-4 text-primary" />
          </div>
          <span className="tracking-tight">Закрытый клуб</span>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-card">
                Кабинет
              </Link>
              {isAdmin && (
                <Link to="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-card">
                  Админка
                </Link>
              )}
              {role && (
                <Badge variant="secondary" className="gap-1.5 text-xs">
                  <ShieldCheck className="h-3 w-3" />
                  {ROLE_LABELS[role]}
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={signOut} className="gap-1.5 text-muted-foreground hover:text-foreground ml-1">
                <LogOut className="h-3.5 w-3.5" /> Выйти
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Войти</Link>
              </Button>
              <Button asChild size="sm" className="rounded-lg">
                <Link to="/register">Зарегистрироваться</Link>
              </Button>
            </>
          )}
        </nav>

        <button className="md:hidden p-2 rounded-lg hover:bg-card transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border/60 bg-background p-4 space-y-3 animate-fade-in">
          {user ? (
            <>
              {role && (
                <Badge variant="secondary" className="gap-1.5 text-xs">
                  <ShieldCheck className="h-3 w-3" />
                  {ROLE_LABELS[role]}
                </Badge>
              )}
              <Link to="/dashboard" className="block text-sm font-medium text-muted-foreground hover:text-foreground py-2" onClick={() => setMobileOpen(false)}>
                Кабинет
              </Link>
              {isAdmin && (
                <Link to="/admin" className="block text-sm font-medium text-muted-foreground hover:text-foreground py-2" onClick={() => setMobileOpen(false)}>
                  Админка
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={() => { signOut(); setMobileOpen(false); }} className="w-full justify-start gap-1.5">
                <LogOut className="h-3.5 w-3.5" /> Выйти
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="block text-sm font-medium text-muted-foreground hover:text-foreground py-2" onClick={() => setMobileOpen(false)}>
                Войти
              </Link>
              <Button asChild size="sm" className="w-full rounded-lg">
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
