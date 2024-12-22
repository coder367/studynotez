select
  cron.schedule(
    'cleanup-inactive-rooms',
    '0 * * * *',  -- Run every hour
    $$
    select
      net.http_post(
        url:='https://xvesmwpswyhylfzxqfdr.supabase.co/functions/v1/cleanup-inactive-rooms',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
      ) as request_id;
    $$
  );