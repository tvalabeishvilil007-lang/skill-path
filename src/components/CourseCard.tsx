import { Course } from "@/types/course";
import { Link } from "react-router-dom";
import { Clock, BookOpen, BarChart, Lock, ArrowRight, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TierLevel, TIER_CONFIG, canAccess, getRequiredTierForCourse } from "@/lib/tiers";
import { useTier } from "@/contexts/TierContext";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("ru-RU").format(price) + " ₽";

const CourseCard = ({ course }: { course: Course }) => {
  const { tier } = useTier();
  const requiredTier = getRequiredTierForCourse(course.id);
  const hasAccess = canAccess(tier.level, requiredTier);
  const isPremiumCourse = requiredTier === "premium";
  const config = TIER_CONFIG[requiredTier];

  if (!hasAccess && tier.level !== "none") {
    // Locked card
    return (
      <div className="group block rounded-2xl border border-border bg-card overflow-hidden relative">
        {/* Locked overlay */}
        <div className="absolute inset-0 z-10 bg-background/70 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-sm">Доступно на тарифе</p>
            <Badge className={config.badgeCls}>{config.name}</Badge>
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link to="/pricing" className="gap-1.5">
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
        isPremiumCourse && hasAccess
          ? "border-warning/30 bg-card premium-shadow"
          : "border-border bg-card"
      }`}
    >
      <div className={`aspect-video flex items-center justify-center relative ${
        isPremiumCourse && hasAccess
          ? "bg-gradient-to-br from-warning/15 to-warning/5"
          : "bg-gradient-to-br from-primary/20 to-primary/5"
      }`}>
        <BookOpen className={`h-12 w-12 transition-colors ${
          isPremiumCourse && hasAccess
            ? "text-warning/40 group-hover:text-warning/60"
            : "text-primary/40 group-hover:text-primary/60"
        }`} />
        {isPremiumCourse && hasAccess && (
          <Badge className="absolute top-3 right-3 bg-warning/10 text-warning gap-1">
            <Crown className="h-3 w-3" /> Premium
          </Badge>
        )}
        {requiredTier === "optimal" && hasAccess && (
          <Badge className="absolute top-3 right-3 bg-accent/10 text-accent">
            Оптимальный
          </Badge>
        )}
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
