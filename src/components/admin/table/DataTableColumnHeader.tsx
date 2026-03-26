import type { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

type DataTableColumnHeaderProps<TData, TValue> = {
  column: Column<TData, TValue>;
  title: string;
};

const DataTableColumnHeader = <TData, TValue>({ column, title }: DataTableColumnHeaderProps<TData, TValue>) => {
  const sorted = column.getIsSorted();

  return (
    <Button
      variant="ghost"
      className="-ml-3 h-8 rounded-lg px-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500 hover:bg-slate-100"
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      <span>{title}</span>
      {sorted === "asc" ? <ArrowUp size={14} className="ml-2" /> : sorted === "desc" ? <ArrowDown size={14} className="ml-2" /> : <ChevronsUpDown size={14} className="ml-2" />}
    </Button>
  );
};

export default DataTableColumnHeader;
