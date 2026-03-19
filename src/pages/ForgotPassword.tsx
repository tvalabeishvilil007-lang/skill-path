import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { GraduationCap, Mail, ArrowRight } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success("Письмо отправлено!");
    } catch (err: any) {
      toast.error(err.message || "Ошибка отправки");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center py-16">
        <div className="w-full max-w-md px-4">
          <div className="rounded-2xl border border-border bg-card p-8 space-y-8 premium-shadow">
            <div className="text-center space-y-3">
              <div className="mx-auto rounded-2xl bg-primary/10 p-3 w-fit">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Восстановление пароля</h1>
              <p className="text-sm text-muted-foreground">
                {sent ? "Проверьте вашу почту" : "Введите email для сброса пароля"}
              </p>
            </div>

            {sent ? (
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Мы отправили ссылку для сброса пароля на <strong className="text-foreground">{email}</strong>
                </p>
                <Button variant="outline" asChild>
                  <Link to="/login">Вернуться к входу</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-11 h-12 rounded-xl bg-surface border-border"
                    />
                  </div>
                </div>
                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? "Отправка..." : "Отправить ссылку"} <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            )}

            <p className="text-center text-sm text-muted-foreground">
              Вспомнили пароль?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">Войти</Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
