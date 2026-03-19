import { Course } from "@/types/course";
import { Link } from "react-router-dom";
import { Clock, BookOpen, BarChart, Lock, ArrowRight, Crown, Sparkles, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TierLevel, TIER_CONFIG, canAccess, getRequiredTierForCourse } from "@/lib/tiers";
import { useTier } from "@/contexts/TierContext";
import UpgradePrompt from "@/components/UpgradePrompt";

const CourseCard = ({ course }: { course: Course }) => {
  const { tier } = useTier();
  const requiredTier = getRequiredTierForCourse(course.id);
  const hasAccess = canAccess(tier.level, requiredTier);
  const isPremiumCourse = requiredTier === "premium";
  const isOptimalCourse = requiredTier === "optimal";
  const config = TIER_CONFIG[requiredTier];

  // Content status badges
  const isNew = Number(course.id) >= 5;
  const isPopular = course.isFeatured;

  if (!hasAccess) {
    return (
      <div className="group block rounded-2xl border border-border bg-card overflow-hidden relative">
        {/* Locked overlay with upgrade prompt */}
        <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isPremiumCourse ? "bg-warning/10" : "bg-muted"}`}>
            {isPremiumCourse ? <Crown className="h-6 w-6 text-warning" /> : <Lock className="h-6 w-6 text-muted-foreground" />}
          </div>
          <div className="space-y-1.5">
            <p className="font-semibold text-sm">
              {isPremiumCourse ? "Premium-контент" : "Заблокировано"}
            </p>
            <p className="text-xs text-muted-foreground">
              Доступно на тарифе
            </p>
            <Badge className={config.badgeCls}>
              {isPremiumCourse && <Crown className="h-3 w-3 mr-1" />}
              {config.name}
            </Badge>
          </div>
          <Button size="sm" variant={isPremiumCourse ? "accent" : "outline"} asChild>
            <Link to={`/pricing?highlight=${requiredTier}`} className="gap-1.5">
              Улучшить тариф <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
        {/* Background card content */}
        <div className="aspect-video bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center">
          <BookOpen className="h-12 w-12 text-muted-foreground/20" />
        </div>
        <div className="p-5 space-y-3">
          <div className="h-3 w-20 rounded bg-muted" />
          <div className="h-4 w-3/4 rounded bg-muted" />
          <div className="h-3 w-full rounded bg-muted" />
          <div className="h-3 w-2/3 rounded bg-muted" />
        </div>
      </div>
    );
  }

  // Accessible card
  return (
    <Link
      to={`/course/${course.slug}`}
      className={`group block rounded-2xl border overflow-hidden card-hover ${
        isPremiumCourse
          ? "border-warning/30 bg-card premium-shadow"
          : "border-border bg-card"
      }`}
    >
      <div className={`aspect-video flex items-center justify-center relative ${
        isPremiumCourse
          ? "bg-gradient-to-br from-warning/15 to-warning/5"
          : isOptimalCourse
            ? "bg-gradient-to-br from-accent/15 to-accent/5"
            : "bg-gradient-to-br from-primary/20 to-primary/5"
      }`}>
        <BookOpen className={`h-12 w-12 transition-colors ${
          isPremiumCourse
            ? "text-warning/40 group-hover:text-warning/60"
            : "text-primary/40 group-hover:text-primary/60"
        }`} />

        {/* Status badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
          {isPremiumCourse && (
            <Badge className="bg-warning/10 text-warning gap-1">
              <Crown className="h-3 w-3" /> Premium
            </Badge>
          )}
          {isOptimalCourse && !isPremiumCourse && (
            <Badge className="bg-accent/10 text-accent">Оптимальный</Badge>
          )}
          {isNew && (
            <Badge className="bg-success/10 text-success gap-1">
              <Sparkles className="h-3 w-3" /> Новое
            </Badge>
          )}
          {isPopular && !isNew && (
            <Badge className="bg-primary/10 text-primary gap-1">
              <TrendingUp className="h-3 w-3" /> Популярное
            </Badge>
          )}
        </div>

        {/* Included badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="text-[10px] gap-1 bg-background/80 backdrop-blur-sm">
            Включено в тариф
          </Badge>
        </div>
      </div>
      <div className="p-5 space-y-3">
        <Badge variant="secondary" className="text-xs">
          {course.category}
        </Badge>
        <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
          {course.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {course.shortDescription}
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {course.duration}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            {course.lessonsCount} уроков
          </span>
          <span className="flex items-center gap-1">
            <BarChart className="h-3.5 w-3.5" />
            {course.level}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
