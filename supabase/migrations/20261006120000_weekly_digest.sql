-- Weekly digest push: a SQL-side aggregate (not reusing the frontend's
-- computeWorklogMetrics(), which can't run inside the edge function's Deno
-- runtime) that returns, for every user with *some* activity in [week_start,
-- week_end), their completed/slipped/open counts for that window. Only
-- users this function returns get a push - anyone with zero activity that
-- week is silently excluded, satisfying "don't send to anyone with zero
-- activity that week" at the query level rather than in application code.
CREATE OR REPLACE FUNCTION public.weekly_digest_stats(week_start timestamptz, week_end timestamptz)
RETURNS TABLE (
  user_id uuid,
  completed_count integer,
  slipped_count integer,
  open_count integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH active_users AS (
    SELECT user_id FROM work_log_entries
      WHERE created_at >= week_start AND created_at < week_end
    UNION
    SELECT user_id FROM work_log_entries
      WHERE completed_at >= week_start AND completed_at < week_end
    UNION
    SELECT user_id FROM work_log_entries
      WHERE updated_at IS DISTINCT FROM created_at
        AND updated_at >= week_start AND updated_at < week_end
    UNION
    SELECT changed_by AS user_id FROM work_log_entry_status_history
      WHERE changed_by IS NOT NULL
        AND changed_at >= week_start AND changed_at < week_end
    UNION
    SELECT author_id AS user_id FROM work_log_comments
      WHERE created_at >= week_start AND created_at < week_end
  ),
  completed AS (
    SELECT user_id, count(*) AS c FROM work_log_entries
      WHERE entry_type = 'completed'
        AND completed_at >= week_start AND completed_at < week_end
      GROUP BY user_id
  ),
  slipped AS (
    SELECT user_id, count(*) AS c FROM work_log_delay_log
      WHERE created_at >= week_start AND created_at < week_end
      GROUP BY user_id
  ),
  open_now AS (
    SELECT user_id, count(*) AS c FROM work_log_entries
      WHERE entry_type <> 'completed'
      GROUP BY user_id
  )
  SELECT
    au.user_id,
    coalesce(cp.c, 0)::int AS completed_count,
    coalesce(sl.c, 0)::int AS slipped_count,
    coalesce(on_.c, 0)::int AS open_count
  FROM active_users au
  LEFT JOIN completed cp ON cp.user_id = au.user_id
  LEFT JOIN slipped sl ON sl.user_id = au.user_id
  LEFT JOIN open_now on_ ON on_.user_id = au.user_id;
$$;

GRANT EXECUTE ON FUNCTION public.weekly_digest_stats(timestamptz, timestamptz) TO service_role;
