import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).end();

  const { id } = req.query;
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'id required' });

  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/toxic_shares?id=eq.${encodeURIComponent(id)}&select=my_name,my_gender,target_name,target_gender,has_target,has_date_data,relation_type,saju_result,ai_phase1,ai_phase2&limit=1`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );
    if (!r.ok) throw new Error(`Supabase ${r.status}`);
    const rows = await r.json();
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'not found' });
    return res.status(200).json({ share: rows[0] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
}
