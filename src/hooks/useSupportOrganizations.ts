import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { createSupportOrganizationSlug, mapSupportOrganization, type SupportOrgType } from '@/lib/support';

export const useSupportOrganizations = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['support-organizations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_organizations' as never)
        .select('*')
        .order('type', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      return ((data as Record<string, unknown>[] | null) ?? []).map(mapSupportOrganization);
    },
  });

  const createOrganization = useMutation({
    mutationFn: async ({
      name,
      type,
      siteId,
      ownerUserId,
    }: {
      name: string;
      type: SupportOrgType;
      siteId?: string | null;
      ownerUserId?: string | null;
    }) => {
      const slug = createSupportOrganizationSlug(name);
      const { data, error } = await supabase
        .from('support_organizations' as never)
        .insert({
          name,
          slug,
          type,
          site_id: siteId || null,
          owner_user_id: ownerUserId || null,
          is_active: true,
        } as never)
        .select('*')
        .single();

      if (error) throw error;
      return mapSupportOrganization(data as Record<string, unknown>);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['support-organizations'] });
    },
  });

  const organizations = query.data ?? [];
  const platformOrganization = useMemo(
    () => organizations.find((entry) => entry.type === 'platform') ?? null,
    [organizations],
  );

  return {
    ...query,
    organizations,
    platformOrganization,
    createOrganization,
  };
};
