import { cn } from "@/lib/utils";
import { CheckCircle2, Lock, Play, Circle } from "lucide-react";

interface LessonListItemProps {
  title: string;
  duration?: string;
  isActive?: boolean;
  isCompleted?: boolean;
  isLocked?: boolean;
  isFreePreview?: boolean;
  onClick?: () => void;
  className?: string;
}

const LessonListItem = ({
  title,
  duration,
  isActive,
  isCompleted,
  isLocked,
  isFreePreview,
  onClick,
  className,
}: LessonListItemProps) => {
  const Icon = isCompleted ? CheckCircle2 : isLocked ? Lock : isActive ? Play : Circle;
  
  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm transition-all duration-200",
        isActive && "bg-primary/10 border border-primary/20 text-foreground",
        isCompleted && "text-muted-foreground",
        isLocked && "opacity-50 cursor-not-allowed",
        !isActive && !isLocked && "hover:bg-muted",
        className,
      )}
    >
      <Icon className={cn(
        "h-4 w-4 shrink-0",
        isActive && "text-primary",
        isCompleted && "text-success",
        isLocked && "text-muted-foreground",
      )} />
      <span className="flex-1 truncate">{title}</span>
      <div className="flex items-center gap-2 shrink-0">
        {isFreePreview && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-success/10 text-success">
            Free
          </span>
        )}
        {duration && <span className="text-xs text-muted-foreground">{duration}</span>}
      </div>
    </button>
  );
};

export default LessonListItem;
