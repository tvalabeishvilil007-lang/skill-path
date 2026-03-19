import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  className?: string;
}

const StatCard = ({ title, value, icon: Icon, change, changeType = "neutral", className }: StatCardProps) => (
  <div className={cn("rounded-2xl border border-border bg-card p-6 premium-shadow", className)}>
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
        {change && (
          <p className={cn("text-xs font-medium", {
            "text-success": changeType === "positive",
            "text-destructive": changeType === "negative",
            "text-muted-foreground": changeType === "neutral",
          })}>
            {change}
          </p>
        )}
      </div>
      <div className="rounded-xl bg-primary/10 p-3">
        <Icon className="h-5 w-5 text-primary" />
      </div>
    </div>
  </div>
);

export default StatCard;
