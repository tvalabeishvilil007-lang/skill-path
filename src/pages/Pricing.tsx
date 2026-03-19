import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ArrowRight, Star } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0, 0, 0.2, 1] as const },
  }),
};

const plans = [
  {
    name: "Базовый",
    period: "1 месяц",
    price: "2 990",
    features: [
      "Доступ к библиотеке материалов",
      "Личный кабинет",
      "Отслеживание прогресса",
      "Доступ с любого устройства",
    ],
    popular: false,
  },
  {
    name: "Оптимальный",
    period: "3 месяца",
    price: "6 990",
    oldPrice: "8 970",
    features: [
      "Всё из Базового",
      "Приоритетные обновления",
      "Расширенная библиотека",
      "Скачиваемые материалы",
      "Поддержка участников",
    ],
    popular: true,
  },
  {
    name: "Premium",
    period: "Бессрочный",
    price: "14 990",
    features: [
      "Всё из Оптимального",
      "Бессрочный доступ",
      "Все будущие обновления",
      "Приватное комьюнити",
      "Персональная поддержка",
      "Ранний доступ к новым материалам",
    ],
    popular: false,
  },
];

const Pricing = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1">
      <section className="hero-gradient py-20 md:py-28">
        <div className="container max-w-3xl text-center space-y-6">
          <Badge variant="outline" className="px-4 py-1.5">Тарифы</Badge>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Выберите свой <span className="text-gradient">доступ</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Оформите участие в закрытой образовательной платформе и получите доступ к библиотеке материалов
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={i}
                className={`relative rounded-2xl border p-8 space-y-6 card-hover ${
                  plan.popular
                    ? "border-primary/50 bg-card glow-primary"
                    : "border-border bg-card"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground gap-1">
                      <Star className="h-3 w-3" /> Популярный
                    </Badge>
                  </div>
                )}

                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.period}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">₽</span>
                  </div>
                  {plan.oldPrice && (
                    <p className="text-sm text-muted-foreground line-through">{plan.oldPrice} ₽</p>
                  )}
                </div>

                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.popular ? "hero" : "outline"}
                  size="lg"
                  className="w-full"
                  asChild
                >
                  <Link to="/register">
                    Получить доступ {plan.popular && <ArrowRight className="h-4 w-4" />}
                  </Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default Pricing;
