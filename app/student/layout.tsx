'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  UserCircle, 
  ClipboardCheck, 
  Briefcase, 
  FileBadge2,
  Compass,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { name: 'Dashboard', href: '/student', icon: LayoutDashboard },
  { name: 'Skill Profile', href: '/student/profile', icon: UserCircle },
  { name: 'Assessments', href: '/student/assessment', icon: ClipboardCheck },
  { name: 'Opportunities', href: '/student/opportunities', icon: Briefcase },
  { name: 'Learning Path', href: '/student/learning', icon: Compass },
  { name: 'Portfolio', href: '/student/portfolio', icon: FileBadge2 },
]

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans relative z-0">
      {/* Mobile Menu Button */}
      <div className="md:hidden p-4 glass-header flex justify-between items-center z-20 relative">
        <div className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <Briefcase size={14} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
            CareerBridge
          </span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-slate-400 hover:text-indigo-400 transition-colors"
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
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-6 hidden md:block">
          <div className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <Briefcase size={16} strokeWidth={2.5} />
            </div>
            <span className="font-bold text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
              CareerBridge
            </span>
          </div>
          <div className="mt-1 text-xs font-medium text-slate-500 uppercase tracking-wider">Student Portal</div>
        </div>

        <nav className="flex-1 px-4 py-6 md:py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/student' && pathname.startsWith(item.href))
            const Icon = item.icon
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden
                  ${isActive 
                    ? 'text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[rgba(255,255,255,0.03)] border border-transparent'
                  }
                `}
              >
                {isActive && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                )}
                <Icon className={`h-5 w-5 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-[rgba(255,255,255,0.06)]">
          <button 
            onClick={async () => {
              const { createClient } = await import('@/lib/supabase');
              const supabase = createClient();
              await supabase.auth.signOut();
              window.location.href = '/login';
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-slate-400 rounded-xl hover:bg-rose-500/10 hover:text-rose-400 border border-transparent hover:border-rose-500/20 transition-all duration-300"
          >
            <LogOut className="h-5 w-5 text-slate-500 group-hover:text-rose-400 transition-colors" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden relative z-0">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 scroll-smooth">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
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

