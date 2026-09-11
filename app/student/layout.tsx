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
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Mobile Menu Button */}
      <div className="md:hidden p-4 bg-white border-b border-slate-200 flex justify-between items-center z-20 relative">
        <span className="font-bold text-xl text-indigo-950 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
          Academia AI
        </span>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-slate-600 hover:text-indigo-600 transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside 
        className={`
          fixed md:sticky top-0 left-0 z-10
          w-64 h-full md:h-screen
          bg-white/80 backdrop-blur-xl border-r border-slate-200/60
          flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)]
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-6 hidden md:block">
          <span className="font-bold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-500">
            Academia AI
          </span>
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
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden
                  ${isActive 
                    ? 'text-indigo-700 bg-indigo-50 font-medium' 
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                  }
                `}
              >
                {isActive && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full" />
                )}
                <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-200/60">
          <button 
            onClick={async () => {
              const { createClient } = await import('@/lib/supabase');
              const supabase = createClient();
              await supabase.auth.signOut();
              window.location.href = '/login';
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-slate-600 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            <LogOut className="h-5 w-5 text-slate-400 group-hover:text-rose-500" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 scroll-smooth">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-0 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}
