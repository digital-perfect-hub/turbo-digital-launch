import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { filterLucideIconOptions, getLucideIcon } from "@/lib/lucide-icon-registry";

type IconPickerProps = {
  value?: string | null;
  onChange: (value: string) => void;
  label?: string;
  triggerClassName?: string;
};

const IconPicker = ({ value, onChange, label = "Icon wählen", triggerClassName }: IconPickerProps) => {
  const [query, setQuery] = useState("");
  const options = useMemo(() => filterLucideIconOptions(query), [query]);
  const ActiveIcon = getLucideIcon(value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("justify-start gap-3 rounded-xl border-slate-200", triggerClassName)}>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF4B2C]/10 text-[#FF4B2C]">
            <ActiveIcon size={18} />
          </span>
          <span className="min-w-0 truncate text-left">{value || label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[360px] rounded-2xl border-slate-200 p-0 shadow-xl" align="start">
        <div className="border-b border-slate-100 p-4">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nach Icon suchen…"
              className="rounded-xl border-slate-200 pl-10"
            />
          </div>
        </div>
        <ScrollArea className="h-[340px]">
          <div className="grid grid-cols-3 gap-2 p-4">
            {options.map((option) => {
              const Icon = option.icon;
              const isActive = option.key === value;

              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => onChange(option.key)}
                  className={cn(
                    "rounded-2xl border px-3 py-4 text-center transition",
                    isActive
                      ? "border-[#FF4B2C] bg-[#FFF4F1] text-[#FF4B2C] shadow-[0_20px_40px_-28px_rgba(255,75,44,0.45)]"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
                  )}
                >
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100">
                    <Icon size={18} />
                  </div>
                  <div className="mt-3 text-xs font-semibold leading-5">{option.label}</div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default IconPicker;
