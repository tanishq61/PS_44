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

  // Protect internal routes
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/student') || request.nextUrl.pathname.startsWith('/company') || request.nextUrl.pathname.startsWith('/institution')

  if (isProtectedRoute && !user) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Basic Role-Based Routing (optional but good for UX)
  if (user) {
    const isCompanyRoute = request.nextUrl.pathname.startsWith('/company')
    const isStudentRoute = request.nextUrl.pathname.startsWith('/student')
    const isInstitutionRoute = request.nextUrl.pathname.startsWith('/institution')
    
    // Fetch profile to check role
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const role = profile?.role

    if (isCompanyRoute && role !== 'industry') {
      const url = request.nextUrl.clone()
      url.pathname = role === 'institution' ? '/institution' : '/student'
      return NextResponse.redirect(url)
    }

    if (isStudentRoute && role !== 'student') {
      const url = request.nextUrl.clone()
      url.pathname = role === 'institution' ? '/institution' : '/company'
      return NextResponse.redirect(url)
    }

    if (isInstitutionRoute && role !== 'institution') {
      const url = request.nextUrl.clone()
      url.pathname = role === 'industry' ? '/company' : '/student'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
