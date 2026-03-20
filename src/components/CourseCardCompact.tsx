import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight } from "lucide-react";

const STATUS_LABELS: Record<string, string> = { new: "Новая", in_progress: "В обработке", awaiting_payment: "Ожидает оплату", paid: "Оплачено", access_granted: "Доступ открыт", rejected: "Отклонена" };
const STATUS_VARIANTS: Record<string, string> = {
  new: "bg-primary/10 text-primary border-primary/20",
  in_progress: "bg-warning/10 text-warning border-warning/20",
  awaiting_payment: "bg-warning/10 text-warning border-warning/20",
  paid: "bg-success/10 text-success border-success/20",
  access_granted: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

interface CourseCardCompactProps {
  course: any;
  hasAccess?: boolean;
  request?: any;
  onRequestClick?: () => void;
  /** Show only access CTA, no request/shop buttons */
  accessOnly?: boolean;
}

const CourseCardCompact = ({ course, hasAccess, request, onRequestClick, accessOnly }: CourseCardCompactProps) => {
  return (
    <Card className="overflow-hidden group border-border/50 hover:border-primary/20 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5 transition-all duration-300 flex flex-col">
      {/* Cover */}
      {course.cover_url ? (
        <div className="h-[130px] overflow-hidden shrink-0">
          <img src={course.cover_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      ) : (
        <div className="h-[130px] bg-muted/20 flex items-center justify-center shrink-0">
          <BookOpen className="h-5 w-5 text-muted-foreground/25" />
        </div>
      )}

      {/* Content */}
      <CardContent className="p-3.5 flex flex-col flex-1 gap-2">
        <h3 className="font-semibold text-sm leading-snug line-clamp-2">{course.title}</h3>

        {course.short_description && !accessOnly && (
          <p className="text-xs text-muted-foreground line-clamp-1">{course.short_description}</p>
        )}

        <div className="mt-auto pt-1 flex items-center justify-between gap-2">
          {course.price > 0 && (
            <span className="text-sm font-bold tabular-nums">{Number(course.price).toLocaleString("ru-RU")} ₽</span>
          )}

          {hasAccess ? (
            <Button asChild size="sm" className="rounded-lg text-xs h-8 ml-auto">
              <Link to={`/course/${course.slug}`}>
                {accessOnly ? "Продолжить" : "Открыть"} <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          ) : request ? (
            <Badge className={`${STATUS_VARIANTS[request.status] || ""} border text-[10px] ml-auto`}>
              {STATUS_LABELS[request.status] || request.status}
            </Badge>
          ) : !accessOnly && onRequestClick ? (
            <Button size="sm" className="rounded-lg text-xs h-8 ml-auto" onClick={onRequestClick}>
              Оформить заявку
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseCardCompact;
