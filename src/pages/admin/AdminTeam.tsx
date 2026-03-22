import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Save, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { uploadBrandingAsset } from "@/lib/storage";
import { buildRenderImageUrl } from "@/lib/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { defaultSiteText, useSiteSettings } from "@/hooks/useSiteSettings";
import { useSiteContext } from "@/context/SiteContext";
import { DEFAULT_SITE_ID } from "@/lib/site";
import { upsertSiteSetting } from "@/lib/site-settings";

type TeamMember = {
  id?: string;
  name: string;
  role: string;
  bio: string;
  image_url: string;
  linkedin_url: string;
  sort_order: number;
  is_visible: boolean;
};

const defaultMember: TeamMember = {
  name: "",
  role: "",
  bio: "",
  image_url: "",
  linkedin_url: "",
  sort_order: 0,
  is_visible: true,
};

const AdminTeam = () => {
  const qc = useQueryClient();
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;
  const { settings: siteSettings, isLoading: siteSettingsLoading } = useSiteSettings();
  const [section, setSection] = useState({
    kicker: defaultSiteText.home_team_kicker,
    title: defaultSiteText.home_team_title,
    description: defaultSiteText.home_team_description,
  });
  const [editing, setEditing] = useState<TeamMember | null>(null);

  const { data: teamMembers = [], isLoading } = useQuery({
    queryKey: ["admin-team-members", siteId],
    queryFn: async () => {
      const { data, error } = await supabase.from("team_members").select("*").eq("site_id", siteId).order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (siteSettingsLoading) return;
    setSection({
      kicker: typeof siteSettings.home_team_kicker === "string" ? siteSettings.home_team_kicker : defaultSiteText.home_team_kicker,
      title: typeof siteSettings.home_team_title === "string" ? siteSettings.home_team_title : defaultSiteText.home_team_title,
      description: typeof siteSettings.home_team_description === "string" ? siteSettings.home_team_description : defaultSiteText.home_team_description,
    });
  }, [siteSettings, siteSettingsLoading]);

  const nextSortOrder = useMemo(() => {
    if (!teamMembers.length) return 0;
    return Math.max(...teamMembers.map((item) => item.sort_order ?? 0)) + 1;
  }, [teamMembers]);

  const saveSectionMutation = useMutation({
    mutationFn: async () => {
      await Promise.all([
        upsertSiteSetting(siteId, "home_team_kicker", section.kicker),
        upsertSiteSetting(siteId, "home_team_title", section.title),
        upsertSiteSetting(siteId, "home_team_description", section.description),
      ]);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site_settings", siteId] });
      toast.success("Team-Sektion gespeichert.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Sektion konnte nicht gespeichert werden.");
    },
  });

  const saveMemberMutation = useMutation({
    mutationFn: async (member: TeamMember) => {
      const payload = {
        name: member.name,
        role: member.role || null,
        bio: member.bio || null,
        image_url: member.image_url || null,
        linkedin_url: member.linkedin_url || null,
        sort_order: member.sort_order ?? 0,
        is_visible: member.is_visible,
      };

      if (member.id) {
        const { error } = await supabase.from("team_members").update(payload).eq("id", member.id);
        if (error) throw error;
        return;
      }

      const { error } = await supabase.from("team_members").insert({ ...payload, site_id: siteId });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-team-members"] });
      setEditing(null);
      toast.success("Team-Profil gespeichert.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Team-Profil konnte nicht gespeichert werden.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("team_members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-team-members"] });
      toast.success("Team-Profil gelöscht.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Löschen fehlgeschlagen.");
    },
  });

  const handleUpload = async (file: File) => {
    const filePath = await uploadBrandingAsset(file, "team", siteId);
    setEditing((prev) => (prev ? { ...prev, image_url: filePath } : prev));
    toast.success("Team-Bild hochgeladen.");
  };

  if (isLoading || siteSettingsLoading) return <div className="p-6 text-slate-500 font-medium">Laden...</div>;

  return (
    <div className="p-6 md:p-10 max-w-7xl">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Team</h1>
          <p className="mt-2 text-sm text-slate-500">Team-Sektion und sichtbare Teamprofile vollständig white-label-fähig pflegen.</p>
        </div>
        <Button
          onClick={() => setEditing({ ...defaultMember, sort_order: nextSortOrder })}
          className="rounded-xl bg-[#FF4B2C] px-6 py-5 text-white shadow-md shadow-[#FF4B2C]/20 hover:bg-[#E03A1E]"
        >
          <Plus size={18} className="mr-2" /> Neues Profil
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="rounded-[2rem] border-slate-200">
          <CardHeader>
            <CardTitle>Team-Sektion</CardTitle>
            <CardDescription>Kicker, Titel und Beschreibung der öffentlichen Team-Sektion.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Team Kicker</Label>
              <Input value={section.kicker} onChange={(e) => setSection((prev) => ({ ...prev, kicker: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Team Titel</Label>
              <Input value={section.title} onChange={(e) => setSection((prev) => ({ ...prev, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Team Beschreibung</Label>
              <Textarea rows={5} value={section.description} onChange={(e) => setSection((prev) => ({ ...prev, description: e.target.value }))} />
            </div>
            <Button onClick={() => saveSectionMutation.mutate()} disabled={saveSectionMutation.isPending} className="rounded-xl bg-slate-950 text-white hover:bg-slate-800">
              <Save size={16} className="mr-2" /> {saveSectionMutation.isPending ? "Speichere..." : "Sektion speichern"}
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-slate-200">
          <CardHeader>
            <CardTitle>{editing?.id ? "Team-Profil bearbeiten" : "Neues Team-Profil"}</CardTitle>
            <CardDescription>Name, Rolle, Bio, Bildpfad und Sichtbarkeit direkt aus dem Admin pflegen.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {editing ? (
              <>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={editing.name} onChange={(e) => setEditing((prev) => (prev ? { ...prev, name: e.target.value } : prev))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Rolle</Label>
                    <Input value={editing.role} onChange={(e) => setEditing((prev) => (prev ? { ...prev, role: e.target.value } : prev))} />
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>LinkedIn URL</Label>
                    <Input value={editing.linkedin_url} onChange={(e) => setEditing((prev) => (prev ? { ...prev, linkedin_url: e.target.value } : prev))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Sortierung</Label>
                    <Input type="number" value={editing.sort_order} onChange={(e) => setEditing((prev) => (prev ? { ...prev, sort_order: Number(e.target.value) || 0 } : prev))} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea rows={6} value={editing.bio} onChange={(e) => setEditing((prev) => (prev ? { ...prev, bio: e.target.value } : prev))} />
                </div>

                <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
                  <div className="space-y-2">
                    <Label>Bildpfad</Label>
                    <Input value={editing.image_url} onChange={(e) => setEditing((prev) => (prev ? { ...prev, image_url: e.target.value } : prev))} placeholder="branding/team/dein-bild.webp" />
                  </div>
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-[#FF4B2C]/30 hover:bg-[#FF4B2C]/5 hover:text-[#FF4B2C]">
                    <Upload size={16} className="mr-2" /> Bild hochladen
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.currentTarget.value = "";
                      if (file) void handleUpload(file);
                    }} />
                  </label>
                </div>

                {editing.image_url ? (
                  <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50 p-3">
                    <img src={buildRenderImageUrl(editing.image_url, { width: 480, quality: 84 })} alt={editing.name || "Team Preview"} className="h-48 w-full rounded-[1rem] object-cover" />
                  </div>
                ) : null}

                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Profil sichtbar</p>
                    <p className="text-xs text-slate-500">Nur sichtbare Teamprofile werden auf der Website ausgegeben.</p>
                  </div>
                  <Switch checked={editing.is_visible} onCheckedChange={(checked) => setEditing((prev) => (prev ? { ...prev, is_visible: checked } : prev))} />
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => editing.name.trim() && saveMemberMutation.mutate(editing)} disabled={saveMemberMutation.isPending || !editing.name.trim()} className="rounded-xl bg-[#FF4B2C] text-white hover:bg-[#E03A1E]">
                    <Save size={16} className="mr-2" /> {saveMemberMutation.isPending ? "Speichere..." : "Profil speichern"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setEditing(null)} className="rounded-xl">Abbrechen</Button>
                </div>
              </>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-sm text-slate-500">
                Wähle links ein bestehendes Profil oder lege ein neues an.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {teamMembers.map((member) => (
          <Card key={member.id} className="rounded-[1.75rem] border-slate-200">
            <CardContent className="flex gap-4 p-5">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[1.25rem] bg-slate-100">
                {member.image_url ? (
                  <img src={buildRenderImageUrl(member.image_url, { width: 240, quality: 82 })} alt={member.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-400">Kein Bild</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{member.name}</h3>
                    <p className="text-sm text-slate-500">{member.role || "Ohne Rolle"}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${member.is_visible ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {member.is_visible ? "Sichtbar" : "Versteckt"}
                  </span>
                </div>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">{member.bio || "Keine Bio hinterlegt."}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="outline" className="rounded-xl" onClick={() => setEditing({
                    id: member.id,
                    name: member.name,
                    role: member.role || "",
                    bio: member.bio || "",
                    image_url: member.image_url || "",
                    linkedin_url: member.linkedin_url || "",
                    sort_order: member.sort_order ?? 0,
                    is_visible: member.is_visible ?? true,
                  })}>
                    Bearbeiten
                  </Button>
                  <Button variant="outline" className="rounded-xl text-rose-600 hover:text-rose-700" onClick={() => deleteMutation.mutate(member.id)} disabled={deleteMutation.isPending}>
                    <Trash2 size={15} className="mr-2" /> Löschen
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminTeam;
