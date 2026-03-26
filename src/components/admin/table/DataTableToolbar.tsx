import type { Table } from "@tanstack/react-table";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type DataTableToolbarProps<TData> = {
  table: Table<TData>;
  searchPlaceholder?: string;
};

const DataTableToolbar = <TData,>({ table, searchPlaceholder = "Suchen…" }: DataTableToolbarProps<TData>) => {
  const globalFilter = (table.getState().globalFilter as string) ?? "";
  const hasFilters = globalFilter.length > 0;

  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full max-w-md">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          value={globalFilter}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          placeholder={searchPlaceholder}
          className="rounded-xl border-slate-200 pl-10"
        />
      </div>
      {hasFilters ? (
        <Button variant="ghost" className="rounded-xl text-slate-500 hover:text-red-600" onClick={() => table.resetGlobalFilter()}>
          <X size={16} className="mr-2" /> Filter zurücksetzen
        </Button>
      ) : null}
    </div>
  );
};

export default DataTableToolbar;
