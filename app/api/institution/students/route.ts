import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Fetch all student profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('role', 'student');

    if (profilesError) throw profilesError;

    // 2. Fetch their latest assessments
    const { data: assessments, error: assessError } = await supabaseAdmin
      .from('skill_assessments')
      .select('*');

    if (assessError) throw assessError;

    // 3. Fetch applications
    const { data: applications, error: appsError } = await supabaseAdmin
      .from('applications')
      .select('*');

    if (appsError) throw appsError;

    const enrichedStudents = profiles.map(student => {
      const studentAssessments = (assessments || []).filter(a => a.student_id === student.id);
      studentAssessments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      const latestAssessment = studentAssessments[0];

      const studentApps = (applications || []).filter(a => a.student_id === student.id);

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
