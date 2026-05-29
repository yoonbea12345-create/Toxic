import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function sbCount(params: string) {
  return fetch(
    `${SUPABASE_URL}/rest/v1/toxic_events?${params}&select=id`,
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

function parseCount(r: Response) {
  const cr = r.headers.get('content-range');
  const n = cr ? parseInt(cr.split('/')[1]) : 0;
  return isNaN(n) ? 0 : n;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const [landingRes, payAllRes, sectionRes, allRes] = await Promise.all([
      sbCount('event=eq.page_view_landing'),
      sbCount('event=eq.paywall_pay'),
      sbCount('event=eq.paywall_pay&props->>type=eq.section'),
      sbCount('event=eq.paywall_pay&props->>type=eq.all'),
    ]);

    return res.status(200).json({
      count: parseCount(landingRes),
      payCount: parseCount(payAllRes),
      sectionCount: parseCount(sectionRes),
      allCount: parseCount(allRes),
    });
  } catch {
    return res.status(200).json({ count: 0, payCount: 0, sectionCount: 0, allCount: 0 });
  }
}
