import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContext } from "@/context/SiteContext";
import { DEFAULT_SITE_ID } from "@/lib/site";
import DataTable from "@/components/admin/table/DataTable";
import DataTableColumnHeader from "@/components/admin/table/DataTableColumnHeader";

type LeadRow = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  company: string | null;
  service: string | null;
  budget: string | null;
  phone: string | null;
  description: string | null;
};

const AdminLeads = () => {
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["admin-leads", siteId],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*").eq("site_id", siteId).order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as LeadRow[];
    },
  });

  const columns = useMemo<ColumnDef<LeadRow>[]>(() => [
    {
      accessorKey: "created_at",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Datum" />,
      cell: ({ row }) => <span className="text-xs text-slate-500">{new Date(row.original.created_at).toLocaleDateString("de-AT")}</span>,
    },
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => <div className="font-semibold text-slate-900">{row.original.name}</div>,
    },
    {
      accessorKey: "email",
      header: ({ column }) => <DataTableColumnHeader column={column} title="E-Mail" />,
      cell: ({ row }) => <a href={`mailto:${row.original.email}`} className="text-sm text-[#0E1F53] hover:text-[#FF4B2C]">{row.original.email}</a>,
    },
    {
      accessorKey: "company",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Firma" />,
      cell: ({ row }) => <span>{row.original.company || "—"}</span>,
    },
    {
      accessorKey: "service",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Service" />,
      cell: ({ row }) => <span>{row.original.service || "—"}</span>,
    },
    {
      accessorKey: "budget",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Budget" />,
      cell: ({ row }) => <span>{row.original.budget || "—"}</span>,
    },
  ], []);

  if (isLoading) return <div className="p-6">Laden...</div>;

  return (
    <div className="max-w-7xl p-6 md:p-8 lg:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Kontaktanfragen</h1>
        <p className="mt-2 text-sm text-slate-500">Skalierbare Lead-Tabelle für Hunderte Einträge, sortierbar und filterbar.</p>
      </div>
      <DataTable columns={columns} data={leads} searchPlaceholder="Lead, Firma, E-Mail oder Service suchen…" />
    </div>
  );
};

export default AdminLeads;
