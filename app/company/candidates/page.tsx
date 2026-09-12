'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { 
  Users, 
  Search, 
  Award, 
  ArrowRight, 
  User, 
  BookOpen, 
  Mail, 
  Sparkles,
  CheckCircle2,
  ExternalLink
} from 'lucide-react'

const cleanSkillName = (name: string) => {
  const map: Record<string, string> = {
    "Database Performance & Query Optimization": "Database Optimization",
    "Algorithm Optimization & Data Structures": "Data Structures & Algorithms",
    "Version Control & Git Workflow": "Git & Version Control",
    "System Architecture & Asynchronous Processing": "System Architecture",
    "Incident Triage & Debugging Methodology": "Debugging & Incident Triage",
    "Clean Code & Refactoring": "Clean Code & Refactoring",
    "Technical Communication & Trade-off Management": "Technical Communication",
    "Engineering Ethics & Risk Assessment": "Engineering Ethics"
  }
  return map[name] || name
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadCandidates()
  }, [])

  async function loadCandidates() {
    setLoading(true)
    try {
      const res = await fetch('/api/company/candidates')
      const json = await res.json()
      if (json.candidates && json.candidates.length > 0) {
        setCandidates(json.candidates)
        setLoading(false)
        return
      }
    } catch (e) {
      console.warn('Failed to load from API, falling back to direct Supabase:', e)
    }

    // Fallback: Direct Supabase fetch without invalid 'email' column
    const { data: students } = await supabase
      .from('profiles')
      .select('id, full_name, role, resume_url, created_at')
      .eq('role', 'student')
      .order('created_at', { ascending: false })

    if (students && students.length > 0) {
      const candidatesWithSkills = await Promise.all(
        students.map(async (st: any) => {
          const { data: assessment } = await supabase
            .from('skill_assessments')
            .select('skill_profile, created_at')
            .eq('student_id', st.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

          const skillsObj = assessment?.skill_profile || {}
          const topSkills = Object.entries(skillsObj)
            .sort(([, a], [, b]) => Number(b) - Number(a))
            .slice(0, 5)
            .map(([name, score]) => ({ name: cleanSkillName(name), score: Number(score) }))

          return {
            ...st,
            topSkills,
            hasAssessment: !!assessment && Object.keys(skillsObj).length > 0
          }
        })
      )
      setCandidates(candidatesWithSkills)
    } else {
      setCandidates([])
    }
    setLoading(false)
  }

  // Extract all unique skills across candidates for quick filter pills
  const allUniqueSkills = Array.from(
    new Set(
      candidates.flatMap(c => (c.topSkills || []).map((s: any) => cleanSkillName(s.name)))
    )
  ).slice(0, 8)

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = 
      (c.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
      c.topSkills.some((s: any) => s.name.toLowerCase().includes(search.toLowerCase()))
    
    const matchesSkill = !selectedSkill || c.topSkills.some((s: any) => s.name === selectedSkill)

    return matchesSearch && matchesSkill
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Users className="text-blue-400" /> Candidate Talent Pool
          </h1>
          <p className="text-slate-400 mt-1">
            Discover pre-assessed candidates with verified AI skill profiles ready to hire.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="premium-card p-6 rounded-3xl space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search candidates by name, email, or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="premium-input pl-11"
          />
        </div>

        {allUniqueSkills.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[rgba(255,255,255,0.05)]">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Filter by Skill:</span>
            <button
              onClick={() => setSelectedSkill(null)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                selectedSkill === null 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              All Skills
            </button>
            {allUniqueSkills.map((skill) => (
              <button
                key={skill}
                onClick={() => setSelectedSkill(selectedSkill === skill ? null : skill)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                  selectedSkill === skill 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'bg-[#0a0a0a] border border-[rgba(255,255,255,0.05)] text-slate-400 hover:bg-white/5'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Candidate List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center relative z-10">
          <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-400 rounded-full animate-spin"></div>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="premium-card rounded-3xl p-12 text-center flex flex-col items-center">
          <Users className="w-12 h-12 text-slate-500 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No candidates found</h3>
          <p className="text-slate-400 max-w-md">
            {search || selectedSkill 
              ? "No students match your search filters. Try clearing your search or selecting a different skill."
              : "Registered students who complete skills verification will automatically appear here."}
          </p>
          {(search || selectedSkill) && (
            <button
              onClick={() => { setSearch(''); setSelectedSkill(null); }}
              className="mt-4 px-4 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl font-bold text-sm hover:bg-blue-500/20 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredCandidates.map((candidate) => (
            <div 
              key={candidate.id}
              className="premium-card rounded-3xl p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-black text-xl flex-shrink-0 border border-blue-500/20">
                      {candidate.full_name ? candidate.full_name.charAt(0).toUpperCase() : <User size={24} />}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {candidate.full_name || 'Anonymous Student'}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <Mail size={12} /> {candidate.email || 'No email provided'}
                      </div>
                    </div>
                  </div>

                  {candidate.hasAssessment && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold">
                      <Sparkles size={12} /> AI Verified
                    </span>
                  )}
                </div>

                {/* Verified Skills */}
                <div className="mt-4">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Award size={12} className="text-blue-400" /> Verified Skills
                  </div>
                  {candidate.topSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {candidate.topSkills.map((s: any, idx: number) => (
                        <span 
                          key={idx}
                          className="px-2.5 py-1 bg-[#0a0a0a] border border-[rgba(255,255,255,0.05)] text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                        >
                          <span>{s.name}</span>
                          <span className="text-blue-400 font-bold text-[10px]">{s.score}%</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Assessment not yet taken</p>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-[rgba(255,255,255,0.05)] flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  Candidate ID: {candidate.id.slice(0, 8)}...
                </span>
                <Link
                  href={`/company/students/${candidate.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
                >
                  View Profile <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
