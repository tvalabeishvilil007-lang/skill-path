import { Course } from "@/types/course";
import { Link } from "react-router-dom";
import { Clock, BookOpen, BarChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("ru-RU").format(price) + " ₽";

const CourseCard = ({ course }: { course: Course }) => (
  <Link
    to={`/course/${course.slug}`}
    className="group block rounded-lg border border-border bg-card overflow-hidden card-hover"
  >
    <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
      <BookOpen className="h-12 w-12 text-primary/40 group-hover:text-primary/60 transition-colors" />
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
      <div className="flex items-baseline gap-2 pt-1">
        <span className="text-lg font-bold text-primary">
          {formatPrice(course.price)}
        </span>
        {course.oldPrice && (
          <span className="text-sm text-muted-foreground line-through">
            {formatPrice(course.oldPrice)}
          </span>
        )}
      </div>
    </div>
  </Link>
);

export default CourseCard;
