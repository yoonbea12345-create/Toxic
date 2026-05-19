import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { event, props, ts, duration } = req.body || {};

  const ops: Promise<unknown>[] = [];

  if (event) {
    ops.push(
      supabase.from('toxic_events').insert({ event, props: props ?? null, ts: ts || Date.now() })
    );
  }

  if (duration !== undefined) {
    ops.push(
      supabase.from('toxic_session_times').insert({ duration: Number(duration) })
    );
  }

  await Promise.all(ops);
  return res.status(200).json({ ok: true });
}
