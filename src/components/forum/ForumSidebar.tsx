import { ArrowRight, MessageSquare, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ForumCategory } from "@/hooks/useForum";
import { defaultForumSidebarContent, useSiteSettings } from "@/hooks/useSiteSettings";

type ForumSidebarProps = {
  categories: ForumCategory[];
  activeCategorySlug?: string;
};

const ForumSidebar = ({ categories, activeCategorySlug }: ForumSidebarProps) => {
  const { getJsonSetting } = useSiteSettings();
  const content = getJsonSetting("forum_sidebar_content", defaultForumSidebarContent);

  return (
    <aside className="space-y-6">
      <Card className="surface-card-shell overflow-hidden rounded-[28px] border shadow-[0_30px_80px_-55px_rgba(15,23,42,0.22)]">
        <CardHeader className="border-b border-border pb-5">
          <CardTitle className="text-xl font-black tracking-tight text-foreground">{content.categories_title}</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">{content.categories_description}</p>
        </CardHeader>

        <CardContent className="space-y-3 p-5">
          <Link
            to="/forum"
            className={cn(
              "group flex items-center justify-between rounded-2xl border px-4 py-3 transition-all duration-300",
              !activeCategorySlug
                ? "surface-accent-badge shadow-[0_12px_30px_-24px_rgba(255,75,44,0.45)]"
                : "border-border bg-[var(--surface-card)] hover:border-primary/30 hover:bg-primary/5",
            )}
          >
            <div>
              <div className="text-sm font-bold text-foreground">Alle Beiträge</div>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Alle aktuellen Diskussionen im Überblick.</p>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "ml-3 shrink-0 rounded-full px-2.5 py-0.5 text-xs",
                !activeCategorySlug
                  ? "surface-accent-badge bg-[var(--surface-card)]"
                  : "border-border bg-[var(--surface-card)] text-muted-foreground",
              )}
            >
              {categories.reduce((sum, category) => sum + category.thread_count, 0)}
            </Badge>
          </Link>

          {categories.map((category) => {
            const isActive = category.slug === activeCategorySlug;

            return (
              <Link
                key={category.id}
                to={`/forum/kategorie/${category.slug}`}
                className={cn(
                  "group flex items-center justify-between rounded-2xl border px-4 py-3 transition-all duration-300",
                  isActive
                    ? "surface-accent-badge shadow-[0_12px_30px_-24px_rgba(255,75,44,0.45)]"
                    : "border-border bg-[var(--surface-card)] hover:border-primary/30 hover:bg-primary/5",
                )}
              >
                <div>
                  <div className="text-sm font-bold text-foreground">{category.name}</div>
                  {category.description ? (
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{category.description}</p>
                  ) : null}
                </div>

                <Badge
                  variant="outline"
                  className={cn(
                    "ml-3 shrink-0 rounded-full px-2.5 py-0.5 text-xs",
                    isActive
                      ? "surface-accent-badge bg-[var(--surface-card)]"
                      : "border-border bg-[var(--surface-card)] text-muted-foreground",
                  )}
                >
                  {category.thread_count}
                </Badge>
              </Link>
            );
          })}
        </CardContent>
      </Card>

      <Card className="support-dark-card overflow-hidden rounded-[28px] border shadow-[0_38px_90px_-52px_rgba(14,31,83,0.65)]">
        <CardContent className="p-6">
          <Badge className="mb-4 rounded-full border-none px-3 py-1 text-[11px] uppercase tracking-[0.22em]" style={{ background: 'color-mix(in srgb, hsl(var(--secondary-foreground)) 10%, transparent)', color: 'hsl(var(--secondary-foreground))' }}>
            {content.support_badge}
          </Badge>
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ background: 'color-mix(in srgb, hsl(var(--secondary-foreground)) 10%, transparent)' }}>
              <Sparkles className="theme-accent-icon h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">{content.support_title}</h3>
              <p className="support-dark-muted mt-2 text-sm leading-6">{content.support_text}</p>
            </div>
          </div>

          <Button asChild className="btn-primary mt-2 !h-11 !w-full rounded-full">
            <Link to={content.support_button_link || "/login"} className="inline-flex items-center justify-center gap-2">
              <MessageSquare className="h-4 w-4" />
              {content.support_button_text}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </aside>
  );
};

export default ForumSidebar;
