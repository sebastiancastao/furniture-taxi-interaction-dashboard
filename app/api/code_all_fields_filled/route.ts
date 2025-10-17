import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceKey);

export async function GET() {
  // Get code_all_fields_filled data
  const { data: fieldsFilledData, error: fieldsFilledError } = await supabase
    .from('code_all_fields_filled')
    .select('id, code, filled_at, field_snapshot')
    .order('filled_at', { ascending: false });

  if (fieldsFilledError) {
    return NextResponse.json({ error: fieldsFilledError.message }, { status: 500 });
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

  // Enrich fields filled data with user information
  const enrichedData = fieldsFilledData?.map(filled => ({
    ...filled,
    name: codeLookup.get(filled.code)?.name || 'Unknown',
    email: codeLookup.get(filled.code)?.email || 'Unknown',
    phone: codeLookup.get(filled.code)?.phone || 'Unknown',
    source: codeLookup.get(filled.code)?.source || 'Unknown'
  })) || [];

  return NextResponse.json(enrichedData);
}
