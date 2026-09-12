'use client'

import { Users, TrendingUp, BookOpen } from 'lucide-react'

export default function InstitutionPreview() {
  return (
    <div className="w-full h-full bg-[#030303] text-slate-200 p-6 md:p-8 flex flex-col gap-6 overflow-hidden relative" style={{ borderRadius: 'inherit' }}>
      
      {/* Header Mock */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 glass-panel p-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            Institution Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">Monitor student skill development and placement readiness.</p>
        </div>
      </div>

      {/* KPI Cards Mock */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="premium-card p-6 flex items-center gap-4 group">
          <div className="neumorphic-icon p-4 text-blue-400 group-hover:text-blue-300 transition-colors">
            <Users size={20} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 mb-1">Total Students</div>
            <div className="text-xl font-black text-white">4,285</div>
          </div>
        </div>
        
        <div className="premium-card p-6 flex items-center gap-4 group">
          <div className="neumorphic-icon p-4 text-indigo-400 group-hover:text-indigo-300 transition-colors">
            <BookOpen size={20} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 mb-1">Assessed</div>
            <div className="text-xl font-black text-white">3,192</div>
          </div>
        </div>

        <div className="premium-card p-6 flex items-center gap-4 group">
          <div className="neumorphic-icon p-4 text-emerald-400 group-hover:text-emerald-300 transition-colors">
            <TrendingUp size={20} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 mb-1">Job Applications</div>
            <div className="text-xl font-black text-white">8,405</div>
          </div>
        </div>
      </div>

      {/* Charts area mock */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        <div className="premium-card p-6 min-h-[160px] flex flex-col">
          <h2 className="text-sm font-semibold text-white mb-4">Placement Overview</h2>
          <div className="flex-1 flex items-end gap-2 px-4 pb-2">
            <div className="w-1/3 bg-blue-500/20 rounded-t-md h-[40%] border-t border-blue-500/50"></div>
            <div className="w-1/3 bg-amber-500/20 rounded-t-md h-[70%] border-t border-amber-500/50"></div>
            <div className="w-1/3 bg-emerald-500/20 rounded-t-md h-[100%] border-t border-emerald-500/50"></div>
          </div>
        </div>
        
        <div className="premium-card p-6 min-h-[160px] flex flex-col">
          <h2 className="text-sm font-semibold text-white mb-4">Top Skill Domains</h2>
          <div className="flex-1 flex flex-col justify-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 flex-1">
                <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 flex-1">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 flex-1">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#030303] to-transparent pointer-events-none"></div>
    </div>
  )
}
