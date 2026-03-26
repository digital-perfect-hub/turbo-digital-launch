import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSiteContext } from '@/context/SiteContext';
import { DEFAULT_SITE_ID } from '@/lib/site';

export type SiteModulesRecord = {
  site_id: string;
  has_forum: boolean;
  has_shop: boolean;
  has_seo_pro: boolean;
  has_support_desk: boolean;
  updated_at: string | null;
};

const createDefaultModules = (siteId: string): SiteModulesRecord => ({
  site_id: siteId,
  has_forum: false,
  has_shop: false,
  has_seo_pro: false,
  has_support_desk: false,
  updated_at: null,
});

const isMissingSiteModulesTable = (error: any) => {
  const code = typeof error?.code === 'string' ? error.code : '';
  const message = typeof error?.message === 'string' ? error.message : '';

  return code === '42P01' || code === 'PGRST205' || (/site_modules/i.test(message) && /(schema cache|does not exist|relation)/i.test(message));
};

export const useSiteModules = () => {
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;

  const query = useQuery({
    queryKey: ['site-modules', siteId],
    enabled: Boolean(siteId),
    staleTime: 60_000,
    gcTime: 300_000,
    queryFn: async (): Promise<SiteModulesRecord> => {
      const { data, error } = await supabase
        .from('site_modules' as never)
        .select('site_id, has_forum, has_shop, has_seo_pro, has_support_desk, updated_at')
        .eq('site_id', siteId)
        .maybeSingle();

      if (error) {
        if (isMissingSiteModulesTable(error)) {
          return {
            site_id: siteId,
            has_forum: true,
            has_shop: true,
            has_seo_pro: true,
            has_support_desk: false,
            updated_at: null,
          };
        }

        throw error;
      }

      if (!data) {
        return createDefaultModules(siteId);
      }

      const row = data as Record<string, unknown>;

      return {
        site_id: typeof row.site_id === 'string' && row.site_id.trim() ? row.site_id : siteId,
        has_forum: Boolean(row.has_forum),
        has_shop: Boolean(row.has_shop),
        has_seo_pro: Boolean(row.has_seo_pro),
        has_support_desk: Boolean(row.has_support_desk),
        updated_at: typeof row.updated_at === 'string' ? row.updated_at : null,
      };
    },
  });

  const modules = query.data ?? createDefaultModules(siteId);

  return {
    ...query,
    siteId,
    modules,
    hasForum: modules.has_forum,
    hasShop: modules.has_shop,
    hasSeoPro: modules.has_seo_pro,
    hasSupportDesk: modules.has_support_desk,
  };
};
