import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function genId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { my_name, my_gender, target_name, target_gender, has_target, has_date_data, relation_type, saju_result, ai_phase1, ai_phase2 } = req.body || {};
    const id = genId();

    const r = await fetch(`${SUPABASE_URL}/rest/v1/toxic_shares`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        id,
        my_name: String(my_name || '').slice(0, 50),
        my_gender: String(my_gender || '여').slice(0, 2),
        target_name: String(target_name || '').slice(0, 50),
        target_gender: String(target_gender || '여').slice(0, 2),
        has_target: Boolean(has_target),
        has_date_data: Boolean(has_date_data),
        relation_type: String(relation_type || '연인').slice(0, 20),
        saju_result: saju_result || null,
        ai_phase1: ai_phase1 || null,
        ai_phase2: ai_phase2 || null,
      }),
    });

    if (!r.ok) throw new Error(`Supabase ${r.status}`);
    return res.status(200).json({ id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
}
