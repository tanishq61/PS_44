'use client'

import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'

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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <header className="px-4 lg:px-6 h-14 flex items-center border-b border-gray-200 bg-white">
      <Link className="flex items-center justify-center" href="/">
        <span className="font-bold text-xl tracking-tight text-blue-900">Academia AI</span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
        {user ? (
          <>
            <Link className="text-sm font-medium hover:text-blue-600 transition-colors" href="/student/profile">Profile</Link>
            <button onClick={handleSignOut} className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors">
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link className="text-sm font-medium hover:text-blue-600 transition-colors" href="/login">
              Log In
            </Link>
            <Link className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all shadow-sm" href="/signup">
              Sign Up
            </Link>
          </>
        )}
      </nav>
    </header>
  )
}
