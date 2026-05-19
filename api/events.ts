import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).end();

  if (req.headers['x-admin-key'] !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const [eventsResult, timesResult] = await Promise.all([
    supabase
      .from('toxic_events')
      .select('event, props, ts')
      .order('ts', { ascending: false })
      .limit(500),
    supabase
      .from('toxic_session_times')
      .select('duration')
      .order('id', { ascending: false })
      .limit(200),
  ]);

  return res.status(200).json({
    events: eventsResult.data || [],
    times: (timesResult.data || []).map((r: { duration: number }) => r.duration),
  });
}
