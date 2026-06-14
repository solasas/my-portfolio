import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'sashank2025';

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET() {
  try {
    const supabase = getSupabase();
    if (!supabase) return Response.json({});

    const { data, error } = await supabase
      .from('portfolio_content')
      .select('data')
      .eq('id', 1)
      .single();

    if (error || !data) return Response.json({});
    return Response.json(data.data ?? {});
  } catch {
    return Response.json({});
  }
}

export async function POST(req: NextRequest) {
  try {
    const { password, content } = await req.json();
    if (password !== ADMIN_PASSWORD)
      return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = getSupabase();
    if (!supabase) return Response.json({ ok: true, note: 'Supabase not configured' });

    const { error } = await supabase
      .from('portfolio_content')
      .upsert({ id: 1, data: content });

    if (error) throw error;
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: 'Failed' }, { status: 500 });
  }
}
