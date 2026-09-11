import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, serviceKey)

    // 1. Fetch students from profiles table
    const { data: students, error: profError } = await supabase
      .from('profiles')
      .select('id, full_name, role, resume_url, created_at')
      .eq('role', 'student')
      .order('created_at', { ascending: false })

    if (profError) {
      console.error('Error fetching student profiles:', profError)
      return NextResponse.json({ candidates: [] }, { status: 200 })
    }

    // 2. Fetch auth users to map real emails
    let emailMap: Record<string, string> = {}
    try {
      const { data: authData } = await supabase.auth.admin.listUsers()
      if (authData?.users) {
        authData.users.forEach((u) => {
          if (u.id && u.email) {
            emailMap[u.id] = u.email
          }
        })
      }
    } catch (e) {
      console.warn('Could not list auth users:', e)
    }

    // 3. For each student, fetch their latest assessment
    const candidates = await Promise.all(
      (students || []).map(async (st: any) => {
        const { data: assessment } = await supabase
          .from('skill_assessments')
          .select('skill_profile, created_at')
          .eq('student_id', st.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        const skillsObj = assessment?.skill_profile || {}
        const topSkills = Object.entries(skillsObj)
          .sort(([, a], [, b]) => Number(b) - Number(a))
          .map(([name, score]) => ({ name, score: Number(score) }))

        return {
          id: st.id,
          full_name: st.full_name || 'Anonymous Student',
          email: emailMap[st.id] || '',
          resume_url: st.resume_url,
          created_at: st.created_at,
          topSkills,
          hasAssessment: !!assessment && Object.keys(skillsObj).length > 0
        }
      })
    )

    return NextResponse.json({ candidates })
  } catch (error: any) {
    console.error('API /api/company/candidates error:', error)
    return NextResponse.json({ candidates: [], error: error.message }, { status: 500 })
  }
}
