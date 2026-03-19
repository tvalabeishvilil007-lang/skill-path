import { cn } from "@/lib/utils";
import { LucideIcon, Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

const EmptyState = ({ icon: Icon = Inbox, title, description, children, className }: EmptyStateProps) => (
  <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center", className)}>
    <div className="rounded-2xl bg-muted p-4 mb-4">
      <Icon className="h-8 w-8 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-semibold mb-1">{title}</h3>
    {description && <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>}
    {children}
  </div>
);

export default EmptyState;
