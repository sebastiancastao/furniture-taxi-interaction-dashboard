import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceKey);

export async function GET(req: NextRequest) {
  // Get code_input_events data
  const { data: inputEventsData, error: inputEventsError } = await supabase
    .from('code_input_events')
    .select('id, code, field_name, input_value, changed_at')
    .order('changed_at', { ascending: false });

  if (inputEventsError) {
    return NextResponse.json({ error: inputEventsError.message }, { status: 500 });
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

  // Enrich input events data with user information
  const enrichedData = inputEventsData?.map(event => ({
    ...event,
    name: codeLookup.get(event.code)?.name || 'Unknown',
    email: codeLookup.get(event.code)?.email || 'Unknown',
    phone: codeLookup.get(event.code)?.phone || 'Unknown',
    source: codeLookup.get(event.code)?.source || 'Unknown'
  })) || [];

  return NextResponse.json(enrichedData);
}
