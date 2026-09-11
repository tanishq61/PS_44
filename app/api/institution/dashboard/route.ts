import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Get total students
    const { count: totalStudents } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student');

    // 2. Get assessments
    const { data: assessments } = await supabaseAdmin
      .from('skill_assessments')
      .select('*');

    // 3. Get applications
    const { data: applications } = await supabaseAdmin
      .from('applications')
      .select('match_score');

    const assessedCount = assessments?.length || 0;
    const appCount = applications?.length || 0;
    
    let avgScore = 0;
    if (appCount > 0 && applications) {
      const totalScore = applications.reduce((sum, app) => sum + (Number(app.match_score) || 0), 0);
      avgScore = Math.round(totalScore / appCount);
    }

    const stats = {
      totalStudents: totalStudents || 0,
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

    if (assessments && assessments.length > 0) {
      assessments.forEach(ass => {
        const studentGaps = new Set<string>();

        // 1. Check gap_analysis
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

        // 2. Check skill_profile scores below threshold (e.g. < 70 is a gap)
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
      
    // 4. Get active postings (optional, but requested in page.tsx)
    // Wait, in page.tsx they fetch `opportunities` where created_at is ordered.
    // They did this: supabase.from('opportunities').select('*, applications(id, match_score)')
    // Since page.tsx already fetches it for the 'Your Active Postings' section, wait!
    // In page.tsx:
    // const { data: opps } = await supabase.from('opportunities').select('*, applications(id, match_score)')
    // Oh! Institution dashboard fetched opportunities to show "Welcome back ... you have X high match candidates across your postings"! 
    // Wait, the Institution portal has no opportunities of its own, they just view all? 
    // Ah, wait! The user copied the COMPANY dashboard to the INSTITUTION dashboard earlier and didn't remove the "Opportunities" part?
    // Let me check app/institution/page.tsx line 32.

    const { data: opps } = await supabaseAdmin
      .from('opportunities')
      .select('*, applications(id, match_score)')
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
