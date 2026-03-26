import type { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

type DataTablePaginationProps<TData> = {
  table: Table<TData>;
};

const DataTablePagination = <TData,>({ table }: DataTablePaginationProps<TData>) => {
  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
      <div className="text-sm text-slate-500">
        {table.getFilteredRowModel().rows.length} Einträge · Seite {table.getState().pagination.pageIndex + 1} von {table.getPageCount() || 1}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" className="rounded-xl border-slate-200" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Zurück
        </Button>
        <Button variant="outline" className="rounded-xl border-slate-200" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Weiter
        </Button>
      </div>
    </div>
  );
};

export default DataTablePagination;
