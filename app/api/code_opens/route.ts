import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceKey);

export async function GET() {
  // Get code_opens data
  const { data: opensData, error: opensError } = await supabase
    .from('code_opens')
    .select('code, opened_at')
    .order('opened_at', { ascending: false });

  if (opensError) {
    return NextResponse.json({ error: opensError.message }, { status: 500 });
  }

  // Get discount data
  const { data: discountData } = await supabase
    .from('discount')
    .select('code, name, email, phone');

  // Get referral data
  const { data: referralData } = await supabase
    .from('referral')
    .select('code, name, email, phone');

  // Combine discount and referral data into a lookup map
  const codeLookup = new Map();
  
  discountData?.forEach(item => {
    codeLookup.set(item.code, {
      name: item.name,
      email: item.email,
      phone: item.phone,
      source: 'discount'
    });
  });

  referralData?.forEach(item => {
    codeLookup.set(item.code, {
      name: item.name,
      email: item.email,
      phone: item.phone,
      source: 'referral'
    });
  });

  // Enrich opens data with user information
  const enrichedData = opensData?.map(open => ({
    ...open,
    name: codeLookup.get(open.code)?.name || 'Unknown',
    email: codeLookup.get(open.code)?.email || 'Unknown',
    phone: codeLookup.get(open.code)?.phone || 'Unknown',
    source: codeLookup.get(open.code)?.source || 'Unknown'
  })) || [];

  return NextResponse.json(enrichedData);
}
