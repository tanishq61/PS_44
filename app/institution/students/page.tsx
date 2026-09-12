'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { 
  Search,
  UserCircle2,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Loader2
} from 'lucide-react'

export default function InstitutionStudents() {
  const [students, setStudents] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadStudents()
  }, [])

  async function loadStudents() {
    setLoading(true)
    try {
      const res = await fetch('/api/institution/students');
      if (!res.ok) throw new Error('Failed to fetch students');
      const data = await res.json();
      setStudents(data || []);
    } catch (e) {
      console.error(e);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredStudents = students.filter(student => {
    if (!searchQuery) return true
    const searchLower = searchQuery.toLowerCase()
    return (
      (student.full_name || '').toLowerCase().includes(searchLower) ||
      (student.email || '').toLowerCase().includes(searchLower)
    )
  })

  if (loading) return (
    <div className="flex h-[50vh] items-center justify-center relative z-10">
      <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 premium-card p-6 rounded-3xl">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Student Analytics</h1>
          <p className="text-slate-400 mt-1 text-sm">Track individual student skill development and placement readiness.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search students..." 
            className="premium-input pl-10 pr-4 py-2.5"
          />
        </div>
      </div>

      {/* Student List */}
      <div className="premium-card rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0a0a0a] border-b border-[rgba(255,255,255,0.05)]">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Assessment Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Top Skill Gap</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Applications</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No students found matching your search.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => {
                  let topGap = "None identified"
                  if (student.assessment?.gap_analysis) {
                    const allGaps = Object.values(student.assessment.gap_analysis).flat()
                    if (allGaps.length > 0) {
                      topGap = allGaps[0] as string
                    }
                  }

                  return (
                    <tr key={student.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                            {(student.full_name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-200">{student.full_name || 'Unknown Student'}</div>
                            <div className="text-xs text-slate-400">{student.email || 'No email provided'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {student.assessment ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                            <TrendingUp size={14} /> Assessed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 text-slate-400 text-xs font-bold border border-[rgba(255,255,255,0.05)]">
                            <AlertCircle size={14} /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-400 max-w-[200px] truncate" title={topGap}>
                          {student.assessment ? topGap : '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-slate-300">
                          {student.applicationsCount}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <a 
                          href={`/institution/students/${student.id}`}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          View Details <ChevronRight size={16} />
                        </a>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
