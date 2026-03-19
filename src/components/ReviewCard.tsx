import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewCardProps {
  name: string;
  course: string;
  text: string;
  rating: number;
  avatar?: string;
  className?: string;
}

const ReviewCard = ({ name, course, text, rating, className }: ReviewCardProps) => (
  <div className={cn("rounded-2xl border border-border bg-card p-6 space-y-4 card-hover", className)}>
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, j) => (
        <Star
          key={j}
          className={cn("h-4 w-4", j < rating ? "fill-warning text-warning" : "text-muted-foreground/30")}
        />
      ))}
    </div>
    <p className="text-sm text-muted-foreground leading-relaxed">«{text}»</p>
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
        {name.charAt(0)}
      </div>
      <div>
        <p className="font-medium text-sm">{name}</p>
        <p className="text-xs text-muted-foreground">{course}</p>
      </div>
    </div>
  </div>
);

export default ReviewCard;
