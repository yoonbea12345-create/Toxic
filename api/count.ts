import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const HEADERS = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` };

function safeProps(props: unknown): Record<string, unknown> {
  if (!props) return {};
  if (typeof props === 'string') { try { return JSON.parse(props); } catch { return {}; } }
  if (typeof props === 'object') return props as Record<string, unknown>;
  return {};
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const [landingRes, payEventsRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/toxic_events?event=eq.page_view_landing&select=id`, {
        headers: { ...HEADERS, Prefer: 'count=exact', 'Range-Unit': 'items', Range: '0-0' },
      }),
      fetch(`${SUPABASE_URL}/rest/v1/toxic_events?event=eq.paywall_pay&select=props`, {
        headers: HEADERS,
      }),
    ]);

    const cr = landingRes.headers.get('content-range');
    const landingCount = cr ? (parseInt(cr.split('/')[1]) || 0) : 0;

    const payEvents = await payEventsRes.json() as { props: unknown }[];

    let sectionCount = 0, allCount = 0, sectionRevenue = 0, allRevenue = 0;

    for (const e of payEvents) {
      const p = safeProps(e.props);
      const type = String(p.type ?? '');
      const price = Number(p.price) || 0;

      if (type === 'section' || (!type && (price === 500 || price === 700))) {
        sectionCount++;
        sectionRevenue += price;
      } else if (type === 'all' || (!type && (price === 1900 || price === 2500))) {
        allCount++;
        allRevenue += price;
      }
    }

    return res.status(200).json({
      count: landingCount,
      payCount: payEvents.length,
      sectionCount,
      allCount,
      sectionRevenue,
      allRevenue,
      totalRevenue: sectionRevenue + allRevenue,
    });
  } catch {
    return res.status(200).json({ count: 0, payCount: 0, sectionCount: 0, allCount: 0, sectionRevenue: 0, allRevenue: 0, totalRevenue: 0 });
  }
}
