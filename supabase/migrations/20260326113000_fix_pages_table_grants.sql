GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON TABLE public.pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.pages TO authenticated;
