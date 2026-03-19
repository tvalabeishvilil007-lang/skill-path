export type TierLevel = "basic" | "optimal" | "premium" | "none";

export interface TierInfo {
  level: TierLevel;
  name: string;
  expiresAt: string | null;
  categoriesOpen: number;
  totalCategories: number;
  materialsOpen: number;
  totalMaterials: number;
}

export const TIER_CONFIG = {
  none: {
    name: "Нет доступа",
    rank: 0,
    color: "muted-foreground",
    badgeCls: "bg-muted text-muted-foreground",
    categoriesOpen: 0,
    materialsOpen: 0,
  },
  basic: {
    name: "Базовый",
    rank: 1,
    color: "primary",
    badgeCls: "bg-primary/10 text-primary",
    categoriesOpen: 3,
    materialsOpen: 15,
  },
  optimal: {
    name: "Оптимальный",
    rank: 2,
    color: "accent",
    badgeCls: "bg-accent/10 text-accent",
    categoriesOpen: 5,
    materialsOpen: 35,
  },
  premium: {
    name: "Premium",
    rank: 3,
    color: "warning",
    badgeCls: "bg-warning/10 text-warning",
    categoriesOpen: 6,
    materialsOpen: 50,
  },
} as const;

export const TIER_FEATURES: Record<TierLevel, string[]> = {
  none: [],
  basic: [
    "Доступ к базовой библиотеке (3 категории)",
    "Видеоуроки в HD-качестве",
    "Личный кабинет с прогрессом",
    "Доступ с любого устройства",
  ],
  optimal: [
    "Всё из Базового тарифа",
    "5 категорий материалов",
    "Скачиваемые материалы и шаблоны",
    "Приоритетные обновления",
    "Поддержка участников",
  ],
  premium: [
    "Всё из Оптимального тарифа",
    "Все 6 категорий без ограничений",
    "Бессрочный доступ",
    "Приватное комьюнити",
    "Персональная поддержка",
    "Ранний доступ к новым материалам",
  ],
};

/** Which tier is required for each course (by mock id) */
export const COURSE_REQUIRED_TIER: Record<string, TierLevel> = {
  "1": "basic",     // Веб-разработка
  "2": "basic",     // UX/UI
  "3": "optimal",   // Python DS
  "4": "basic",     // SMM
  "5": "optimal",   // Flutter
  "6": "premium",   // Финансы
};

/** Category required tiers */
export const CATEGORY_REQUIRED_TIER: Record<string, TierLevel> = {
  "Программирование": "basic",
  "Дизайн": "basic",
  "Маркетинг": "basic",
  "Data Science": "optimal",
  "Финансы": "premium",
};

export function canAccess(userTier: TierLevel, requiredTier: TierLevel): boolean {
  return TIER_CONFIG[userTier].rank >= TIER_CONFIG[requiredTier].rank;
}

export function getRequiredTierForCourse(courseId: string): TierLevel {
  return COURSE_REQUIRED_TIER[courseId] || "basic";
}

export function getRequiredTierLabel(tier: TierLevel): string {
  if (tier === "none") return "";
  return TIER_CONFIG[tier].name;
}
