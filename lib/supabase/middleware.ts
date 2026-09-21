import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // This will refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Define public routes
  const publicRoutes = ['/', '/login', '/signup'];
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);

  // Default-deny: if it's not a public route and there is no user, block access
  if (!isPublicRoute && !user) {
    // Check if it's an API route (to return 401 instead of redirect)
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Basic Role-Based Routing (optional but good for UX)
  if (user) {
    const isCompanyRoute = request.nextUrl.pathname.startsWith('/company')
    const isStudentRoute = request.nextUrl.pathname.startsWith('/student')
    const isInstitutionRoute = request.nextUrl.pathname.startsWith('/institution')
    const isAcademicianRoute = request.nextUrl.pathname.startsWith('/academician')
    
    // Fetch profile to check role
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const role = profile?.role

    if (isCompanyRoute && role !== 'industry') {
      const url = request.nextUrl.clone()
      url.pathname = role === 'institution' ? '/institution' : (role === 'academician' ? '/academician' : '/student')
      return NextResponse.redirect(url)
    }

    if (isStudentRoute && role !== 'student') {
      const url = request.nextUrl.clone()
      url.pathname = role === 'institution' ? '/institution' : (role === 'academician' ? '/academician' : '/company')
      return NextResponse.redirect(url)
    }

    if (isInstitutionRoute && role !== 'institution') {
      const url = request.nextUrl.clone()
      url.pathname = role === 'industry' ? '/company' : (role === 'academician' ? '/academician' : '/student')
      return NextResponse.redirect(url)
    }

    if (isAcademicianRoute && role !== 'academician') {
      const url = request.nextUrl.clone()
      url.pathname = role === 'industry' ? '/company' : (role === 'institution' ? '/institution' : '/student')
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
