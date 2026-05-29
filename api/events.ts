import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function sbSelect(table: string, query: string) {
  return fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).end();

  if (req.headers['x-admin-key'] !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  try {
    const [eventsRes, timesRes] = await Promise.all([
      sbSelect('toxic_events', 'select=event,props,ts&order=ts.desc&limit=10000'),
      sbSelect('toxic_session_times', 'select=duration&order=id.desc&limit=10000'),
    ]);

    const events = await eventsRes.json() as unknown[];
    const timesRaw = await timesRes.json() as { duration: number }[];

    return res.status(200).json({
      events: Array.isArray(events) ? events : [],
      times: Array.isArray(timesRaw) ? timesRaw.map(r => r.duration) : [],
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
}
