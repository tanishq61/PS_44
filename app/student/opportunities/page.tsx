'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { 
  Briefcase, 
  Clock, 
  MapPin, 
  Sparkles,
  CheckCircle2,
  Building2,
  Search,
  Loader2
} from 'lucide-react'

export default function StudentOpportunities() {
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [applications, setApplications] = useState<string[]>([]) // Array of opportunity IDs applied to
  const [assessment, setAssessment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [applyingTo, setApplyingTo] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Fetch opportunities with industry org_name
    const { data: opps } = await supabase
      .from('opportunities')
      .select('*, profiles(org_name)')
      .in('type', ['job', 'internship'])
      .order('created_at', { ascending: false })
    
    // 2. Fetch user's latest assessment for matching logic
    if (user) {
      const { data: profile } = await supabase
        .from('skill_assessments')
        .select('*')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (profile) setAssessment(profile)

      // 3. Fetch user's current applications so we don't apply twice
      const { data: apps } = await supabase
        .from('applications')
        .select('opportunity_id')
        .eq('student_id', user.id)
      
      if (apps) {
        setApplications(apps.map(a => a.opportunity_id))
      }
    }

    setOpportunities(opps || [])
    setLoading(false)
  }

  // Filter opportunities based on search query
  const filteredOpportunities = opportunities.filter(opp => {
    if (!searchQuery) return true
    const searchLower = searchQuery.toLowerCase()
    return (
      opp.title?.toLowerCase().includes(searchLower) ||
      opp.type?.toLowerCase().includes(searchLower) ||
      opp.profiles?.org_name?.toLowerCase().includes(searchLower) ||
      (opp.required_skills && opp.required_skills.some((skill: string) => skill.toLowerCase().includes(searchLower)))
    )
  })

  // AI Matching calculation
  const calculateMatchScore = (requiredSkills: string[], studentProfile: Record<string, number>) => {
    if (!requiredSkills || requiredSkills.length === 0) return 100 // No specific skills required
    if (!studentProfile) return 0 // Student hasn't taken assessment

    let totalScore = 0
    let matchCount = 0

    // Try to find case-insensitive matches or partial matches
    requiredSkills.forEach(reqSkill => {
      const reqLower = reqSkill.toLowerCase()
      // Find highest matching skill score for this requirement
      let bestScore = 0
      
      Object.entries(studentProfile).forEach(([studentSkill, score]) => {
        const studentLower = studentSkill.toLowerCase()
        if (studentLower.includes(reqLower) || reqLower.includes(studentLower)) {
          bestScore = Math.max(bestScore, Number(score))
        }
      })
      
      totalScore += bestScore
      if (bestScore > 0) matchCount++
    })

    // Average the scores across all required skills
    const rawAverage = totalScore / requiredSkills.length
    
    // Boost score slightly if they have at least *some* of all required skills
    const coverageMultiplier = matchCount === requiredSkills.length ? 1.1 : 1.0
    
    const finalScore = Math.min(100, Math.round(rawAverage * coverageMultiplier))
    return finalScore
  }

  const handleApply = async (opportunity: any) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert("Please log in to apply.")
      return
    }

    setApplyingTo(opportunity.id)

    // Calculate real Match Score based on assessment
    const matchScore = calculateMatchScore(opportunity.required_skills, assessment?.skill_profile || {})

    try {
      const { error } = await supabase.from('applications').insert({
        student_id: user.id,
        opportunity_id: opportunity.id,
        status: 'applied',
        match_score: matchScore
      })

      if (error) throw error

      // Update UI immediately
      setApplications([...applications, opportunity.id])
      
      // Simulate slight delay for AI matching "feel"
      await new Promise(r => setTimeout(r, 1000))

      alert(`Applied successfully! Your AI Match Score for this role is ${matchScore}%`)

    } catch (error) {
      console.error("Error applying:", error)
      alert("Failed to apply.")
    } finally {
      setApplyingTo(null)
    }
  }

  if (loading) return (
    <div className="flex h-[50vh] items-center justify-center relative z-10">
      <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-400 rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 z-10 relative">
      {/* Header */}
      <div className="premium-card p-8 md:p-12 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Briefcase className="w-64 h-64 text-indigo-400" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-medium mb-6">
            <Sparkles size={14} /> AI Match Scoring Active
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-white">
            Live Opportunities
          </h1>
          <p className="text-lg md:text-xl text-slate-400 font-light max-w-2xl mb-8">
            Browse active jobs and internships. When you apply, the AI automatically evaluates your profile against the required skills.
          </p>
          
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search roles, skills, companies..." 
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-[rgba(255,255,255,0.05)] transition-all shadow-lg"
            />
          </div>
        </div>
      </div>

      {!assessment && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 flex items-start gap-4">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-bold text-amber-400 mb-1">Boost your match scores!</h3>
            <p className="text-amber-200/70 text-sm mb-3">You haven't taken the AI skill assessment yet. Companies will see a 0% match score until you verify your skills.</p>
            <a href="/student/assessment" className="text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors">Take Assessment Now →</a>
          </div>
        </div>
      )}

      {/* Opportunities List */}
      <div className="grid gap-6">
        {filteredOpportunities.length === 0 ? (
          <div className="glass-panel p-12 text-center">
            <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No opportunities found</h3>
            <p className="text-slate-400">Try adjusting your search or check back soon!</p>
          </div>
        ) : (
          filteredOpportunities.map((opp) => {
            const hasApplied = applications.includes(opp.id)
            const isApplying = applyingTo === opp.id
            
            // Calculate hypothetical match score for display
            const estMatchScore = calculateMatchScore(opp.required_skills, assessment?.skill_profile || {})

            return (
              <div key={opp.id} className="premium-card p-6 md:p-8 flex flex-col md:flex-row gap-6 group hover:-translate-y-1 transition-transform">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 text-xs font-bold rounded-md ${opp.type === 'job' ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'}`}>
                      {opp.type ? opp.type.toUpperCase() : 'JOB'}
                    </span>
                    {opp.deadline && (
                      <span className="flex items-center gap-1 text-sm text-slate-400 font-medium">
                        <Clock size={14} /> Due {new Date(opp.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">{opp.title}</h3>
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
                    <Building2 size={16} /> {opp.profiles?.org_name || opp.profiles?.full_name || 'Unknown Organization'}
                  </div>
                  
                  <p className="text-slate-400 font-light mb-6 max-w-3xl leading-relaxed">
                    {opp.description || "No specific description provided."}
                  </p>

                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Required Skills</div>
                    <div className="flex flex-wrap gap-2">
                      {(opp.required_skills || []).map((skill: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] text-slate-300 text-xs font-semibold rounded-lg">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="md:w-64 flex flex-col justify-between border-t md:border-t-0 md:border-l border-[rgba(255,255,255,0.05)] pt-6 md:pt-0 md:pl-6">
                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 text-center mb-6">
                    <div className="text-xs font-bold text-indigo-400 uppercase mb-1">Est. Match Score</div>
                    <div className="text-3xl font-black text-white">{assessment ? `${estMatchScore}%` : '??%'}</div>
                  </div>

                  {hasApplied ? (
                    <button disabled className="w-full py-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold rounded-xl flex items-center justify-center gap-2">
                      <CheckCircle2 size={18} /> Applied
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleApply(opp)}
                      disabled={isApplying}
                      className="w-full group/btn relative flex items-center justify-center gap-2 premium-button-primary py-3.5 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {isApplying ? (
                        <Loader2 className="w-5 h-5 animate-spin text-white" />
                      ) : (
                        <>
                          <span className="relative z-10">Apply with AI Profile</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
