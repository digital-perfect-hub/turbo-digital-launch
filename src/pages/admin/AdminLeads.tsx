import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const AdminLeads = () => {
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="p-6">Laden...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Kontaktanfragen ({leads.length})</h1>
      <div className="border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Datum</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>E-Mail</TableHead>
              <TableHead>Firma</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Budget</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="text-xs">{new Date(lead.created_at).toLocaleDateString("de-AT")}</TableCell>
                <TableCell className="font-medium text-sm">{lead.name}</TableCell>
                <TableCell className="text-sm">{lead.email}</TableCell>
                <TableCell className="text-sm">{lead.company || "-"}</TableCell>
                <TableCell className="text-sm">{lead.service || "-"}</TableCell>
                <TableCell className="text-sm">{lead.budget || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminLeads;
