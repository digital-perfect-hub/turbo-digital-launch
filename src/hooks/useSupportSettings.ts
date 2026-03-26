import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSiteContext } from '@/context/SiteContext';
import { DEFAULT_SITE_ID } from '@/lib/site';
import { createDefaultSupportSettings, mapSiteSupportSettings, type SiteSupportSettingsRecord } from '@/lib/support';

export const useSupportSettings = (overrideSiteId?: string | null) => {
  const queryClient = useQueryClient();
  const { activeSiteId } = useSiteContext();
  const siteId = overrideSiteId || activeSiteId || DEFAULT_SITE_ID;

  const query = useQuery({
    queryKey: ['site-support-settings', siteId],
    enabled: Boolean(siteId),
    queryFn: async (): Promise<SiteSupportSettingsRecord> => {
      const { data, error } = await supabase
        .from('site_support_settings' as never)
        .select('*')
        .eq('site_id', siteId)
        .maybeSingle();

      if (error) {
        const code = typeof (error as any)?.code === 'string' ? (error as any).code : '';
        if (code === '42P01' || code === 'PGRST205') {
          return createDefaultSupportSettings(siteId);
        }
        throw error;
      }

      return data ? mapSiteSupportSettings(siteId, data as Record<string, unknown>) : createDefaultSupportSettings(siteId);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (value: Partial<SiteSupportSettingsRecord>) => {
      const payload = {
        site_id: siteId,
        support_mode: value.support_mode,
        support_organization_id: value.support_organization_id ?? null,
        allow_platform_escalation: value.allow_platform_escalation,
        support_widget_enabled: value.support_widget_enabled,
        support_email_enabled: value.support_email_enabled,
        default_sla_hours: value.default_sla_hours,
      };

      const { error } = await supabase
        .from('site_support_settings' as never)
        .upsert(payload as never, { onConflict: 'site_id' });

      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['site-support-settings', siteId] });
      await queryClient.invalidateQueries({ queryKey: ['public-support-settings', siteId] });
    },
  });

  return {
    ...query,
    siteId,
    settings: query.data ?? createDefaultSupportSettings(siteId),
    saveMutation,
  };
};
