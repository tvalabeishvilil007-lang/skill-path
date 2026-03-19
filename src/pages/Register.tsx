import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Пароль должен быть не менее 6 символов");
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, name);
    setLoading(false);
    if (error) {
      toast.error("Ошибка регистрации: " + error.message);
    } else {
      toast.success("Аккаунт создан! Проверьте email для подтверждения.");
      navigate("/dashboard");
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
            <h1 className="text-2xl font-bold">Регистрация</h1>
            <p className="text-sm text-muted-foreground">Создайте аккаунт для доступа к закрытому клубу</p>
          </div>

          <Card className="rounded-2xl">
            <CardContent className="p-6">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Имя</Label>
                  <Input id="name" placeholder="Ваше имя" value={name} onChange={(e) => setName(e.target.value)} required className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Пароль</Label>
                  <Input id="password" type="password" placeholder="Минимум 6 символов" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 rounded-xl" />
                </div>
                <Button className="w-full h-11 rounded-xl" type="submit" disabled={loading}>
                  {loading ? "Создание..." : "Создать аккаунт"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground">
            Уже есть аккаунт?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">Войти</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Register;
