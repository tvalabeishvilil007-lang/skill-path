import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Lock, ArrowRight, Crown, Check, Zap } from "lucide-react";
import { TierLevel, TIER_CONFIG, TIER_FEATURES } from "@/lib/tiers";

interface UpgradePromptProps {
  requiredTier: TierLevel;
  currentTier: TierLevel;
  compact?: boolean;
}

const UpgradePrompt = ({ requiredTier, currentTier, compact }: UpgradePromptProps) => {
  const config = TIER_CONFIG[requiredTier];
  const isPremium = requiredTier === "premium";
  const features = TIER_FEATURES[requiredTier].filter((f) => !f.startsWith("Всё из")).slice(0, 4);

  if (compact) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Доступно на тарифе</span>
          <Badge className={config.badgeCls + " text-xs"}>
            {isPremium && <Crown className="h-3 w-3 mr-1" />}
            {config.name}
          </Badge>
        </div>
        <Button size="sm" variant="outline" className="w-full gap-1.5" asChild>
          <Link to={`/pricing?highlight=${requiredTier}`}>
            Улучшить тариф <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border p-6 space-y-5 ${isPremium ? "border-warning/20 bg-card" : "border-primary/20 bg-card"}`}>
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isPremium ? "bg-warning/10" : "bg-primary/10"}`}>
          {isPremium ? <Crown className="h-6 w-6 text-warning" /> : <Zap className="h-6 w-6 text-primary" />}
        </div>
        <div>
          <p className="font-semibold">Требуется тариф «{config.name}»</p>
          <p className="text-sm text-muted-foreground">Откроется после улучшения доступа</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Что откроется</p>
        {features.map((f) => (
          <div key={f} className="flex items-center gap-2 text-sm">
            <Check className="h-3.5 w-3.5 text-success shrink-0" />
            <span>{f}</span>
          </div>
        ))}
      </div>

      <Button size="lg" className="w-full gap-2" variant={isPremium ? "accent" : "default"} asChild>
        <Link to={`/pricing?highlight=${requiredTier}`}>
          Перейти на «{config.name}» <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
};

export default UpgradePrompt;
