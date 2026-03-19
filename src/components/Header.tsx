import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, User, Menu, X } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <BookOpen className="h-6 w-6 text-primary" />
          <span>EduPlatform</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/catalog" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Каталог
          </Link>
          <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Войти
          </Link>
          <Button asChild size="sm">
            <Link to="/register">Регистрация</Link>
          </Button>
        </nav>

        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-3">
          <Link to="/catalog" className="block text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>
            Каталог
          </Link>
          <Link to="/login" className="block text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>
            Войти
          </Link>
          <Button asChild size="sm" className="w-full">
            <Link to="/register" onClick={() => setMobileOpen(false)}>Регистрация</Link>
          </Button>
        </div>
      )}
    </header>
  );
};

export default Header;
