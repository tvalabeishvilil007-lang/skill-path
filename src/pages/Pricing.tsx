import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ArrowRight, Star, Shield, Zap, Clock, Smartphone, Laptop, Tablet, HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
    priceNote: "за 1 месяц доступа",
    features: [
      "Доступ к библиотеке материалов",
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
  },
  {
    name: "Оптимальный",
    period: "3 месяца",
    price: "6 990",
    oldPrice: "8 970",
    priceNote: "≈ 2 330 ₽/мес — экономия 22%",
    features: [
      "Всё из Базового тарифа",
      "Приоритетные обновления библиотеки",
      "Расширенная библиотека материалов",
      "Скачиваемые материалы и шаблоны",
      "Поддержка участников",
    ],
    excluded: [
      "Бессрочный доступ",
      "Приватное комьюнити",
    ],
    popular: true,
    cta: "Лучший выбор",
  },
  {
    name: "Premium",
    period: "Бессрочный доступ",
    price: "14 990",
    priceNote: "разовый платёж навсегда",
    features: [
      "Всё из Оптимального тарифа",
      "Бессрочный доступ без продления",
      "Все будущие обновления бесплатно",
      "Приватное комьюнити участников",
      "Персональная поддержка",
      "Ранний доступ к новым материалам",
    ],
    excluded: [],
    popular: false,
    cta: "Максимальный доступ",
  },
];

const comparisonFeatures = [
  { name: "Библиотека видеоуроков", basic: true, optimal: true, premium: true },
  { name: "Личный кабинет", basic: true, optimal: true, premium: true },
  { name: "Отслеживание прогресса", basic: true, optimal: true, premium: true },
  { name: "Доступ с любых устройств", basic: true, optimal: true, premium: true },
  { name: "Скачиваемые материалы", basic: false, optimal: true, premium: true },
  { name: "Приоритетные обновления", basic: false, optimal: true, premium: true },
  { name: "Поддержка участников", basic: false, optimal: true, premium: true },
  { name: "Приватное комьюнити", basic: false, optimal: false, premium: true },
  { name: "Персональная поддержка", basic: false, optimal: false, premium: true },
  { name: "Все будущие обновления", basic: false, optimal: false, premium: true },
];

const pricingFaqs = [
  { q: "Как быстро откроется доступ?", a: "Моментально. После оплаты ваш персональный кабинет будет доступен в течение нескольких минут. Вы получите уведомление на email." },
  { q: "Какие способы оплаты принимаются?", a: "Банковские карты (Visa, Mastercard, МИР), а также банковский перевод. Все платежи защищены шифрованием." },
  { q: "Можно ли вернуть деньги?", a: "Да, мы предоставляем полный возврат в течение 14 дней после оплаты, если вы решите, что платформа вам не подходит." },
  { q: "Что происходит после окончания срока?", a: "Вы можете продлить доступ в любой момент. Ваш прогресс, заметки и история обучения сохраняются навсегда." },
  { q: "Можно ли перейти на другой тариф?", a: "Да, вы можете обновить тариф в любое время. Разница в стоимости будет пересчитана автоматически." },
  { q: "На каких устройствах можно учиться?", a: "На любых: компьютер, ноутбук, планшет, телефон. Платформа полностью адаптирована, прогресс синхронизируется между устройствами." },
];

const Pricing = () => (
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
            Оформите участие в закрытой образовательной платформе. Все тарифы включают полный доступ к библиотеке материалов.
          </p>
          <div className="flex items-center justify-center gap-6 pt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-success" /> Возврат 14 дней</div>
            <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-warning" /> Моментальный доступ</div>
            <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Начало за 2 минуты</div>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={i}
                className={`relative rounded-2xl border p-8 flex flex-col ${
                  plan.popular ? "border-primary/50 bg-card glow-primary" : "border-border bg-card"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground gap-1">
                      <Star className="h-3 w-3" /> Популярный
                    </Badge>
                  </div>
                )}

                <div className="space-y-2 mb-6">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.period}</p>
                </div>

                <div className="space-y-1 mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">₽</span>
                  </div>
                  {plan.oldPrice && (
                    <p className="text-sm text-muted-foreground line-through">{plan.oldPrice} ₽</p>
                  )}
                  <p className="text-xs text-muted-foreground">{plan.priceNote}</p>
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
                  variant={plan.popular ? "hero" : "outline"}
                  size="lg"
                  className="w-full"
                  asChild
                >
                  <Link to="/register">
                    {plan.cta} {plan.popular && <ArrowRight className="h-4 w-4" />}
                  </Link>
                </Button>
              </motion.div>
            ))}
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
              <div className="p-4 font-semibold border-b border-border bg-surface text-center">Базовый</div>
              <div className="p-4 font-semibold border-b border-border bg-primary/5 text-center text-primary">Оптимальный</div>
              <div className="p-4 font-semibold border-b border-border bg-surface text-center">Premium</div>
              {comparisonFeatures.map((f, i) => (
                <>
                  <div key={`name-${i}`} className="p-4 border-b border-border text-muted-foreground">{f.name}</div>
                  <div key={`basic-${i}`} className="p-4 border-b border-border text-center">
                    {f.basic ? <Check className="h-4 w-4 text-success mx-auto" /> : <div className="w-1.5 h-0.5 rounded bg-muted-foreground/30 mx-auto" />}
                  </div>
                  <div key={`opt-${i}`} className="p-4 border-b border-border text-center bg-primary/3">
                    {f.optimal ? <Check className="h-4 w-4 text-success mx-auto" /> : <div className="w-1.5 h-0.5 rounded bg-muted-foreground/30 mx-auto" />}
                  </div>
                  <div key={`prem-${i}`} className="p-4 border-b border-border text-center">
                    {f.premium ? <Check className="h-4 w-4 text-success mx-auto" /> : <div className="w-1.5 h-0.5 rounded bg-muted-foreground/30 mx-auto" />}
                  </div>
                </>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Devices */}
      <section className="py-16 md:py-20">
        <div className="container max-w-3xl text-center space-y-8">
          <h2 className="text-2xl md:text-3xl font-bold">Учитесь на любом устройстве</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Платформа адаптирована для всех устройств. Прогресс синхронизируется автоматически.
          </p>
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
            Оформите доступ сейчас и начните обучение в закрытой платформе уже через несколько минут
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

export default Pricing;
