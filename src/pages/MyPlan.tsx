import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTier } from "@/contexts/TierContext";
import { TIER_CONFIG, TIER_FEATURES, TierLevel, canAccess } from "@/lib/tiers";
import {
  Crown, Shield, ArrowRight, Check, Lock, Zap, Clock,
  Loader2, ChevronRight, Sparkles, Star, BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.45 },
  }),
};

const nextTierMap: Record<TierLevel, TierLevel | null> = {
  none: "basic",
  basic: "optimal",
  optimal: "premium",
  premium: null,
};

const tierPrices: Record<TierLevel, string> = {
  none: "",
  basic: "2 990 ₽",
  optimal: "6 990 ₽",
  premium: "14 990 ₽",
};

const tierPeriods: Record<TierLevel, string> = {
  none: "",
  basic: "1 месяц",
  optimal: "3 месяца",
  premium: "Бессрочный доступ",
};

const MyPlan = () => {
  const { user, loading } = useAuth();
  const { tier } = useTier();

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to="/login" replace />;

  const config = TIER_CONFIG[tier.level];
  const features = TIER_FEATURES[tier.level];
  const isPremium = tier.level === "premium";
  const nextTier = nextTierMap[tier.level];
  const nextConfig = nextTier ? TIER_CONFIG[nextTier] : null;
  const nextFeatures = nextTier ? TIER_FEATURES[nextTier] : [];

  const categoriesPercent = Math.round((tier.categoriesOpen / tier.totalCategories) * 100);
  const materialsPercent = Math.round((tier.materialsOpen / tier.totalMaterials) * 100);

  // Features user does NOT have yet
  const missingFeatures = nextTier
    ? TIER_FEATURES[nextTier].filter((f) => !f.startsWith("Всё из"))
    : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="hero-gradient py-10 md:py-14">
          <div className="container">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Управление доступом</h1>
                <p className="text-muted-foreground text-sm mt-1">Ваш тариф, срок доступа и возможности</p>
              </div>
              <Badge className={config.badgeCls + " text-sm px-4 py-1.5"}>
                {isPremium && <Crown className="h-3.5 w-3.5 mr-1.5" />}
                {tier.name}
              </Badge>
            </div>
          </div>
        </section>

        <div className="container py-8 space-y-8">
          {/* Current plan card */}
          <motion.div
            initial="hidden" animate="visible" variants={fadeUp} custom={0}
            className={`rounded-2xl border p-8 space-y-6 ${isPremium ? "border-warning/30 bg-card premium-shadow" : "border-border bg-card"}`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isPremium ? "bg-warning/10" : "bg-primary/10"}`}>
                  {isPremium ? <Crown className="h-7 w-7 text-warning" /> : <Sparkles className="h-7 w-7 text-primary" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{tier.name}</h2>
                  <p className="text-sm text-muted-foreground">{tierPeriods[tier.level]}</p>
                </div>
              </div>
              {tier.expiresAt && (
                <div className="rounded-xl bg-surface border border-border px-4 py-2.5">
                  <p className="text-xs text-muted-foreground">Доступ до</p>
                  <p className="font-semibold text-sm">{new Date(tier.expiresAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
              )}
            </div>

            {/* Usage bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Категории</span>
                  <span className="font-semibold">{tier.categoriesOpen} из {tier.totalCategories}</span>
                </div>
                <Progress value={categoriesPercent} className="h-2.5" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Материалы</span>
                  <span className="font-semibold">{tier.materialsOpen} из {tier.totalMaterials}</span>
                </div>
                <Progress value={materialsPercent} className="h-2.5" />
              </div>
            </div>

            {/* Included features */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Включено в ваш тариф</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {features.map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-sm">
                    <Check className="h-4 w-4 text-success shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 flex-wrap pt-2">
              {tier.level !== "premium" && (
                <Button asChild>
                  <Link to={`/pricing?highlight=${nextTier}`} className="gap-2">
                    <Zap className="h-4 w-4" /> Улучшить тариф
                  </Link>
                </Button>
              )}
              {tier.expiresAt && (
                <Button variant="outline" asChild>
                  <Link to="/pricing" className="gap-2">
                    <Clock className="h-4 w-4" /> Продлить доступ
                  </Link>
                </Button>
              )}
            </div>
          </motion.div>

          {/* What's NOT available */}
          {nextTier && nextConfig && (
            <motion.div
              initial="hidden" animate="visible" variants={fadeUp} custom={1}
              className="rounded-2xl border border-border bg-card p-8 space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="font-semibold">Недоступно на текущем тарифе</h2>
                  <p className="text-sm text-muted-foreground">Откроется после перехода на «{nextConfig.name}»</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {missingFeatures.map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <Lock className="h-3.5 w-3.5 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <Lock className="h-3.5 w-3.5 shrink-0" />
                  <span>{TIER_CONFIG[nextTier].categoriesOpen - tier.categoriesOpen} дополнительных категорий</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <Lock className="h-3.5 w-3.5 shrink-0" />
                  <span>{TIER_CONFIG[nextTier].materialsOpen - tier.materialsOpen} дополнительных материалов</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Next tier comparison */}
          {nextTier && nextConfig && (
            <motion.div
              initial="hidden" animate="visible" variants={fadeUp} custom={2}
              className="rounded-2xl border border-primary/20 bg-card p-8 space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold">Рекомендуемый апгрейд</h2>
                  <p className="text-sm text-muted-foreground">Перейдите на «{nextConfig.name}» и откройте больше возможностей</p>
                </div>
              </div>

              {/* Comparison */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-border bg-surface p-5 space-y-3">
                  <Badge className={config.badgeCls + " text-xs"}>Сейчас: {tier.name}</Badge>
                  <p className="text-2xl font-bold">{tierPrices[tier.level]}</p>
                  <p className="text-xs text-muted-foreground">{tierPeriods[tier.level]}</p>
                  <div className="space-y-1.5 pt-2">
                    <p className="text-xs text-muted-foreground">{tier.categoriesOpen} категорий</p>
                    <p className="text-xs text-muted-foreground">{tier.materialsOpen} материалов</p>
                  </div>
                </div>
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 space-y-3">
                  <Badge className={nextConfig.badgeCls + " text-xs"}>
                    {nextTier === "premium" && <Crown className="h-3 w-3 mr-1" />}
                    {nextConfig.name}
                  </Badge>
                  <p className="text-2xl font-bold">{tierPrices[nextTier]}</p>
                  <p className="text-xs text-muted-foreground">{tierPeriods[nextTier]}</p>
                  <div className="space-y-1.5 pt-2">
                    <p className="text-xs text-primary font-medium">{TIER_CONFIG[nextTier].categoriesOpen} категорий</p>
                    <p className="text-xs text-primary font-medium">{TIER_CONFIG[nextTier].materialsOpen} материалов</p>
                  </div>
                </div>
              </div>

              <Button size="lg" className="w-full gap-2" asChild>
                <Link to={`/pricing?highlight=${nextTier}`}>
                  Перейти на «{nextConfig.name}» <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          )}

          {/* Security */}
          <div className="rounded-2xl border border-border bg-card p-6 flex items-center gap-4">
            <Shield className="h-8 w-8 text-success shrink-0" />
            <div>
              <p className="font-medium text-sm">Безопасные платежи и гарантия возврата</p>
              <p className="text-xs text-muted-foreground">Все платежи защищены шифрованием. Полный возврат в течение 14 дней после оплаты.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyPlan;
