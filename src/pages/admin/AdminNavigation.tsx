import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link2, Plus, Trash2, Edit2, Palette, ChevronRight, Menu, Type, LayoutTemplate } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const AdminNavigation = () => {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ label: "", url: "", parent_id: "" });
  
  const [styling, setStyling] = useState({ 
    nav_text_color_hex: "#94a3b8", 
    nav_hover_color_hex: "#FF4B2C",
    nav_font_weight: "bold",
    nav_font_style: "normal",
    nav_font_family: "default",
    nav_show_underline: false,
    nav_underline_color_hex: "#FF4B2C",
    nav_animate_underline: true
  });

  const { data: themeSettings } = useQuery({
    queryKey: ["global_settings_nav"],
    queryFn: async () => {
      const { data, error } = await supabase.from("global_settings")
        .select("id, nav_text_color_hex, nav_hover_color_hex, nav_font_weight, nav_font_style, nav_font_family, nav_show_underline, nav_underline_color_hex, nav_animate_underline")
        .limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (themeSettings) {
      setStyling({
        nav_text_color_hex: themeSettings.nav_text_color_hex || "#94a3b8",
        nav_hover_color_hex: themeSettings.nav_hover_color_hex || "#FF4B2C",
        nav_font_weight: themeSettings.nav_font_weight || "bold",
        nav_font_style: themeSettings.nav_font_style || "normal",
        nav_font_family: themeSettings.nav_font_family || "default",
        nav_show_underline: themeSettings.nav_show_underline ?? false,
        nav_underline_color_hex: themeSettings.nav_underline_color_hex || "#FF4B2C",
        nav_animate_underline: themeSettings.nav_animate_underline ?? true,
      });
    }
  }, [themeSettings]);

  const { data: links = [], isLoading: linksLoading } = useQuery({
    queryKey: ["navigation_links"],
    queryFn: async () => {
      const { data, error } = await supabase.from("navigation_links").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const saveStyling = useMutation({
    mutationFn: async (values: typeof styling) => {
      const rowId = themeSettings?.id || "default";
      const { error } = await supabase.from("global_settings").upsert({ id: rowId, ...values }, { onConflict: "id" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["global_settings"] });
      toast.success("Navigations-Styling gespeichert!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const saveLink = useMutation({
    mutationFn: async () => {
      const payload = {
        label: form.label,
        url: form.url,
        parent_id: form.parent_id === "none" || !form.parent_id ? null : form.parent_id,
      };
      if (editingId) {
        const { error } = await supabase.from("navigation_links").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("navigation_links").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["navigation_links"] });
      setForm({ label: "", url: "", parent_id: "" });
      setEditingId(null);
      toast.success("Link gespeichert!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteLink = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("navigation_links").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["navigation_links"] });
      toast.success("Link gelöscht!");
    },
  });

  const topLevelLinks = links.filter((l) => !l.parent_id);
  const getChildren = (parentId: string) => links.filter((l) => l.parent_id === parentId);

  // CSS-Klassen für die Vorschau berechnen
  const previewFontFamily = styling.nav_font_family === 'serif' ? 'font-serif' : styling.nav_font_family === 'mono' ? 'font-mono' : 'font-sans';
  const previewFontWeight = styling.nav_font_weight === 'normal' ? 'font-normal' : styling.nav_font_weight === 'medium' ? 'font-medium' : styling.nav_font_weight === 'extrabold' ? 'font-extrabold' : 'font-bold';
  const previewFontStyle = styling.nav_font_style === 'italic' ? 'italic' : 'not-italic';
  const previewClasses = `${previewFontFamily} ${previewFontWeight} ${previewFontStyle} uppercase tracking-widest text-sm relative group cursor-pointer py-1`;

  return (
    <div className="p-6 md:p-10 max-w-6xl">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Navigation & Menü</h1>
          <p className="mt-2 text-sm text-slate-500">Steuere Links, Typografie und Hover-Animationen.</p>
        </div>
        <Button onClick={() => saveStyling.mutate(styling)} disabled={saveStyling.isPending} className="rounded-xl bg-[#FF4B2C] hover:bg-[#E03A1E] text-white px-6 py-5 shadow-md shadow-[#FF4B2C]/20 transition-transform hover:scale-105">
          {saveStyling.isPending ? "Speichere..." : "Styling & Farben speichern"}
        </Button>
      </div>

      {/* STYLING STEUERUNG MIT LIVE-VORSCHAU */}
      <section className="glass-card rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm mb-8">
        
        {/* LIVE-VORSCHAU */}
        <div className="mb-8 p-6 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center gap-8 shadow-inner overflow-hidden relative">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)] pointer-events-none" />
           <div className="text-xs text-slate-500 absolute top-4 left-4 font-mono">LIVE PREVIEW</div>
           
           {/* Dummy Link 1 */}
           <div 
             className={previewClasses}
             style={{ color: styling.nav_text_color_hex }}
             onMouseEnter={(e) => (e.currentTarget.style.color = styling.nav_hover_color_hex)}
             onMouseLeave={(e) => (e.currentTarget.style.color = styling.nav_text_color_hex)}
           >
             Leistungen
             {styling.nav_show_underline && (
               <span className={`absolute -bottom-1 left-0 h-[2px] w-full ${styling.nav_animate_underline ? "origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100" : "opacity-0 transition-opacity duration-300 group-hover:opacity-100"}`} style={{ backgroundColor: styling.nav_underline_color_hex }} />
             )}
           </div>

           {/* Dummy Link 2 */}
           <div 
             className={previewClasses}
             style={{ color: styling.nav_text_color_hex }}
             onMouseEnter={(e) => (e.currentTarget.style.color = styling.nav_hover_color_hex)}
             onMouseLeave={(e) => (e.currentTarget.style.color = styling.nav_text_color_hex)}
           >
             Projekte
             {styling.nav_show_underline && (
               <span className={`absolute -bottom-1 left-0 h-[2px] w-full ${styling.nav_animate_underline ? "origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100" : "opacity-0 transition-opacity duration-300 group-hover:opacity-100"}`} style={{ backgroundColor: styling.nav_underline_color_hex }} />
             )}
           </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          
          {/* Spalte 1: Typografie */}
          <div className="space-y-6 border-b lg:border-b-0 lg:border-r border-slate-100 pb-6 lg:pb-0 lg:pr-8">
            <div className="flex items-center gap-3 text-lg font-bold text-slate-900 mb-6">
              <Type size={20} className="text-[#FF4B2C]" /> Text & Typografie
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-slate-600 text-xs uppercase tracking-wider">Schriftart</Label>
                <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none" value={styling.nav_font_family} onChange={(e) => setStyling({ ...styling, nav_font_family: e.target.value })}>
                  <option value="default">Standard (Sans-Serif)</option>
                  <option value="serif">Edel (Serif)</option>
                  <option value="mono">Tech (Monospace)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-600 text-xs uppercase tracking-wider">Dicke (Weight)</Label>
                <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none" value={styling.nav_font_weight} onChange={(e) => setStyling({ ...styling, nav_font_weight: e.target.value })}>
                  <option value="normal">Normal</option>
                  <option value="medium">Medium</option>
                  <option value="bold">Bold (Dick)</option>
                  <option value="extrabold">Extra Bold</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-600 text-xs uppercase tracking-wider">Stil</Label>
                <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none" value={styling.nav_font_style} onChange={(e) => setStyling({ ...styling, nav_font_style: e.target.value })}>
                  <option value="normal">Normal</option>
                  <option value="italic">Kursiv (Italic)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-600 text-xs uppercase tracking-wider">Standard Textfarbe</Label>
                <Input type="color" className="h-10 rounded-xl bg-slate-50 border-slate-200 px-3 cursor-pointer w-full" value={styling.nav_text_color_hex} onChange={(e) => setStyling({ ...styling, nav_text_color_hex: e.target.value.toUpperCase() })} />
              </div>
            </div>
          </div>

          {/* Spalte 2: Hover & Unterstrich */}
          <div className="space-y-6 lg:pl-4">
            <div className="flex items-center gap-3 text-lg font-bold text-slate-900 mb-6">
              <Palette size={20} className="text-[#FF4B2C]" /> Hover & Effekte
            </div>

            <div className="grid gap-4 md:grid-cols-2 mb-4">
              <div className="space-y-2">
                <Label className="text-slate-600 text-xs uppercase tracking-wider">Hover Textfarbe</Label>
                <Input type="color" className="h-10 rounded-xl bg-slate-50 border-slate-200 px-3 cursor-pointer w-full" value={styling.nav_hover_color_hex} onChange={(e) => setStyling({ ...styling, nav_hover_color_hex: e.target.value.toUpperCase() })} />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-slate-700 font-bold">Unterstrich bei Hover?</Label>
                <Switch checked={styling.nav_show_underline} onCheckedChange={(c) => setStyling({ ...styling, nav_show_underline: c })} className="data-[state=checked]:bg-[#FF4B2C]" />
              </div>

              {styling.nav_show_underline && (
                <div className="grid gap-4 md:grid-cols-2 pt-3 border-t border-slate-200">
                  <div className="space-y-2">
                    <Label className="text-slate-600 text-xs uppercase tracking-wider">Unterstrich Farbe</Label>
                    <Input type="color" className="h-10 rounded-xl bg-white border-slate-200 px-3 cursor-pointer w-full" value={styling.nav_underline_color_hex} onChange={(e) => setStyling({ ...styling, nav_underline_color_hex: e.target.value.toUpperCase() })} />
                  </div>
                  <div className="space-y-2 flex flex-col justify-center">
                    <Label className="text-slate-600 text-xs uppercase tracking-wider mb-2">Animiert einfahren?</Label>
                    <Switch checked={styling.nav_animate_underline} onCheckedChange={(c) => setStyling({ ...styling, nav_animate_underline: c })} className="data-[state=checked]:bg-[#FF4B2C]" />
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* MENÜ BUILDER */}
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="glass-card rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 text-lg font-bold text-slate-900 mb-6">
            <Menu size={24} className="text-[#FF4B2C]" /> Menüstruktur
          </div>

          {linksLoading ? (
            <div className="text-slate-500 text-sm">Lade Menü...</div>
          ) : topLevelLinks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 text-sm">
              Noch keine Links vorhanden.
            </div>
          ) : (
            <div className="space-y-3">
              {topLevelLinks.map((link) => (
                <div key={link.id} className="space-y-2">
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <Link2 size={16} className="text-slate-400" />
                      <span className="font-bold text-slate-800">{link.label}</span>
                      <span className="text-xs text-slate-400 bg-slate-200 px-2 py-0.5 rounded-md">{link.url}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setForm({ label: link.label, url: link.url, parent_id: link.parent_id || "none" }); setEditingId(link.id); }} className="p-1.5 text-slate-400 hover:text-[#FF4B2C] transition-colors"><Edit2 size={16} /></button>
                      <button onClick={() => { if(window.confirm('Wirklich löschen?')) deleteLink.mutate(link.id) }} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>

                  {getChildren(link.id).map((child) => (
                    <div key={child.id} className="ml-8 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
                      <div className="flex items-center gap-2">
                        <ChevronRight size={14} className="text-[#FF4B2C]" />
                        <span className="text-sm font-semibold text-slate-700">{child.label}</span>
                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{child.url}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setForm({ label: child.label, url: child.url, parent_id: child.parent_id || "none" }); setEditingId(child.id); }} className="p-1 text-slate-400 hover:text-[#FF4B2C]"><Edit2 size={14} /></button>
                        <button onClick={() => deleteLink.mutate(child.id)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="glass-card rounded-[2rem] border border-slate-200 bg-slate-950 p-8 shadow-xl self-start sticky top-6">
          <div className="flex items-center justify-between mb-6">
            <div className="text-lg font-bold text-white flex items-center gap-2">
              {editingId ? <Edit2 size={20} className="text-[#FF4B2C]" /> : <Plus size={20} className="text-[#FF4B2C]" />}
              {editingId ? "Link bearbeiten" : "Neuen Link anlegen"}
            </div>
            {editingId && (
              <button onClick={() => { setEditingId(null); setForm({ label: "", url: "", parent_id: "" }); }} className="text-xs text-slate-400 hover:text-white">Abbrechen</button>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Anzeige-Name (Label)</Label>
              <Input className="rounded-xl border-white/10 bg-white/5 text-white focus:border-[#FF4B2C] placeholder:text-slate-600" placeholder="z.B. Leistungen" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-300">Ziel-URL oder Anker</Label>
              <Input className="rounded-xl border-white/10 bg-white/5 text-white focus:border-[#FF4B2C] placeholder:text-slate-600" placeholder="z.B. #leistungen oder /shop" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Unterordnen unter...</Label>
              <select 
                className="w-full rounded-xl border border-white/10 bg-slate-900 text-white px-4 py-3 text-sm outline-none focus:border-[#FF4B2C]" 
                value={form.parent_id || "none"} 
                onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
              >
                <option value="none">-- Hauptmenü (Kein Dropdown) --</option>
                {topLevelLinks.map(l => (
                  <option key={l.id} value={l.id}>{l.label}</option>
                ))}
              </select>
            </div>

            <Button onClick={() => saveLink.mutate()} disabled={!form.label || !form.url || saveLink.isPending} className="w-full mt-4 rounded-xl bg-[#FF4B2C] hover:bg-[#E03A1E] text-white shadow-md shadow-[#FF4B2C]/20">
              {saveLink.isPending ? "Speichere..." : "Link speichern"}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminNavigation;