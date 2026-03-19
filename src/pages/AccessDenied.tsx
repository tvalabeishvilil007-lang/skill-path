import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ShieldAlert, ArrowRight, Lock, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_LABELS, useUserRole } from "@/hooks/useUserRole";
import { isPreviewEnvironment, requestPreviewAdminAccess } from "@/lib/previewAdmin";
import { toast } from "sonner";

const AccessDenied = () => {
  const { user, loading } = useAuth();
  const { role, isLoading } = useUserRole();
  const [granting, setGranting] = useState(false);
  const navigate = useNavigate();
  const isPreview = isPreviewEnvironment();

  if (loading || isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><ShieldAlert className="h-8 w-8 text-primary animate-pulse" /></div>;
  }

  if (!user) return <Navigate to="/login" replace />;

  const handleGrantAdmin = async () => {
    setGranting(true);
    try {
      await requestPreviewAdminAccess();
      toast.success("Preview admin-доступ выдан");
      navigate("/admin", { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Не удалось выдать admin-доступ");
    } finally {
      setGranting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="hero-gradient py-20 md:py-28">
          <div className="container max-w-3xl">
            <div className="rounded-3xl border border-border bg-card p-8 md:p-10 space-y-6 premium-shadow">
              <Badge variant="outline" className="w-fit px-4 py-1.5">Ограничение доступа</Badge>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center shrink-0">
                  <Lock className="h-7 w-7 text-destructive" />
                </div>
                <div className="space-y-3">
                  <h1 className="text-3xl md:text-4xl font-bold">Доступ запрещён</h1>
                  <p className="text-muted-foreground max-w-2xl">
                    Вы авторизованы, но у вашего аккаунта нет роли admin для доступа к CMS-админке.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="secondary">Текущая роль: {role ? ROLE_LABELS[role] : "Без роли"}</Badge>
                <Badge variant="outline">Email: {user.email}</Badge>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-5 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Crown className="h-4 w-4 text-warning" />
                  Что нужно для входа в админку
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• аккаунт с ролью admin</li>
                  <li>• активная авторизация без истекшей сессии</li>
                  <li>• доступ только для тестирования в preview-режиме</li>
                </ul>
              </div>

              <div className="flex flex-wrap gap-3">
                {isPreview && (
                  <Button onClick={handleGrantAdmin} disabled={granting} className="gap-2">
                    {granting ? "Выдаём admin-доступ..." : "Выдать admin-доступ в preview"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="outline" asChild>
                  <Link to="/">На главную</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AccessDenied;
