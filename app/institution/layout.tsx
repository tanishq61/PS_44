'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  Briefcase,
  UserCircle,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { name: 'Dashboard', href: '/institution', icon: LayoutDashboard },
  { name: 'Student Analytics', href: '/institution/students', icon: Users },
  { name: 'Profile', href: '/institution/profile', icon: UserCircle },
]

export default function InstitutionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Mobile Menu Button */}
      <div className="md:hidden p-4 bg-white border-b border-slate-200 flex justify-between items-center z-20 relative">
        <span className="font-bold text-xl text-slate-900 flex items-center gap-2">
          <GraduationCap className="text-emerald-600" size={24} />
          Institution Portal
        </span>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-slate-600 hover:text-emerald-600 transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-10
          w-64 h-full md:h-screen
          bg-slate-900 border-r border-slate-800
          flex flex-col shadow-2xl text-slate-300
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-6 hidden md:block border-b border-slate-800">
          <span className="font-bold text-2xl tracking-tight text-white flex items-center gap-3">
            <GraduationCap className="text-emerald-500" />
            Institution
          </span>
          <div className="mt-1 text-xs font-medium text-slate-500 uppercase tracking-wider">Academic Portal</div>
        </div>

        <nav className="flex-1 px-4 py-6 md:py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/institution' && pathname.startsWith(item.href))
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden
                  ${isActive
                    ? 'text-white bg-emerald-600 font-medium shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : 'hover:text-white hover:bg-slate-800'
                  }
                `}
              >
                {isActive && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400 rounded-r-full" />
                )}
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-emerald-400'}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-rose-400 transition-colors"
          >
            <LogOut className="h-5 w-5 text-slate-500 group-hover:text-rose-500" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full md:w-auto h-screen relative scroll-smooth p-6 md:p-10 lg:p-12">
        <div className="max-w-6xl mx-auto h-full">
          {children}
        </div>
      </main>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-0 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}
