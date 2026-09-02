-- "Wall of Excellence": lightweight shoutouts admins/SMEs can give a
-- contributor, shown on the Dashboard. Previously the Dashboard card existed
-- with no backing table or way to add anything to it.
CREATE TABLE IF NOT EXISTS public.recognitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contributor_id uuid NOT NULL,
  given_by uuid NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE ON public.recognitions TO authenticated;
GRANT ALL ON public.recognitions TO service_role;

ALTER TABLE public.recognitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recognitions read all" ON public.recognitions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "recognitions insert team" ON public.recognitions
  FOR INSERT TO authenticated WITH CHECK (
    (public.is_admin() OR public.is_sme()) AND given_by = auth.uid()
  );

CREATE POLICY "recognitions delete admin" ON public.recognitions
  FOR DELETE TO authenticated USING (public.is_admin());
