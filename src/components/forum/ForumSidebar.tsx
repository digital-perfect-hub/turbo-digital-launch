import { Link } from "react-router-dom";
import { ArrowRight, FolderOpen, MessageSquare, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ForumCategory } from "@/hooks/useForum";
import { cn } from "@/lib/utils";

type ForumSidebarProps = {
  categories: ForumCategory[];
  activeCategorySlug?: string;
};

const ForumSidebar = ({ categories, activeCategorySlug }: ForumSidebarProps) => {
  return (
    <aside className="sticky top-28 space-y-6">
      <Card className="overflow-hidden rounded-[28px] border-slate-200/80 bg-white/90 shadow-[0_28px_70px_-42px_rgba(14,31,83,0.25)] backdrop-blur">
        <CardHeader className="pb-4">
          <Badge variant="outline" className="w-fit rounded-full border-[#FF4B2C]/20 bg-[#FF4B2C]/5 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-[#FF4B2C]">
            Forum Kategorien
          </Badge>
          <CardTitle className="flex items-center gap-2 text-xl font-black text-slate-950">
            <FolderOpen className="h-5 w-5 text-[#FF4B2C]" />
            Themenwelten
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Link
            to="/forum"
            className={cn(
              "flex items-center justify-between rounded-[20px] border px-4 py-3 text-sm font-semibold transition-all duration-300",
              !activeCategorySlug
                ? "border-[#FF4B2C]/30 bg-[#FF4B2C]/8 text-slate-950 shadow-sm"
                : "border-slate-200 text-slate-700 hover:border-[#FF4B2C]/20 hover:bg-slate-50 hover:text-slate-950",
            )}
          >
            <span>Alle Beiträge</span>
            <Badge variant="outline" className="rounded-full border-slate-200 bg-white px-2.5 py-0.5 text-xs text-slate-600">
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
                  "group flex items-center justify-between rounded-[20px] border px-4 py-3 text-sm transition-all duration-300",
                  isActive
                    ? "border-[#FF4B2C]/30 bg-[#FF4B2C]/8 shadow-sm"
                    : "border-slate-200 hover:border-[#FF4B2C]/20 hover:bg-slate-50",
                )}
              >
                <div className="min-w-0">
                  <p className={cn("truncate font-semibold", isActive ? "text-slate-950" : "text-slate-800")}>{category.name}</p>
                  {category.description ? (
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{category.description}</p>
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
            Premium Support
          </Badge>
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10">
              <Sparkles className="h-5 w-5 text-[#FF4B2C]" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Projektberatung anfragen</h3>
              <p className="mt-2 text-sm leading-6 text-white/72">
                Du willst statt Theorie ein performantes Setup für Webdesign, SEO oder Funnel-Architektur?
              </p>
            </div>
          </div>

          <Button asChild className="mt-2 h-11 w-full rounded-full bg-[#FF4B2C] text-white hover:bg-[#ff5f44]">
            <Link to="/login" className="inline-flex items-center justify-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Login & Zugang sichern
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </aside>
  );
};

export default ForumSidebar;
