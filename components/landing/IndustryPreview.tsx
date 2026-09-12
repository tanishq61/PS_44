'use client'

import { Building2, Briefcase, Users, TrendingUp, Sparkles, Clock } from 'lucide-react'

export default function IndustryPreview() {
  return (
    <div className="w-full h-full bg-[#030303] text-slate-200 p-6 md:p-8 flex flex-col gap-6 overflow-hidden relative" style={{ borderRadius: 'inherit' }}>
      
      {/* Welcome Section Mock */}
      <section className="relative overflow-hidden premium-card p-6 md:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 right-4 p-8 opacity-10 pointer-events-none">
          <Building2 className="w-32 h-32 text-blue-400" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-4">
            <Sparkles size={12} /> AI Talent Matching Active
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
            Welcome back, TechCorp
          </h1>
          <p className="text-sm md:text-base text-slate-400 font-light">
            You have 24 high-match candidates across your active postings.
          </p>
        </div>
      </section>

      {/* Stats Grid Mock */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-2">
        <div className="premium-card p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <div className="neumorphic-icon w-10 h-10 text-blue-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="flex items-center text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
              <TrendingUp size={10} className="mr-1"/> Active
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-0.5">3</h3>
            <p className="text-xs text-slate-400 font-medium">Active Postings</p>
          </div>
        </div>

        <div className="premium-card p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <div className="neumorphic-icon w-10 h-10 text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-0.5">142</h3>
            <p className="text-xs text-slate-400 font-medium">Total Applicants</p>
          </div>
        </div>

        <div className="premium-card p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <div className="neumorphic-icon w-10 h-10 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-0.5">24</h3>
            <p className="text-xs text-slate-400 font-medium">High Matches (&gt;80%)</p>
          </div>
        </div>
      </section>
      
      {/* List mock */}
      <div className="premium-card p-5 mt-2 flex-1">
        <h2 className="text-sm font-semibold text-white mb-4">Recent Opportunities</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#0a0a0a] border border-white/5">
            <div>
              <div className="text-sm font-medium text-slate-200">Software Engineer Intern</div>
              <div className="text-[10px] text-slate-500 flex items-center mt-1"><Clock size={10} className="mr-1"/> Posted 2d ago</div>
            </div>
            <div className="text-xs font-semibold text-emerald-400">12 Matches</div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#0a0a0a] border border-white/5">
            <div>
              <div className="text-sm font-medium text-slate-200">Data Science Co-op</div>
              <div className="text-[10px] text-slate-500 flex items-center mt-1"><Clock size={10} className="mr-1"/> Posted 5d ago</div>
            </div>
            <div className="text-xs font-semibold text-emerald-400">8 Matches</div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#030303] to-transparent pointer-events-none"></div>
    </div>
  )
}
