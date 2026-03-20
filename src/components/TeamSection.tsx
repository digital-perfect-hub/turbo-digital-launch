import { motion } from "framer-motion";
import { ArrowUpRight, Linkedin, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { buildRenderImageUrl } from "@/lib/image";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

type TeamRow = {
  id: string;
  name?: string | null;
  role?: string | null;
  bio?: string | null;
  description?: string | null;
  image_url?: string | null;
  avatar_url?: string | null;
  linkedin_url?: string | null;
  profile_url?: string | null;
  sort_order?: number | null;
  is_visible?: boolean | null;
};

type UiTeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  image_url: string | null;
  link: string | null;
};

const fallbackTeam: UiTeamMember[] = [
  {
    id: "fallback-team-1",
    name: "Markus Schulz",
    role: "Strategie, Vertrieb & Umsetzung",
    bio: "Direkter Ansprechpartner für Webdesign, SEO und skalierbare Vertriebsseiten mit echtem Business-Fokus.",
    image_url: null,
    link: null,
  },
  {
    id: "fallback-team-2",
    name: "Projekt-Lead",
    role: "Struktur, Inhalte & Qualität",
    bio: "Sorgt dafür, dass Design, Inhalte und Nutzerführung nicht hübsch aussehen – sondern konvertieren.",
    image_url: null,
    link: null,
  },
  {
    id: "fallback-team-3",
    name: "Tech & Performance",
    role: "Frontend, SEO & Deployment",
    bio: "Verbindet Ladezeit, Theme-System, CMS-Logik und SEO-Sauberkeit zu einer robusten Premium-Basis.",
    image_url: null,
    link: null,
  },
];

const toUiMember = (row: TeamRow): UiTeamMember | null => {
  const name = row.name?.trim() || "";
  if (!name) return null;

  return {
    id: row.id,
    name,
    role: row.role?.trim() || "Team Member",
    bio: row.bio?.trim() || row.description?.trim() || "Profiltext kann zentral im Admin gepflegt werden.",
    image_url: row.image_url || row.avatar_url || null,
    link: row.linkedin_url || row.profile_url || null,
  };
};

const TeamSection = () => {
  const { getSetting } = useSiteSettings();

  const { data: teamMembers = [] } = useQuery({
    queryKey: ["team_members"],
    queryFn: async (): Promise<UiTeamMember[]> => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("is_visible", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return ((data as TeamRow[] | null) ?? []).map(toUiMember).filter((item): item is UiTeamMember => Boolean(item));
    },
  });

  const effectiveTeam = teamMembers.length > 0 ? teamMembers : fallbackTeam;

  return (
    <section id="team" className="bg-background py-24 md:py-28">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="mb-12 max-w-3xl"
        >
          <p className="section-label">{getSetting("home_team_kicker", "Team & Verantwortung")}</p>
          <h2 className="section-title">{getSetting("home_team_title", "Wer hinter Strategie, Design und Performance steht")}</h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Mehr Vertrauen entsteht, wenn klar ist, wer liefert. Diese Sektion ist für White-Label-Setups gedacht und lädt nur sichtbare Teamprofile aus Supabase.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {effectiveTeam.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
            >
              <Card className="premium-card h-full border-0 shadow-none">
                <CardContent className="flex h-full flex-col p-6 md:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 border-2" style={{ borderColor: "var(--surface-card-border)" }}>
                        {member.image_url ? <AvatarImage src={buildRenderImageUrl(member.image_url, { width: 220, quality: 82 })} alt={member.name} /> : null}
                        <AvatarFallback className="bg-secondary text-white">{member.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-lg font-bold text-[var(--surface-card-text)]">{member.name}</div>
                        <div className="text-sm text-[var(--surface-card-muted)]">{member.role}</div>
                      </div>
                    </div>

                    {member.link ? (
                      <a
                        href={member.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white transition-colors hover:text-primary"
                        style={{ borderColor: "var(--surface-card-border)", color: "var(--surface-card-text)" }}
                        aria-label={`${member.name} Profil öffnen`}
                      >
                        <Linkedin size={16} />
                      </a>
                    ) : (
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Sparkles size={16} />
                      </div>
                    )}
                  </div>

                  <p className="mt-5 flex-1 text-sm leading-relaxed text-[var(--surface-card-muted)]">{member.bio}</p>

                  <div className="mt-6 flex items-center justify-between border-t pt-4" style={{ borderColor: "var(--surface-card-border)" }}>
                    <span className="premium-pill">Sichtbar im Team</span>
                    {member.link ? (
                      <a href={member.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                        Profil
                        <ArrowUpRight size={14} />
                      </a>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
