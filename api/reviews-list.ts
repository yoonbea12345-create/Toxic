import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ADMIN_KEY = '1229';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.headers['x-admin-key'] !== ADMIN_KEY) return res.status(401).end();

  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/toxic_reviews?select=stars,comment,relation_type,toxic_score,ts&order=ts.desc&limit=200`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } },
    );
    const data = await r.json();
    return res.status(200).json({ reviews: Array.isArray(data) ? data : [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
}
