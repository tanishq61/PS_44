import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file || !userId) {
      return NextResponse.json({ error: 'File and userId are required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const fileExt = file.name.split('.').pop() || 'pdf';
    const filePath = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Upload file using service role admin (bypasses RLS block)
    const { error: uploadError } = await supabaseAdmin.storage
      .from('resumes')
      .upload(filePath, buffer, {
        contentType: file.type || 'application/pdf',
        upsert: true
      });

    if (uploadError) {
      console.error('Storage Upload Error:', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // 2. Get Public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('resumes')
      .getPublicUrl(filePath);

    // 3. Update student profile resume_url
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ resume_url: publicUrl })
      .eq('id', userId);

    if (updateError) {
      console.error('Profile Update Error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, publicUrl });
  } catch (error: any) {
    console.error('Resume API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
