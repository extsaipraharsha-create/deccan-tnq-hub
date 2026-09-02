-- Redesigns Wall of Excellence from one-row-per-recipient (whose "who was
-- this posted with" grouping had to be reconstructed by matching
-- given_by+message+created_at) into an explicit posts/recipients/reactions
-- model, so reactions have a stable post to attach to.

CREATE TABLE IF NOT EXISTS public.recognition_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  given_by uuid NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.recognition_posts TO authenticated;
GRANT ALL ON public.recognition_posts TO service_role;
ALTER TABLE public.recognition_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recognition_posts read all" ON public.recognition_posts
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "recognition_posts insert team" ON public.recognition_posts
  FOR INSERT TO authenticated WITH CHECK (
    (public.is_admin() OR public.is_sme()) AND given_by = auth.uid()
  );
CREATE POLICY "recognition_posts delete own or admin" ON public.recognition_posts
  FOR DELETE TO authenticated USING (public.is_admin() OR given_by = auth.uid());

CREATE TABLE IF NOT EXISTS public.recognition_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.recognition_posts(id) ON DELETE CASCADE,
  contributor_id uuid NOT NULL
);
GRANT SELECT, INSERT ON public.recognition_recipients TO authenticated;
GRANT ALL ON public.recognition_recipients TO service_role;
ALTER TABLE public.recognition_recipients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recognition_recipients read all" ON public.recognition_recipients
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "recognition_recipients insert with post" ON public.recognition_recipients
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.recognition_posts p WHERE p.id = post_id AND p.given_by = auth.uid())
  );

-- Anyone can react (👏🎉🔥❤️👍) — one row per (post, person, emoji).
CREATE TABLE IF NOT EXISTS public.recognition_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.recognition_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  emoji text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id, emoji)
);
GRANT SELECT, INSERT, DELETE ON public.recognition_reactions TO authenticated;
GRANT ALL ON public.recognition_reactions TO service_role;
ALTER TABLE public.recognition_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recognition_reactions read all" ON public.recognition_reactions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "recognition_reactions own write" ON public.recognition_reactions
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Carry over anything already posted under the old design, then retire it.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='recognitions') THEN
    INSERT INTO public.recognition_posts (given_by, message, created_at)
    SELECT DISTINCT given_by, message, created_at FROM public.recognitions;

    INSERT INTO public.recognition_recipients (post_id, contributor_id)
    SELECT p.id, r.contributor_id
    FROM public.recognitions r
    JOIN public.recognition_posts p
      ON p.given_by = r.given_by AND p.message = r.message AND p.created_at = r.created_at;

    DROP TABLE public.recognitions;
  END IF;
END $$;

-- Instant (non-polled) updates for Wall of Excellence and Announcements.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='recognition_posts') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.recognition_posts;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='recognition_reactions') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.recognition_reactions;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='settings') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
