import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function sbCount(event: string) {
  return fetch(
    `${SUPABASE_URL}/rest/v1/toxic_events?event=eq.${event}&select=id`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: 'count=exact',
        'Range-Unit': 'items',
        Range: '0-0',
      },
    }
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const [landingRes, payRes] = await Promise.all([
      sbCount('page_view_landing'),
      sbCount('paywall_pay'),
    ]);
    const parse = (r: Response) => {
      const cr = r.headers.get('content-range');
      const n = cr ? parseInt(cr.split('/')[1]) : 0;
      return isNaN(n) ? 0 : n;
    };
    return res.status(200).json({ count: parse(landingRes), payCount: parse(payRes) });
  } catch {
    return res.status(200).json({ count: 0, payCount: 0 });
  }
}
