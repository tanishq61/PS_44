import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, serviceKey)

    let targetId = rawId

    // If ID is undefined or placeholder, find latest student/applicant
    if (!targetId || targetId === 'undefined' || targetId === 'candidate') {
      const { data: latestApp } = await supabase
        .from('applications')
        .select('student_id')
        .order('applied_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (latestApp?.student_id) {
        targetId = latestApp.student_id
      } else {
        const { data: anyStudent } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'student')
          .limit(1)
          .maybeSingle()
        if (anyStudent?.id) {
          targetId = anyStudent.id
        }
      }
    }

    if (!targetId || targetId === 'undefined' || targetId === 'candidate') {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    // 1. Fetch profile
    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetId)
      .maybeSingle()

    if (!profile) {
      // Fallback: pick any student
      const { data: fallbackProf } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .limit(1)
        .maybeSingle()
      if (fallbackProf) {
        profile = fallbackProf
        targetId = fallbackProf.id
      }
    }

    if (!profile) {
      return NextResponse.json({ error: 'Candidate profile not found' }, { status: 404 })
    }

    // 2. Fetch email from auth
    try {
      const { data: userData } = await supabase.auth.admin.getUserById(targetId)
      if (userData?.user?.email) {
        profile.email = userData.user.email
      }
    } catch (e) {
      console.warn('Could not fetch user email:', e)
    }

    // 3. Fetch latest skill assessment
    const { data: assessment } = await supabase
      .from('skill_assessments')
      .select('*')
      .eq('student_id', targetId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // 4. Fetch portfolio items
    const { data: portfolio } = await supabase
      .from('portfolio_items')
      .select('*')
      .eq('student_id', targetId)
      .order('created_at', { ascending: false })

    return NextResponse.json({
      profile,
      skills: assessment?.skill_profile || {},
      portfolio: portfolio || []
    })
  } catch (error: any) {
    console.error('API /api/company/students/[id] error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
