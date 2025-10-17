import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceKey);

export async function GET() {
  try {
    // Get all discount codes
    const { data: discountData } = await supabase
      .from('discount')
      .select('code');

    // Get all referral codes
    const { data: referralData } = await supabase
      .from('referral')
      .select('code');

    // Get all opened codes
    const { data: opensData } = await supabase
      .from('code_opens')
      .select('code');

    // Calculate totals
    const totalDiscountCodes = discountData?.length || 0;
    const totalReferralCodes = referralData?.length || 0;
    const totalGeneratedCodes = totalDiscountCodes + totalReferralCodes;

    // Create sets for quick lookup
    const discountCodesSet = new Set(discountData?.map(d => d.code) || []);
    const referralCodesSet = new Set(referralData?.map(r => r.code) || []);
    const openedCodesSet = new Set(opensData?.map(o => o.code) || []);

    // Calculate opens for each source
    const discountOpens = [...discountCodesSet].filter(code => openedCodesSet.has(code)).length;
    const referralOpens = [...referralCodesSet].filter(code => openedCodesSet.has(code)).length;
    const totalUniqueOpens = openedCodesSet.size;

    // Calculate conversion rates
    const discountConversionRate = totalDiscountCodes > 0 ? (discountOpens / totalDiscountCodes * 100).toFixed(1) : '0.0';
    const referralConversionRate = totalReferralCodes > 0 ? (referralOpens / totalReferralCodes * 100).toFixed(1) : '0.0';
    const overallConversionRate = totalGeneratedCodes > 0 ? (totalUniqueOpens / totalGeneratedCodes * 100).toFixed(1) : '0.0';

    // Calculate opens per code (some codes might be opened multiple times)
    const totalOpensCount = opensData?.length || 0;
    const opensPerCode = totalUniqueOpens > 0 ? (totalOpensCount / totalUniqueOpens).toFixed(1) : '0.0';

    const analytics = {
      totals: {
        totalGeneratedCodes,
        totalDiscountCodes,
        totalReferralCodes,
        totalUniqueOpens,
        totalOpensCount
      },
      conversions: {
        discountOpens,
        referralOpens,
        discountConversionRate: `${discountConversionRate}%`,
        referralConversionRate: `${referralConversionRate}%`,
        overallConversionRate: `${overallConversionRate}%`,
        opensPerCode
      }
    };

    return NextResponse.json(analytics);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}


