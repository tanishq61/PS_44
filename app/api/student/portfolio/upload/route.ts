import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase-server';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

import { z } from 'zod';

const UploadSchema = z.object({
  title: z.string().min(1).max(100),
  type: z.enum(['certificate', 'project', 'achievement', 'internship', 'course', 'workshop']),
  description: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  try {
    // Basic IP-based rate limiting fallback (X-Forwarded-For is commonly used)
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const rateLimitResult = await rateLimit(`upload_${ip}`, 10, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const titleRaw = formData.get('title') as string;
    const typeRaw = formData.get('type') as string;
    const descriptionRaw = formData.get('description') as string;

    if (!file) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }

    const result = UploadSchema.safeParse({
      title: titleRaw,
      type: typeRaw,
      description: descriptionRaw,
    });

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid fields', details: result.error.errors }, { status: 400 });
    }

    const { title, type, description } = result.data;

    // 1. Authenticate Request Securely
    const supabaseServer = await createClient();
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser();
    
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = user.id;

    // 2. Validate File Type
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only PDF, Images, and Word documents are allowed.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseServiceKey);

    const fileExt = file.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'bin';
    const filePath = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Upload file using service role admin
    const { error: uploadError } = await supabaseAdmin.storage
      .from('documents')
      .upload(filePath, buffer, {
        contentType: file.type || 'application/pdf',
        upsert: true
      });

    if (uploadError) {
      console.error('Storage Upload Error:', uploadError.message);
      return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
    }

    // 2. Get Public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('documents')
      .getPublicUrl(filePath);

    // 3. Create portfolio item
    const { error: insertError } = await supabaseAdmin
      .from('portfolio_items')
      .insert({
        student_id: userId,
        type,
        title,
        description,
        file_url: publicUrl,
        verified: false
      });

    if (insertError) {
      console.error('Portfolio Insert Error:', insertError.message);
      return NextResponse.json({ error: 'Failed to save portfolio entry' }, { status: 500 });
    }

    return NextResponse.json({ success: true, publicUrl });
  } catch (error: any) {
    console.error('Document Upload API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
