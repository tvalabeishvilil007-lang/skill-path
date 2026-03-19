import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useTier } from "@/contexts/TierContext";
import { TIER_CONFIG, TierLevel } from "@/lib/tiers";
import { Check, ArrowRight, Star, Shield, Zap, Clock, Smartphone, Laptop, Tablet, HelpCircle, Crown, ChevronRight } from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0, 0, 0.2, 1] as const },
  }),
};

const plans: {
  key: TierLevel;
  name: string;
  period: string;
  price: string;
  oldPrice?: string;
  priceNote: string;
  features: string[];
  excluded: string[];
  popular: boolean;
  cta: string;
  categories: number;
  materials: number;
}[] = [
  {
    key: "basic",
    name: "Базовый",
    period: "1 месяц",
    price: "2 990",
    priceNote: "за 1 месяц доступа",
    features: [
      "Доступ к библиотеке (3 категории)",
      "Личный кабинет с прогрессом",
      "Видеоуроки в HD-качестве",
      "Доступ с любого устройства",
    ],
    excluded: [
      "Скачиваемые материалы",
      "Приоритетные обновления",
      "Приватное комьюнити",
    ],
    popular: false,
    cta: "Начать обучение",
    categories: 3,
    materials: 15,
  },
  {
    key: "optimal",
    name: "Оптимальный",
    period: "3 месяца",
    price: "6 990",
    oldPrice: "8 970",
    priceNote: "≈ 2 330 ₽/мес — экономия 22%",
    features: [
      "Всё из Базового тарифа",
      "5 категорий материалов",
      "Скачиваемые материалы и шаблоны",
      "Приоритетные обновления",
      "Поддержка участников",
    ],
    excluded: [
      "Бессрочный доступ",
      "Приватное комьюнити",
    ],
    popular: true,
    cta: "Лучший выбор",
    categories: 5,
    materials: 35,
  },
  {
    key: "premium",
    name: "Premium",
    period: "Бессрочный доступ",
    price: "14 990",
    priceNote: "разовый платёж навсегда",
    features: [
      "Всё из Оптимального тарифа",
      "Все 6 категорий без ограничений",
      "Бессрочный доступ без продления",
      "Приватное комьюнити участников",
      "Персональная поддержка",
      "Ранний доступ к новым материалам",
    ],
    excluded: [],
    popular: false,
    cta: "Максимальный доступ",
    categories: 6,
    materials: 50,
  },
];

const comparisonFeatures = [
  { name: "Библиотека видеоуроков", basic: true, optimal: true, premium: true },
  { name: "Личный кабинет", basic: true, optimal: true, premium: true },
  { name: "Отслеживание прогресса", basic: true, optimal: true, premium: true },
  { name: "Доступ с любых устройств", basic: true, optimal: true, premium: true },
  { name: "Категорий контента", basic: "3", optimal: "5", premium: "Все 6" },
  { name: "Материалов доступно", basic: "15", optimal: "35", premium: "Все 50" },
  { name: "Скачиваемые материалы", basic: false, optimal: true, premium: true },
  { name: "Приоритетные обновления", basic: false, optimal: true, premium: true },
  { name: "Поддержка участников", basic: false, optimal: true, premium: true },
  { name: "Приватное комьюнити", basic: false, optimal: false, premium: true },
  { name: "Персональная поддержка", basic: false, optimal: false, premium: true },
  { name: "Все будущие обновления", basic: false, optimal: false, premium: true },
];

const pricingFaqs = [
  { q: "Как быстро откроется доступ?", a: "Моментально. После оплаты ваш персональный кабинет будет доступен в течение нескольких минут." },
  { q: "Какие способы оплаты принимаются?", a: "Банковские карты (Visa, Mastercard, МИР), а также банковский перевод." },
  { q: "Можно ли вернуть деньги?", a: "Да, полный возврат в течение 14 дней после оплаты." },
  { q: "Что происходит после окончания срока?", a: "Вы можете продлить доступ. Ваш прогресс и история сохраняются навсегда." },
  { q: "Можно ли перейти на другой тариф?", a: "Да, в любое время. Разница в стоимости пересчитывается автоматически." },
  { q: "На каких устройствах можно учиться?", a: "На любых: компьютер, планшет, телефон. Прогресс синхронизируется." },
];

const Pricing = () => {
  const [searchParams] = useSearchParams();
  const highlightTier = searchParams.get("highlight") as TierLevel | null;
  const { user } = useAuth();
  const tierCtx = useTier();
  const currentTier = tierCtx?.tier?.level || "none";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="hero-gradient py-20 md:py-28">
          <div className="container max-w-3xl text-center space-y-6">
            <Badge variant="outline" className="px-4 py-1.5">Тарифы и доступ</Badge>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Выберите свой <span className="text-gradient">формат доступа</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              {user
                ? "Улучшите ваш тариф и откройте больше возможностей платформы"
                : "Оформите участие в закрытой образовательной платформе"}
            </p>
            <div className="flex items-center justify-center gap-6 pt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-success" /> Возврат 14 дней</div>
              <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-warning" /> Моментальный доступ</div>
              <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Начало за 2 минуты</div>
            </div>
          </div>
        </section>

        {/* Current plan indicator for auth users */}
        {user && currentTier !== "none" && (
          <div className="container max-w-5xl -mt-6 mb-2">
            <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className={TIER_CONFIG[currentTier].badgeCls + " text-xs"}>
                  {currentTier === "premium" && <Crown className="h-3 w-3 mr-1" />}
                  Текущий: {TIER_CONFIG[currentTier].name}
                </Badge>
                <span className="text-sm text-muted-foreground">Выберите тариф для апгрейда</span>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/my-plan" className="gap-1.5">Мой тариф <ChevronRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </div>
          </div>
        )}

        {/* Plans */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {plans.map((plan, i) => {
                const isHighlighted = highlightTier === plan.key;
                const isCurrentPlan = user && currentTier === plan.key;
                const isDowngrade = user && TIER_CONFIG[currentTier]?.rank > TIER_CONFIG[plan.key]?.rank;
                const showPopular = isHighlighted || (!highlightTier && plan.popular);

                return (
                  <motion.div
                    key={plan.name}
                    initial="hidden" whileInView="visible" viewport={{ once: true }}
                    variants={fadeUp} custom={i}
                    className={`relative rounded-2xl border p-8 flex flex-col ${
                      isHighlighted
                        ? "border-primary/60 bg-card glow-primary ring-2 ring-primary/20"
                        : showPopular
                          ? "border-primary/50 bg-card glow-primary"
                          : "border-border bg-card"
                    }`}
                  >
                    {isHighlighted && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground gap-1">
                          <Star className="h-3 w-3" /> Рекомендуем
                        </Badge>
                      </div>
                    )}
                    {!isHighlighted && showPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground gap-1">
                          <Star className="h-3 w-3" /> Популярный
                        </Badge>
                      </div>
                    )}
                    {isCurrentPlan && (
                      <div className="absolute -top-3 right-4">
                        <Badge variant="secondary" className="text-xs">Ваш тариф</Badge>
                      </div>
                    )}

                    <div className="space-y-2 mb-6">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        {plan.key === "premium" && <Crown className="h-5 w-5 text-warning" />}
                        {plan.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{plan.period}</p>
                    </div>

                    <div className="space-y-1 mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">{plan.price}</span>
                        <span className="text-muted-foreground">₽</span>
                      </div>
                      {plan.oldPrice && (
                        <p className="text-sm text-muted-foreground line-through">{plan.oldPrice} ₽</p>
                      )}
                      <p className="text-xs text-muted-foreground">{plan.priceNote}</p>
                    </div>

                    {/* Access stats */}
                    <div className="grid grid-cols-2 gap-2 mb-6">
                      <div className="rounded-lg bg-surface border border-border p-2 text-center">
                        <p className="text-sm font-bold text-primary">{plan.categories}</p>
                        <p className="text-[10px] text-muted-foreground">категорий</p>
                      </div>
                      <div className="rounded-lg bg-surface border border-border p-2 text-center">
                        <p className="text-sm font-bold text-accent">{plan.materials}</p>
                        <p className="text-[10px] text-muted-foreground">материалов</p>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-6 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm">
                          <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                      {plan.excluded.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground/50">
                          <div className="w-4 h-4 mt-0.5 shrink-0 flex items-center justify-center">
                            <div className="w-1.5 h-0.5 rounded bg-muted-foreground/30" />
                          </div>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      variant={isHighlighted || showPopular ? "hero" : "outline"}
                      size="lg"
                      className="w-full"
                      disabled={!!isDowngrade}
                      asChild={!isDowngrade}
                    >
                      {isCurrentPlan ? (
                        <span>Текущий тариф</span>
                      ) : isDowngrade ? (
                        <span>Включён в ваш тариф</span>
                      ) : (
                        <Link to="/register">
                          {plan.cta} <ArrowRight className="h-4 w-4" />
                        </Link>
                      )}
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Comparison table */}
        <section className="py-16 md:py-24">
          <div className="container max-w-4xl">
            <div className="text-center mb-12 space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold">Сравнение тарифов</h2>
              <p className="text-muted-foreground">Подробное сравнение возможностей каждого тарифа</p>
            </div>
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="grid grid-cols-4 gap-0 text-sm">
                <div className="p-4 font-semibold border-b border-border bg-surface">Возможность</div>
                <div className={`p-4 font-semibold border-b border-border text-center ${currentTier === "basic" ? "bg-primary/10" : "bg-surface"}`}>
                  Базовый {currentTier === "basic" && <span className="text-[10px] block text-primary">ваш</span>}
                </div>
                <div className={`p-4 font-semibold border-b border-border text-center ${currentTier === "optimal" ? "bg-primary/10" : highlightTier === "optimal" ? "bg-primary/5" : "bg-surface"}`}>
                  Оптимальный {currentTier === "optimal" && <span className="text-[10px] block text-primary">ваш</span>}
                </div>
                <div className={`p-4 font-semibold border-b border-border text-center ${currentTier === "premium" ? "bg-warning/10" : "bg-surface"}`}>
                  Premium {currentTier === "premium" && <span className="text-[10px] block text-warning">ваш</span>}
                </div>
                {comparisonFeatures.map((f, i) => (
                  <React.Fragment key={i}>
                    <div className="p-4 border-b border-border text-muted-foreground">{f.name}</div>
                    {(["basic", "optimal", "premium"] as const).map((tier) => (
                      <div key={tier} className={`p-4 border-b border-border text-center ${currentTier === tier ? "bg-primary/5" : highlightTier === tier ? "bg-primary/3" : ""}`}>
                        {typeof f[tier] === "string"
                          ? <span className="text-xs font-medium">{f[tier]}</span>
                          : f[tier]
                            ? <Check className="h-4 w-4 text-success mx-auto" />
                            : <div className="w-1.5 h-0.5 rounded bg-muted-foreground/30 mx-auto" />
                        }
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Devices */}
        <section className="py-16 md:py-20">
          <div className="container max-w-3xl text-center space-y-8">
            <h2 className="text-2xl md:text-3xl font-bold">Учитесь на любом устройстве</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Прогресс синхронизируется автоматически.</p>
            <div className="flex justify-center gap-12">
              {[
                { icon: Laptop, label: "Компьютер" },
                { icon: Tablet, label: "Планшет" },
                { icon: Smartphone, label: "Телефон" },
              ].map((d) => (
                <div key={d.label} className="text-center space-y-2">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <d.icon className="h-7 w-7 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">{d.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-24">
          <div className="container max-w-2xl">
            <div className="text-center mb-12 space-y-4">
              <Badge variant="outline">FAQ</Badge>
              <h2 className="text-2xl md:text-3xl font-bold">Вопросы по доступу и оплате</h2>
            </div>
            <Accordion type="single" collapsible className="space-y-3">
              {pricingFaqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-2xl bg-card px-5">
                  <AccordionTrigger className="text-sm font-medium hover:no-underline py-5">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-5">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
          <div className="container relative text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Готовы начать?</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Оформите доступ и начните обучение уже через несколько минут
            </p>
            <Button variant="hero" size="xl" asChild>
              <Link to="/register">Получить доступ <ArrowRight className="h-5 w-5" /></Link>
            </Button>
            <p className="text-xs text-muted-foreground">Гарантия возврата 14 дней • Моментальный доступ</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

import React from "react";
export default Pricing;
