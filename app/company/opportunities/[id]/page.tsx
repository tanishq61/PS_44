'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { 
  ArrowLeft,
  Briefcase,
  Clock,
  Sparkles,
  CheckCircle2,
  Mail,
  Users
} from 'lucide-react'

export default function OpportunityDetails() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  
  const [opportunity, setOpportunity] = useState<any>(null)
  const [applicants, setApplicants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadOpp() {
      if (!id) return
      
      // 1. Fetch Opportunity
      const { data: opp } = await supabase.from('opportunities').select('*').eq('id', id).single()
      if (opp) setOpportunity(opp)

      // 2. Fetch Real Applications + Profile info
      const { data: apps } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          match_score,
          applied_at,
          student_id,
          profiles (
            full_name
          )
        `)
        .eq('opportunity_id', id)
        .order('match_score', { ascending: false })

      if (apps && apps.length > 0) {
        // 3. For each applicant, fetch their latest verified skills
        const applicantsWithSkills = await Promise.all(apps.map(async (app: any) => {
          const { data: assessment } = await supabase
            .from('skill_assessments')
            .select('skill_profile')
            .eq('student_id', app.student_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          const skillsData = assessment?.skill_profile || {}
          const studentSkills = Object.keys(skillsData)
          
          // Determine matching vs missing skills based on the opportunity requirements
          const reqSkills = opp?.required_skills || []
          const matched: string[] = []
          const missing: string[] = []

          reqSkills.forEach((req: string) => {
            const hasSkill = studentSkills.some(s => s.toLowerCase().includes(req.toLowerCase()) || req.toLowerCase().includes(s.toLowerCase()))
            if (hasSkill) {
              matched.push(req)
            } else {
              missing.push(req)
            }
          })

          return {
            id: app.id,
            student_id: app.student_id,
            name: app.profiles?.full_name || 'Anonymous Student',
            matchScore: app.match_score || 0,
            status: app.status,
            appliedAt: app.applied_at,
            matchedSkills: matched,
            missingSkills: missing,
            otherSkills: studentSkills.filter(s => !matched.includes(s)).slice(0, 3) // showing a few other skills they have
          }
        }))
        setApplicants(applicantsWithSkills)
      } else {
        setApplicants([])
      }

      setLoading(false)
    }
    loadOpp()
  }, [id])

  if (loading) return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  )

  if (!opportunity) return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold text-slate-800">Opportunity Not Found</h2>
      <button onClick={() => router.back()} className="mt-4 text-blue-600 hover:underline">Go back</button>
    </div>
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header & Back Button */}
      <div>
        <Link href="/company/opportunities" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-6 font-medium text-sm">
          <ArrowLeft size={16} /> Back to Postings
        </Link>
        
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Briefcase className="w-48 h-48 text-blue-600" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-3 py-1 text-xs font-bold rounded-md ${opportunity.type === 'job' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  {opportunity.type ? opportunity.type.toUpperCase() : 'JOB'}
                </span>
                <span className="flex items-center gap-1 text-sm text-slate-500 font-medium">
                  <Clock size={14} /> Posted {new Date(opportunity.created_at).toLocaleDateString()}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight mb-4">
                {opportunity.title}
              </h1>
              <p className="text-slate-600 max-w-3xl leading-relaxed">
                {opportunity.description}
              </p>
              
              <div className="mt-6">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Required AI Verified Skills</div>
                <div className="flex flex-wrap gap-2">
                  {(opportunity.required_skills || []).map((skill: string, i: number) => (
                    <span key={i} className="px-3 py-1.5 bg-blue-50 border border-blue-100 text-blue-700 text-sm font-bold rounded-lg shadow-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl min-w-[200px] text-center">
              <div className="text-sm font-bold text-slate-500 mb-1">Real Applicants</div>
              <div className="text-4xl font-black text-slate-800">{applicants.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Matched Candidates Section */}
      <div>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="text-blue-500" /> AI Matched Candidates
            </h2>
            <p className="text-slate-500 mt-1 text-sm">Real candidates scored automatically based on their verified skill assessments.</p>
          </div>
        </div>

        <div className="grid gap-6">
          {applicants.length === 0 ? (
             <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm flex flex-col items-center">
               <Users className="w-12 h-12 text-slate-300 mb-4" />
               <h3 className="text-xl font-bold text-slate-700 mb-2">No applications yet</h3>
               <p className="text-slate-500">When students apply to this role from the student portal, they will appear here with an AI match score.</p>
             </div>
          ) : applicants.map((applicant) => (
            <div key={applicant.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:shadow-md transition-all flex flex-col md:flex-row gap-6 md:items-center">
              
              {/* Match Score Ring */}
              <div className="flex-shrink-0 flex flex-col items-center justify-center relative w-24 h-24">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className={applicant.matchScore >= 90 ? 'text-emerald-500' : applicant.matchScore >= 70 ? 'text-blue-500' : 'text-amber-500'}
                    strokeDasharray={`${applicant.matchScore}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-slate-800">{applicant.matchScore}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Match</span>
                </div>
              </div>

              {/* Applicant Info */}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{applicant.name}</h3>
                    <p className="text-slate-500 text-sm font-medium flex items-center gap-1">
                      Applied {new Date(applicant.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                    applicant.status === 'shortlisted' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    {applicant.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <div className="text-xs font-bold text-emerald-600 mb-1 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Verified Role Matches
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {applicant.matchedSkills.length > 0 ? applicant.matchedSkills.map((s: string, i: number) => (
                        <span key={i} className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md font-semibold">{s}</span>
                      )) : <span className="text-xs text-slate-400">No direct matches</span>}
                    </div>
                  </div>
                  
                  {applicant.missingSkills.length > 0 && (
                    <div>
                      <div className="text-xs font-bold text-rose-500 mb-1">Missing / Unverified</div>
                      <div className="flex flex-wrap gap-1.5">
                        {applicant.missingSkills.map((s: string, i: number) => (
                          <span key={i} className="text-xs px-2 py-1 bg-rose-50 text-rose-600 rounded-md font-semibold">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-row md:flex-col gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                <Link 
                  href={`/company/students/${applicant.student_id || 'candidate'}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-colors"
                >
                  View Profile
                </Link>
                <button 
                  onClick={() => alert(`Contact feature for ${applicant.name} is coming soon!`)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-bold rounded-xl transition-colors"
                >
                  <Mail size={16} /> Contact
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
