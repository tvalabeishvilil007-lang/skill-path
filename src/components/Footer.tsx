import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border py-10">
    <div className="container px-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-sm text-muted-foreground hover:text-foreground transition-colors">
          <div className="rounded-lg bg-primary/10 p-1.5">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
          </div>
          Закрытый клуб
        </Link>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Закрытый клуб обучения. Все права защищены.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
