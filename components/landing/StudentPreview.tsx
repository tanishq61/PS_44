'use client'

import { Sparkles, TrendingUp, Target, Award, BrainCircuit } from 'lucide-react'

export default function StudentPreview() {
  return (
    <div className="w-full h-full bg-[#030303] text-slate-200 p-6 md:p-8 flex flex-col gap-6 overflow-hidden relative" style={{ borderRadius: 'inherit' }}>
      
      {/* Header Mock */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 glass-panel p-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-3">
            <Sparkles size={12} /> AI Skill Profile Active
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back, Alex</h1>
          <p className="text-sm text-slate-400 mt-1">Your profile is an 85% match for 12 new opportunities.</p>
        </div>
      </div>

      {/* Grid Mock */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col - Profile Match */}
        <div className="md:col-span-1 space-y-6">
          <div className="premium-card p-6 h-full">
            <div className="flex items-center gap-2 mb-6">
              <Target className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-semibold text-white">Match Overview</h2>
            </div>
            
            <div className="flex justify-center mb-6">
              <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-4 border-indigo-500/20 border-t-indigo-500">
                <div className="text-center">
                  <span className="text-3xl font-black text-white">85%</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Software Engineering</span>
                  <span className="text-emerald-400 font-bold">92%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Data Analytics</span>
                  <span className="text-indigo-400 font-bold">78%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col - Recommended Ops */}
        <div className="md:col-span-2">
          <div className="premium-card p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-semibold text-white">Top Recommendations</h2>
              </div>
              <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md">AI Sorted</span>
            </div>

            <div className="space-y-4 flex-1">
              {[
                { title: "Frontend Developer Intern", company: "TechCorp", match: "95%" },
                { title: "Full Stack Project", company: "StartUp Inc", match: "88%" }
              ].map((job, i) => (
                <div key={i} className="p-4 rounded-xl bg-[#0a0a0a] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-medium text-slate-200">{job.title}</h3>
                    <p className="text-xs text-slate-500">{job.company}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <BrainCircuit size={14} className="text-indigo-400" />
                      <span className="text-sm font-semibold text-indigo-400">{job.match} Match</span>
                    </div>
                    <div className="h-8 w-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-xs border border-indigo-500/30">
                      →
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/5 text-center">
              <span className="text-xs text-slate-500">View all 12 recommendations</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative gradient overlay at bottom to imply continuation */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#030303] to-transparent pointer-events-none"></div>
    </div>
  )
}
