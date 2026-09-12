'use client'

import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import React, { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { Briefcase } from 'lucide-react'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        setRole(profile?.role || 'student') // default to student for now if not set
      }
    }
    getUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user)
      } else {
        setUser(null)
        setRole(null)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const pathname = usePathname()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const navRef = useRef(null)
  
  useEffect(() => {
    import('gsap').then(({ default: gsap }) => {
      gsap.fromTo(navRef.current, 
        { y: -20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      )
    })
  }, [])

  if (pathname.startsWith('/student') || pathname.startsWith('/company') || pathname.startsWith('/institution')) {
    return null
  }

  const dashboardHref = role === 'industry' ? '/company' : role === 'institution' ? '/institution' : '/student/profile'

  return (
    <header ref={navRef} className="glass-header px-6 lg:px-10 h-16 flex items-center sticky top-0 z-50">
      <Link className="flex items-center justify-center gap-2.5 group" href="/">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 group-hover:bg-indigo-500/30 group-hover:scale-105 transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]">
          <Briefcase size={16} strokeWidth={2.5} />
        </div>
        <span className="font-bold text-xl tracking-tight text-white group-hover:text-indigo-400 transition-colors">CareerBridge</span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
        {user ? (
          <>
            <Link className="text-sm font-medium text-slate-300 hover:text-white transition-colors" href={dashboardHref}>
              Dashboard
            </Link>
            <button onClick={handleSignOut} className="text-sm font-medium text-rose-500 hover:text-rose-400 transition-colors">
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link className="text-sm font-medium text-slate-300 hover:text-white transition-colors" href="/login">
              Log In
            </Link>
            <Link className="premium-button-primary px-5 py-2 text-sm" href="/signup">
              Sign Up
            </Link>
          </>
        )}
      </nav>
    </header>
  )
}
