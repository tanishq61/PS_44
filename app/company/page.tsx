'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { 
  Building2, 
  Briefcase, 
  Users, 
  TrendingUp, 
  ArrowRight, 
  Clock,
  Sparkles
} from 'lucide-react'

export default function CompanyDashboard() {
  const [userName, setUserName] = useState<string>('Company Portal')
  const [postings, setPostings] = useState<any[]>([])
  const [totalApplicants, setTotalApplicants] = useState(0)
  const [highMatches, setHighMatches] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const name = user.user_metadata?.org_name || user.email?.split('@')[0] || 'Company'
        setUserName(name ? name.charAt(0).toUpperCase() + name.slice(1) : '')
      }

      // Fetch real postings
      const { data: opps } = await supabase
        .from('opportunities')
        .select('*, applications(id, match_score)')
        .order('created_at', { ascending: false })
      
      if (opps) {
        setPostings(opps)
        
        // Calculate totals
        let apps = 0
        let high = 0
        
        opps.forEach(opp => {
          if (opp.applications) {
            apps += opp.applications.length
            high += opp.applications.filter((a: any) => a.match_score >= 80).length
          }
        })
        
        setTotalApplicants(apps)
        setHighMatches(high)
      }
    }
    
    loadData()
  }, [])

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out z-10 relative">
      {/* Welcome Section */}
      <section className="relative overflow-hidden premium-card p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-10 p-8 opacity-20 pointer-events-none">
          <Building2 className="w-48 h-48 text-blue-400" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
            <Sparkles size={14} /> AI Talent Matching Active
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
            Welcome back, {userName}
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-8 font-light">
            You have {highMatches} high-match candidates across your active postings.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/company/opportunities" 
              className="premium-button-primary px-6 py-3"
            >
              Post New Opportunity <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="premium-card p-6 flex flex-col justify-between transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="neumorphic-icon w-12 h-12 text-blue-400 group-hover:text-blue-300 transition-colors">
              <Briefcase className="w-6 h-6" />
            </div>
            <span className="flex items-center text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md">
              <TrendingUp size={12} className="mr-1"/> Active
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white mb-1">{postings.length}</h3>
            <p className="text-sm font-medium text-slate-500">Active Postings</p>
          </div>
        </div>

        <div className="premium-card p-6 flex flex-col justify-between transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="neumorphic-icon w-12 h-12 text-indigo-400 group-hover:text-indigo-300 transition-colors">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white mb-1">{totalApplicants}</h3>
            <p className="text-sm font-medium text-slate-500">Total Applicants</p>
          </div>
        </div>

        <div className="premium-card p-6 flex flex-col justify-between transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="neumorphic-icon w-12 h-12 text-emerald-400 group-hover:text-emerald-300 transition-colors">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="flex items-center text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-md">
              Score &gt; 80%
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white mb-1">{highMatches}</h3>
            <p className="text-sm font-medium text-slate-500">High Match Candidates</p>
          </div>
        </div>
      </section>

      {/* Recent Postings List */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Your Active Postings</h2>
            <p className="text-slate-400 mt-1 text-sm">Manage your jobs and internships</p>
          </div>
          <Link href="/company/opportunities" className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
            View All →
          </Link>
        </div>

        <div className="glass-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#121212] border-b border-[rgba(255,255,255,0.05)] text-slate-400 text-sm font-semibold">
                  <th className="p-4 pl-6">Role</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Applicants</th>
                  <th className="p-4 text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody>
                {postings.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500 font-medium">No active postings found.</td>
                  </tr>
                ) : postings.slice(0, 5).map((job, index) => (
                  <tr key={job.id} className={`group hover:bg-[rgba(255,255,255,0.02)] transition-colors ${index !== postings.length - 1 ? 'border-b border-[rgba(255,255,255,0.05)]' : ''}`}>
                    <td className="p-4 pl-6">
                      <div className="font-bold text-white group-hover:text-blue-400 transition-colors">{job.title}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Clock size={12} /> {new Date(job.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${job.type === 'job' ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'}`}>
                        {job.type ? job.type.toUpperCase() : 'JOB'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-slate-500" />
                        <span className="font-semibold text-slate-300">{job.applications?.length || 0}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right pr-6">
                      <Link 
                        href={`/company/opportunities/${job.id}`}
                        className="inline-flex items-center justify-center p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors border border-transparent hover:border-blue-500/20"
                      >
                        <ArrowRight size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
