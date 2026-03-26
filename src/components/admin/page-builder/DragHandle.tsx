import type { ButtonHTMLAttributes } from "react";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

type DragHandleProps = {
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const DragHandle = ({ className, ...props }: DragHandleProps) => {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-10 w-10 cursor-grab items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-[#FF4B2C] hover:text-[#FF4B2C] active:cursor-grabbing",
        className,
      )}
      aria-label="Block verschieben"
      {...props}
    >
      <GripVertical size={16} />
    </button>
  );
};

export default DragHandle;
