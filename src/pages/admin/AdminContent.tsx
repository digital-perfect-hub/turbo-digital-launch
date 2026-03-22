import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquareText, Save, Send, Sidebar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  defaultContactSectionContent,
  defaultForumSidebarContent,
  defaultForumTeaserContent,
  type ContactSectionContent,
  type ForumSidebarContent,
  type ForumTeaserContent,
  useSiteSettings,
} from "@/hooks/useSiteSettings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useSiteContext } from "@/context/SiteContext";
import { DEFAULT_SITE_ID } from "@/lib/site";
import { upsertSiteSetting } from "@/lib/site-settings";

const AdminContent = () => {
  const qc = useQueryClient();
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;
  const { getJsonSetting, isLoading } = useSiteSettings();
  const [forumTeaser, setForumTeaser] = useState<ForumTeaserContent>(defaultForumTeaserContent);
  const [forumSidebar, setForumSidebar] = useState<ForumSidebarContent>(defaultForumSidebarContent);
  const [contactContent, setContactContent] = useState<ContactSectionContent>(defaultContactSectionContent);

  useEffect(() => {
    if (isLoading) return;
    setForumTeaser(getJsonSetting("forum_teaser_content", defaultForumTeaserContent));
    setForumSidebar(getJsonSetting("forum_sidebar_content", defaultForumSidebarContent));
    setContactContent(getJsonSetting("contact_section_content", defaultContactSectionContent));
  }, [isLoading]);

  const mutation = useMutation({
    mutationFn: async () => {
      await Promise.all([
        upsertSiteSetting(siteId, "forum_teaser_content", JSON.stringify(forumTeaser)),
        upsertSiteSetting(siteId, "forum_sidebar_content", JSON.stringify(forumSidebar)),
        upsertSiteSetting(siteId, "contact_section_content", JSON.stringify(contactContent)),
      ]);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site_settings", siteId] });
      toast.success("Content-Blöcke erfolgreich gespeichert.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Speichern fehlgeschlagen.");
    },
  });

  if (isLoading) return <div className="p-6 text-slate-500 font-medium">Laden...</div>;

  return (
    <div className="p-6 md:p-10 max-w-6xl">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Content-Blöcke</h1>
          <p className="mt-2 text-sm text-slate-500">Forum-Teaser, Forum-Sidebar und ContactSection zentral für White-Label pflegen.</p>
        </div>
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="rounded-xl bg-[#FF4B2C] px-6 py-5 text-white shadow-md shadow-[#FF4B2C]/20 hover:bg-[#E03A1E]">
          <Save size={18} className="mr-2" />
          {mutation.isPending ? "Speichere..." : "Inhalte speichern"}
        </Button>
      </div>

      <Tabs defaultValue="teaser" className="w-full">
        <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-slate-100 p-1">
          <TabsTrigger value="teaser" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#FF4B2C]">
            <MessageSquareText size={15} className="mr-2" /> Forum-Teaser
          </TabsTrigger>
          <TabsTrigger value="sidebar" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#FF4B2C]">
            <Sidebar size={15} className="mr-2" /> Forum-Sidebar
          </TabsTrigger>
          <TabsTrigger value="contact" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#FF4B2C]">
            <Send size={15} className="mr-2" /> Kontaktformular
          </TabsTrigger>
        </TabsList>

        <TabsContent value="teaser" className="mt-6">
          <Card className="rounded-[2rem] border-slate-200">
            <CardHeader>
              <CardTitle>Forum-Teaser auf der Startseite</CardTitle>
              <CardDescription>Alles für Badge, Headline, CTA und Fallbacks des Community-Teasers.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Badge</Label>
                <Input value={forumTeaser.badge} onChange={(e) => setForumTeaser((prev) => ({ ...prev, badge: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>CTA Text</Label>
                <Input value={forumTeaser.cta_text} onChange={(e) => setForumTeaser((prev) => ({ ...prev, cta_text: e.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Titel</Label>
                <Input value={forumTeaser.title} onChange={(e) => setForumTeaser((prev) => ({ ...prev, title: e.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Beschreibung</Label>
                <Textarea rows={4} value={forumTeaser.description} onChange={(e) => setForumTeaser((prev) => ({ ...prev, description: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>CTA Link</Label>
                <Input value={forumTeaser.cta_link} onChange={(e) => setForumTeaser((prev) => ({ ...prev, cta_link: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Fallback Autor</Label>
                <Input value={forumTeaser.fallback_author} onChange={(e) => setForumTeaser((prev) => ({ ...prev, fallback_author: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Fallback Chip</Label>
                <Input value={forumTeaser.fallback_chip} onChange={(e) => setForumTeaser((prev) => ({ ...prev, fallback_chip: e.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Leerer Snippet-Text</Label>
                <Textarea rows={3} value={forumTeaser.empty_text} onChange={(e) => setForumTeaser((prev) => ({ ...prev, empty_text: e.target.value }))} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sidebar" className="mt-6">
          <Card className="rounded-[2rem] border-slate-200">
            <CardHeader>
              <CardTitle>Forum-Sidebar</CardTitle>
              <CardDescription>Kategorien-Header und Premium-Support-Kasten vollständig steuerbar.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Kategorien Titel</Label>
                <Input value={forumSidebar.categories_title} onChange={(e) => setForumSidebar((prev) => ({ ...prev, categories_title: e.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Kategorien Beschreibung</Label>
                <Textarea rows={3} value={forumSidebar.categories_description} onChange={(e) => setForumSidebar((prev) => ({ ...prev, categories_description: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Support Badge</Label>
                <Input value={forumSidebar.support_badge} onChange={(e) => setForumSidebar((prev) => ({ ...prev, support_badge: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Support Button Text</Label>
                <Input value={forumSidebar.support_button_text} onChange={(e) => setForumSidebar((prev) => ({ ...prev, support_button_text: e.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Support Titel</Label>
                <Input value={forumSidebar.support_title} onChange={(e) => setForumSidebar((prev) => ({ ...prev, support_title: e.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Support Text</Label>
                <Textarea rows={4} value={forumSidebar.support_text} onChange={(e) => setForumSidebar((prev) => ({ ...prev, support_text: e.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Support Button Link</Label>
                <Input value={forumSidebar.support_button_link} onChange={(e) => setForumSidebar((prev) => ({ ...prev, support_button_link: e.target.value }))} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="mt-6">
          <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
            <Card className="rounded-[2rem] border-slate-200">
              <CardHeader>
                <CardTitle>Linke Infospalte</CardTitle>
                <CardDescription>Beschreibung und drei Trust-Signale der dunklen Kontaktbox.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Beschreibung</Label>
                  <Textarea rows={5} value={contactContent.panel_description} onChange={(e) => setContactContent((prev) => ({ ...prev, panel_description: e.target.value }))} />
                </div>

                {contactContent.trust_signals.map((signal, index) => (
                  <div key={index} className="rounded-2xl border border-slate-200 p-4 space-y-3">
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Icon</Label>
                        <select
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                          value={signal.icon}
                          onChange={(e) => {
                            const next = [...contactContent.trust_signals];
                            next[index] = { ...next[index], icon: e.target.value as ContactSectionContent["trust_signals"][number]["icon"] };
                            setContactContent((prev) => ({ ...prev, trust_signals: next }));
                          }}
                        >
                          <option value="clock">Uhr</option>
                          <option value="phone">Telefon</option>
                          <option value="mail">Mail</option>
                        </select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Titel</Label>
                        <Input
                          value={signal.title}
                          onChange={(e) => {
                            const next = [...contactContent.trust_signals];
                            next[index] = { ...next[index], title: e.target.value };
                            setContactContent((prev) => ({ ...prev, trust_signals: next }));
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Text</Label>
                      <Textarea
                        rows={3}
                        value={signal.text}
                        onChange={(e) => {
                          const next = [...contactContent.trust_signals];
                          next[index] = { ...next[index], text: e.target.value };
                          setContactContent((prev) => ({ ...prev, trust_signals: next }));
                        }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-slate-200">
              <CardHeader>
                <CardTitle>Formulartexte & Optionen</CardTitle>
                <CardDescription>Labels, Placeholders, Service-/Budget-Optionen und Success-State zentral pflegen.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(contactContent.labels).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <Label>Label · {key}</Label>
                      <Input value={value} onChange={(e) => setContactContent((prev) => ({ ...prev, labels: { ...prev.labels, [key]: e.target.value } }))} />
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(contactContent.placeholders).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <Label>Placeholder · {key}</Label>
                      <Input value={value} onChange={(e) => setContactContent((prev) => ({ ...prev, placeholders: { ...prev.placeholders, [key]: e.target.value } }))} />
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Service-Optionen (eine pro Zeile)</Label>
                    <Textarea
                      rows={6}
                      value={contactContent.service_options.join("\n")}
                      onChange={(e) => setContactContent((prev) => ({
                        ...prev,
                        service_options: e.target.value.split("\n").map((item) => item.trim()).filter(Boolean),
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Budget-Optionen (eine pro Zeile)</Label>
                    <Textarea
                      rows={6}
                      value={contactContent.budget_options.join("\n")}
                      onChange={(e) => setContactContent((prev) => ({
                        ...prev,
                        budget_options: e.target.value.split("\n").map((item) => item.trim()).filter(Boolean),
                      }))}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Submit Text</Label>
                    <Input value={contactContent.submit_text} onChange={(e) => setContactContent((prev) => ({ ...prev, submit_text: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Submitting Text</Label>
                    <Input value={contactContent.submitting_text} onChange={(e) => setContactContent((prev) => ({ ...prev, submitting_text: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Success Titel</Label>
                    <Input value={contactContent.success_title} onChange={(e) => setContactContent((prev) => ({ ...prev, success_title: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Success Text</Label>
                    <Input value={contactContent.success_text} onChange={(e) => setContactContent((prev) => ({ ...prev, success_text: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Toast Erfolg Titel</Label>
                    <Input value={contactContent.success_toast_title} onChange={(e) => setContactContent((prev) => ({ ...prev, success_toast_title: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Toast Erfolg Text</Label>
                    <Input value={contactContent.success_toast_description} onChange={(e) => setContactContent((prev) => ({ ...prev, success_toast_description: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Toast Fehler Titel</Label>
                    <Input value={contactContent.error_toast_title} onChange={(e) => setContactContent((prev) => ({ ...prev, error_toast_title: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Toast Fehler Text</Label>
                    <Input value={contactContent.error_toast_description} onChange={(e) => setContactContent((prev) => ({ ...prev, error_toast_description: e.target.value }))} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminContent;
