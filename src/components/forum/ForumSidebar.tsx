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
      <Card className="overflow-hidden rounded-[28px] border-slate-200/90 bg-white shadow-[0_30px_80px_-55px_rgba(15,23,42,0.22)]">
        <CardHeader className="border-b border-slate-100 pb-5">
          <CardTitle className="text-xl font-black tracking-tight text-slate-950">{content.categories_title}</CardTitle>
          <p className="text-sm leading-6 text-slate-500">{content.categories_description}</p>
        </CardHeader>

        <CardContent className="space-y-3 p-5">
          <Link
            to="/forum"
            className={cn(
              "group flex items-center justify-between rounded-2xl border px-4 py-3 transition-all duration-300",
              !activeCategorySlug
                ? "border-[#FF4B2C]/25 bg-[#FF4B2C]/5 shadow-[0_12px_30px_-24px_rgba(255,75,44,0.45)]"
                : "border-slate-200 bg-white hover:border-[#FF4B2C]/25 hover:bg-[#FF4B2C]/5",
            )}
          >
            <div>
              <div className="text-sm font-bold text-slate-900">Alle Beiträge</div>
              <p className="mt-1 text-xs leading-5 text-slate-500">Alle aktuellen Diskussionen im Überblick.</p>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "ml-3 shrink-0 rounded-full px-2.5 py-0.5 text-xs",
                !activeCategorySlug
                  ? "border-[#FF4B2C]/25 bg-white text-[#FF4B2C]"
                  : "border-slate-200 bg-white text-slate-600",
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
                    ? "border-[#FF4B2C]/25 bg-[#FF4B2C]/5 shadow-[0_12px_30px_-24px_rgba(255,75,44,0.45)]"
                    : "border-slate-200 bg-white hover:border-[#FF4B2C]/25 hover:bg-[#FF4B2C]/5",
                )}
              >
                <div>
                  <div className="text-sm font-bold text-slate-900">{category.name}</div>
                  {category.description ? (
                    <p className="mt-1 text-xs leading-5 text-slate-500">{category.description}</p>
                  ) : null}
                </div>

                <Badge
                  variant="outline"
                  className={cn(
                    "ml-3 shrink-0 rounded-full px-2.5 py-0.5 text-xs",
                    isActive
                      ? "border-[#FF4B2C]/25 bg-white text-[#FF4B2C]"
                      : "border-slate-200 bg-white text-slate-600",
                  )}
                >
                  {category.thread_count}
                </Badge>
              </Link>
            );
          })}
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-[28px] border-[#0E1F53]/10 bg-[#0E1F53] text-white shadow-[0_38px_90px_-52px_rgba(14,31,83,0.65)]">
        <CardContent className="p-6">
          <Badge className="mb-4 rounded-full border-none bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white">
            {content.support_badge}
          </Badge>
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10">
              <Sparkles className="h-5 w-5 text-[#FF4B2C]" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">{content.support_title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/72">{content.support_text}</p>
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
