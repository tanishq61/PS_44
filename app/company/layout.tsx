'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import {
  Building2,
  LayoutDashboard,
  Briefcase,
  Users,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { name: 'Dashboard', href: '/company', icon: LayoutDashboard },
  { name: 'Opportunities', href: '/company/opportunities', icon: Briefcase },
  { name: 'Candidates', href: '/company/candidates', icon: Users },
  { name: 'Profile', href: '/company/profile', icon: User },
]

export default function CompanyLayout({
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
    <div className="min-h-screen flex flex-col md:flex-row font-sans relative z-0">
      {/* Mobile Menu Button */}
      <div className="md:hidden p-4 glass-header flex justify-between items-center z-20 relative">
        <div className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <Briefcase size={14} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
            CareerBridge
          </span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-slate-400 hover:text-blue-400 transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-10
          w-64 h-full md:h-screen
          bg-[#030303]/60 backdrop-blur-2xl border-r border-[rgba(255,255,255,0.06)]
          flex flex-col text-slate-300
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-6 hidden md:block">
          <div className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <Briefcase size={16} strokeWidth={2.5} />
            </div>
            <span className="font-bold text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              CareerBridge
            </span>
          </div>
          <div className="mt-1 text-xs font-medium text-slate-500 uppercase tracking-wider">Recruitment Portal</div>
        </div>

        <nav className="flex-1 px-4 py-6 md:py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/company' && pathname.startsWith(item.href))
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden
                  ${isActive
                    ? 'text-blue-300 bg-blue-500/10 border border-blue-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[rgba(255,255,255,0.03)] border border-transparent'
                  }
                `}
              >
                {isActive && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                )}
                <Icon className={`h-5 w-5 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-[rgba(255,255,255,0.06)]">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-4 py-3 text-slate-400 rounded-xl hover:bg-rose-500/10 hover:text-rose-400 border border-transparent hover:border-rose-500/20 transition-all duration-300"
          >
            <LogOut className="h-5 w-5 text-slate-500 group-hover:text-rose-400 transition-colors" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full md:w-auto h-screen relative scroll-smooth p-6 md:p-10 lg:p-12 z-0">
        <div className="max-w-6xl mx-auto h-full">
          {children}
        </div>
      </main>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-0 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}
