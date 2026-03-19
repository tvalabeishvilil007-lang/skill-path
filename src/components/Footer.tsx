import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

const footerLinks = {
  platform: [
    { to: "/about", label: "О платформе" },
    { to: "/pricing", label: "Тарифы" },
    { to: "/#faq", label: "FAQ" },
  ],
  support: [
    { to: "/", label: "Помощь" },
    { to: "/", label: "Контакты" },
    { to: "/", label: "Telegram" },
  ],
  legal: [
    { to: "/", label: "Пользовательское соглашение" },
    { to: "/", label: "Политика конфиденциальности" },
    { to: "/", label: "Оферта" },
  ],
};

const Footer = () => (
  <footer className="border-t border-border bg-surface py-16">
    <div className="container">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <Link to="/" className="flex items-center gap-2.5 font-bold text-lg mb-4">
            <div className="rounded-xl bg-primary/10 p-1.5">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            EduPlatform
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Закрытая образовательная платформа. Доступ к библиотеке материалов только для участников.
          </p>
        </div>
        {Object.entries({ "Платформа": footerLinks.platform, "Поддержка": footerLinks.support, "Правовая информация": footerLinks.legal }).map(([title, links]) => (
          <div key={title}>
            <h4 className="font-semibold mb-4 text-sm">{title}</h4>
            <ul className="space-y-3">
              {links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} EduPlatform. Все права защищены.
        </p>
        <p className="text-xs text-muted-foreground">
          Закрытая платформа для участников
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
