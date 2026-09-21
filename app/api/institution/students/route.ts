import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseServiceKey);

    const supabase = await createClient();

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Verify user is an institution
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'institution') {
      return NextResponse.json({ error: "Forbidden: Not an institution account" }, { status: 403 });
    }

    // 3. Fetch ONLY student profiles linked to this institution
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .eq('institution_id', user.id);

    if (profilesError) throw profilesError;

    const studentIds = profiles ? profiles.map(s => s.id) : [];

    // 4. Fetch their latest assessments (using Admin to bypass RLS)
    let assessments: any[] = [];
    if (studentIds.length > 0) {
      const { data: fetchedAssessments, error: assessError } = await supabaseAdmin
        .from('skill_assessments')
        .select('*')
        .in('student_id', studentIds);
      if (assessError) throw assessError;
      assessments = fetchedAssessments || [];
    }

    // 5. Fetch their applications (using Admin to bypass RLS)
    let applications: any[] = [];
    if (studentIds.length > 0) {
      const { data: fetchedApps, error: appsError } = await supabaseAdmin
        .from('applications')
        .select('*')
        .in('student_id', studentIds);
      if (appsError) throw appsError;
      applications = fetchedApps || [];
    }

    const enrichedStudents = (profiles || []).map(student => {
      const studentAssessments = assessments.filter(a => a.student_id === student.id);
      studentAssessments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      const latestAssessment = studentAssessments[0];

      const studentApps = applications.filter(a => a.student_id === student.id);

      return {
        ...student,
        assessment: latestAssessment || null,
        applicationsCount: studentApps.length
      };
    });

    return NextResponse.json(enrichedStudents);
  } catch (error) {
    console.error("Institution Students API Error:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}
