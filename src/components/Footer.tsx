import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border bg-secondary/50 py-12">
    <div className="container">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <Link to="/" className="flex items-center gap-2 font-bold text-lg mb-3">
            <BookOpen className="h-5 w-5 text-primary" />
            EduPlatform
          </Link>
          <p className="text-sm text-muted-foreground">
            Платформа онлайн-обучения с лучшими курсами от экспертов
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Платформа</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/catalog" className="hover:text-foreground transition-colors">Каталог курсов</Link></li>
            <li><Link to="/" className="hover:text-foreground transition-colors">О нас</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Поддержка</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground transition-colors">FAQ</Link></li>
            <li><Link to="/" className="hover:text-foreground transition-colors">Контакты</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Правовая информация</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground transition-colors">Пользовательское соглашение</Link></li>
            <li><Link to="/" className="hover:text-foreground transition-colors">Политика конфиденциальности</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border mt-8 pt-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} EduPlatform. Все права защищены.
      </div>
    </div>
  </footer>
);

export default Footer;
