import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase-server';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

import { z } from 'zod';

const ApplySchema = z.object({
  opportunity_id: z.string().uuid(),
});

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const rateLimitResult = await rateLimit(`apply_${ip}`, 10, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const json = await req.json();
    const result = ApplySchema.safeParse(json);
    
    if (!result.success) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }
    
    const { opportunity_id } = result.data;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Bypass RLS using admin client to ensure faculty can apply
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabaseAdmin.from('applications').insert({
      student_id: user.id, // using student_id column as generic applicant ID reference
      opportunity_id,
      status: 'applied',
      match_score: 95 // Hardcoded high score for faculty
    });

    if (error) {
      console.error("DB Insert Error:", error.message);
      return NextResponse.json({ error: "An internal error occurred while processing your application." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("API Error applying:", error);
    return NextResponse.json({ error: "Failed to apply" }, { status: 500 });
  }
}
