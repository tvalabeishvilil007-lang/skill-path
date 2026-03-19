import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { BookOpen, ShieldCheck, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { isPreviewEnvironment, requestPreviewAdminAccess } from "@/lib/previewAdmin";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [grantingAdmin, setGrantingAdmin] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const isPreview = isPreviewEnvironment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error("Ошибка входа: " + error.message);
    } else {
      toast.success("Вы вошли в аккаунт!");
      navigate("/dashboard");
    }
  };

  const handlePreviewAdminAccess = async () => {
    setGrantingAdmin(true);
    try {
      await requestPreviewAdminAccess();
      toast.success("Admin-доступ для preview выдан");
      navigate("/admin");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Не удалось выдать admin-доступ");
    } finally {
      setGrantingAdmin(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <BookOpen className="h-10 w-10 text-primary mx-auto" />
            <h1 className="text-2xl font-bold">Вход в аккаунт</h1>
            <p className="text-sm text-muted-foreground">Введите данные для входа</p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Вход..." : "Войти"}
            </Button>
          </form>

          {isPreview && (
            <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
              <Badge variant="outline" className="gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> Preview mode
              </Badge>
              <p className="text-sm text-muted-foreground">
                Для тестирования CMS можно выдать текущему авторизованному аккаунту роль admin только в preview-режиме.
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={handlePreviewAdminAccess}
                disabled={!user || grantingAdmin}
              >
                {grantingAdmin ? "Выдаём admin-доступ..." : "Войти как admin в preview"}
                <ArrowRight className="h-4 w-4" />
              </Button>
              {!user && <p className="text-xs text-muted-foreground">Сначала войдите обычным аккаунтом, затем нажмите кнопку выше.</p>}
            </div>
          )}

          <p className="text-center text-sm text-muted-foreground">
            Нет аккаунта?{" "}
            <Link to="/register" className="text-primary hover:underline font-medium">Зарегистрироваться</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
