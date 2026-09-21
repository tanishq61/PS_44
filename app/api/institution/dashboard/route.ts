import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

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

    // 3. Get all students linked to this institution
    // We can use supabaseAdmin here too for consistency, but filtering by institution_id ensures security
    const { data: linkedStudents } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('role', 'student')
      .eq('institution_id', user.id);
      
    const studentIds = linkedStudents ? linkedStudents.map(s => s.id) : [];
    const totalStudents = studentIds.length;

    // 4. Get latest assessment per student using Admin to bypass RLS
    let latestAssessments: any[] = [];
    if (studentIds.length > 0) {
      const { data: fetchedAssessments } = await supabaseAdmin
        .from('skill_assessments')
        .select('*')
        .in('student_id', studentIds)
        .order('created_at', { ascending: false });
        
      if (fetchedAssessments) {
        const map = new Map<string, any>();
        fetchedAssessments.forEach(a => {
          if (!map.has(a.student_id)) {
            map.set(a.student_id, a);
          }
        });
        latestAssessments = Array.from(map.values());
      }
    }

    // 5. Get applications for these students ONLY using Admin to bypass RLS
    let applications: any[] = [];
    if (studentIds.length > 0) {
      const { data: fetchedApps } = await supabaseAdmin
        .from('applications')
        .select('match_score')
        .in('student_id', studentIds);
      applications = fetchedApps || [];
    }

    const assessedCount = latestAssessments.length;
    const appCount = applications.length;
    
    let avgScore = 0;
    if (appCount > 0) {
      const totalScore = applications.reduce((sum, app) => sum + (Number(app.match_score) || 0), 0);
      avgScore = Math.round(totalScore / appCount);
    }

    const stats = {
      totalStudents,
      assessedStudents: assessedCount,
      totalApplications: appCount,
      averageMatchScore: avgScore
    };

    const CORE_SKILLS = [
      "Data Structures",
      "Database Management",
      "Software Engineering",
      "Computer Science Fundamentals",
      "Version Control",
      "Team Collaboration",
      "Communication Skills",
      "Adaptability"
    ];

    function normalizeSkill(text: string): string | null {
      const t = text.toLowerCase();
      if (t.includes('data structure') || t.includes('tree') || t.includes('graph') || t.includes('lifo')) return 'Data Structures';
      if (t.includes('database') || t.includes('sql') || t.includes('nosql') || t.includes('query')) return 'Database Management';
      if (t.includes('version control') || t.includes('git') || t.includes('commit') || t.includes('rebase')) return 'Version Control';
      if (t.includes('team') || t.includes('collaboration') || t.includes('agile') || t.includes('sprint') || t.includes('code review')) return 'Team Collaboration';
      if (t.includes('communication') || t.includes('stakeholder') || t.includes('presenting')) return 'Communication Skills';
      if (t.includes('adaptability') || t.includes('change') || t.includes('learn') || t.includes('resilience')) return 'Adaptability';
      if (t.includes('algorithm') || t.includes('complexity') || t.includes('big o') || t.includes('computer science')) return 'Computer Science Fundamentals';
      if (t.includes('software engineering') || t.includes('solid') || t.includes('architecture') || t.includes('system design') || t.includes('clean code')) return 'Software Engineering';
      return null;
    }

    const gapCounts: Record<string, number> = {};
    CORE_SKILLS.forEach(s => gapCounts[s] = 0);

    if (latestAssessments.length > 0) {
      latestAssessments.forEach(ass => {
        const studentGaps = new Set<string>();

        if (ass.gap_analysis && typeof ass.gap_analysis === 'object') {
          Object.values(ass.gap_analysis).forEach((roleGaps: any) => {
            if (Array.isArray(roleGaps)) {
              roleGaps.forEach(gapText => {
                if (typeof gapText === 'string') {
                  const mapped = normalizeSkill(gapText);
                  if (mapped) studentGaps.add(mapped);
                }
              });
            }
          });
        }

        if (ass.skill_profile && typeof ass.skill_profile === 'object') {
          Object.entries(ass.skill_profile).forEach(([skillName, score]) => {
            if (Number(score) < 70) {
              const mapped = normalizeSkill(skillName);
              if (mapped) studentGaps.add(mapped);
            }
          });
        }

        studentGaps.forEach(skill => {
          gapCounts[skill] = (gapCounts[skill] || 0) + 1;
        });
      });
    }

    const totalCohort = assessedCount || 1;
    const trends = Object.entries(gapCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / totalCohort) * 100),
        total: totalCohort
      }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const { data: opps } = await supabase
      .from('opportunities')
      .select('*, applications(id, match_score)')
      .eq('industry_id', user.id)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      stats,
      skillTrends: trends,
      postings: opps || []
    });
  } catch (error: any) {
    console.error("Institution Dashboard API Error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
