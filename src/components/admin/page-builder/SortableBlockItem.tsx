import type { ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DragHandle from "@/components/admin/page-builder/DragHandle";
import { cn } from "@/lib/utils";

type SortableBlockItemProps = {
  id: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
};

const SortableBlockItem = ({ id, title, description, actions, children }: SortableBlockItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <Card
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "rounded-[2rem] border-slate-200 bg-white shadow-sm",
        isDragging && "shadow-[0_30px_80px_-32px_rgba(255,75,44,0.35)] ring-2 ring-[#FF4B2C]/20",
      )}
    >
      <CardHeader className="gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <DragHandle {...attributes} {...listeners} />
          <div>
            <CardTitle className="text-slate-900">{title}</CardTitle>
            {description ? <CardDescription className="text-slate-500">{description}</CardDescription> : null}
          </div>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </CardHeader>
      <CardContent className="space-y-5">{children}</CardContent>
    </Card>
  );
};

export default SortableBlockItem;
