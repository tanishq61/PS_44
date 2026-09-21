'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { 
  BookOpen, 
  Search, 
  FileText, 
  TrendingUp, 
  Users, 
  ArrowRight,
  Briefcase
} from 'lucide-react'
import Link from 'next/link'

export default function AcademicianDashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [recentOpps, setRecentOpps] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        setProfile(data)
      }
      
      const { data: opps } = await supabase
        .from('opportunities')
        .select('*, profiles(org_name)')
        .in('type', ['fdp', 'consultancy', 'research'])
        .order('created_at', { ascending: false })
        .limit(3)
        
      if (opps) setRecentOpps(opps)
      
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
    </div>
  )

  const userName = profile?.full_name || 'Professor'

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative z-10">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 premium-card p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
            Welcome, {userName}
          </h1>
          <p className="text-slate-400 max-w-xl">
            Explore Faculty Development Programs (FDPs), industry consultancy opportunities, and funded research projects.
          </p>
        </div>
        <div className="relative z-10">
          <Link 
            href="/academician/opportunities" 
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all hover:scale-105"
          >
            Find Opportunities <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/academician/opportunities" className="glass-panel p-6 rounded-3xl border border-[rgba(255,255,255,0.05)] hover:border-orange-500/30 transition-colors group block cursor-pointer">
          <div className="w-12 h-12 bg-orange-500/10 text-orange-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <BookOpen size={24} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">FDPs</h3>
          <p className="text-slate-400 text-sm">Enhance your teaching and technical skills with industry-led Faculty Development Programs.</p>
        </Link>

        <Link href="/academician/opportunities" className="glass-panel p-6 rounded-3xl border border-[rgba(255,255,255,0.05)] hover:border-emerald-500/30 transition-colors group block cursor-pointer">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Briefcase size={24} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Consultancy</h3>
          <p className="text-slate-400 text-sm">Offer your academic expertise to solve real-world industry challenges and earn.</p>
        </Link>

        <Link href="/academician/opportunities" className="glass-panel p-6 rounded-3xl border border-[rgba(255,255,255,0.05)] hover:border-blue-500/30 transition-colors group block cursor-pointer">
          <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <TrendingUp size={24} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Research</h3>
          <p className="text-slate-400 text-sm">Collaborate with corporations on funded research projects and publish impactful papers.</p>
        </Link>
      </div>

      <div className="premium-card p-8 rounded-3xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Recent Postings</h2>
          <Link href="/academician/opportunities" className="text-orange-400 hover:text-orange-300 text-sm font-bold flex items-center gap-1">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        
        {recentOpps.length > 0 ? (
          <div className="grid gap-4">
            {recentOpps.map(opp => (
              <div key={opp.id} className="p-4 border border-[rgba(255,255,255,0.05)] rounded-2xl hover:border-orange-500/30 transition-colors flex justify-between items-center bg-[#0a0a0a]">
                <div>
                  <h4 className="font-bold text-white">{opp.title}</h4>
                  <p className="text-sm text-slate-400">{opp.profiles?.org_name || 'Anonymous Org'} • {opp.type.toUpperCase()}</p>
                </div>
                <Link href="/academician/opportunities" className="px-4 py-2 bg-orange-600/10 text-orange-400 rounded-lg text-sm font-bold hover:bg-orange-600/20">
                  Apply
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 border border-dashed border-[rgba(255,255,255,0.1)] rounded-2xl text-center">
            <Search className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-300 font-bold">Ready to explore?</p>
            <p className="text-slate-500 text-sm mt-1">Head over to the opportunities tab to browse FDPs and consultancy gigs.</p>
          </div>
        )}
      </div>
    </div>
  )
}
