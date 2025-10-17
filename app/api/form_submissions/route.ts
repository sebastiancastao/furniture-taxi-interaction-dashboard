import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceKey);

export async function GET(req: NextRequest) {
  // Get form_submissions data - query all columns since schema differs from expected
  const { data: submissionsData, error: submissionsError } = await supabase
    .from('form_submissions')
    .select('*')
    .order('submitted_at', { ascending: false });

  if (submissionsError) {
    return NextResponse.json({ error: submissionsError.message }, { status: 500 });
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

  // Map the database schema to the expected frontend format
  const enrichedData = submissionsData?.map(submission => {
    // Parse submission_snapshot if it exists as a string, otherwise use the direct fields
    let submissionData: Record<string, unknown> = {};

    if (submission.submission_snapshot) {
      try {
        submissionData = typeof submission.submission_snapshot === 'string'
          ? JSON.parse(submission.submission_snapshot)
          : submission.submission_snapshot;
      } catch (e) {
        console.error('Error parsing submission_snapshot:', e);
      }
    }

    // Also include direct fields from the table
    submissionData = {
      ...submissionData,
      name: submission.name,
      email: submission.email,
      phone: submission.phone,
      from_zip: submission.from_zip,
      to_zip: submission.to_zip,
      move_date: submission.move_date,
      move_size: submission.move_size,
      has_discount: submission.has_discount
    };

    return {
      id: submission.id,
      code: submission.code,
      submitted_at: submission.submitted_at,
      submission_data: submissionData,
      // Enrich with discount/referral data if available
      name: codeLookup.get(submission.code)?.name || submission.name || 'Unknown',
      email: codeLookup.get(submission.code)?.email || submission.email || 'Unknown',
      phone: codeLookup.get(submission.code)?.phone || submission.phone || 'Unknown',
      source: codeLookup.get(submission.code)?.source || 'submission'
    };
  }) || [];

  return NextResponse.json(enrichedData);
}
