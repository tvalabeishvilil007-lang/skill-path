import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
          <div className="text-center space-y-3">
            <div className="rounded-2xl bg-primary/10 w-14 h-14 flex items-center justify-center mx-auto">
              <BookOpen className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Вход в аккаунт</h1>
            <p className="text-sm text-muted-foreground">Введите данные для входа в закрытый клуб</p>
          </div>

          <Card className="rounded-2xl">
            <CardContent className="p-6">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Пароль</Label>
                  <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 rounded-xl" />
                </div>
                <Button className="w-full h-11 rounded-xl" type="submit" disabled={loading}>
                  {loading ? "Вход..." : "Войти"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {isPreview && (
            <Card className="rounded-2xl border-dashed">
              <CardContent className="p-4 space-y-3">
                <Badge variant="outline" className="gap-1.5 text-xs">
                  <ShieldCheck className="h-3 w-3" /> Preview mode
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Для тестирования CMS можно выдать текущему аккаунту роль admin.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2 rounded-xl h-10"
                  onClick={handlePreviewAdminAccess}
                  disabled={!user || grantingAdmin}
                >
                  {grantingAdmin ? "Выдаём admin-доступ..." : "Войти как admin в preview"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
                {!user && <p className="text-xs text-muted-foreground">Сначала войдите обычным аккаунтом.</p>}
              </CardContent>
            </Card>
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
