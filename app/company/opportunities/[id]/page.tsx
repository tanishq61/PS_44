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
            status: app.status || 'applied',
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

  const updateStatus = async (appId: string, newStatus: string) => {
    // Optimistic UI update
    setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a))
    // DB update
    await supabase.from('applications').update({ status: newStatus }).eq('id', appId)
  }

  const handleDragStart = (e: React.DragEvent, appId: string) => {
    e.dataTransfer.setData('appId', appId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault() // necessary to allow drop
  }

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    const appId = e.dataTransfer.getData('appId')
    if (appId) {
      updateStatus(appId, newStatus)
    }
  }

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

  const columns = ['applied', 'shortlisted', 'selected', 'rejected']

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header & Back Button */}
      <div>
        <Link href="/company/opportunities" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-6 font-medium text-sm">
          <ArrowLeft size={16} /> Back to Postings
        </Link>
        
        <div className="premium-card p-8 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Briefcase className="w-48 h-48 text-blue-400" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-3 py-1 text-xs font-bold rounded-md ${opportunity.type === 'job' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                  {opportunity.type ? opportunity.type.toUpperCase() : 'JOB'}
                </span>
                <span className="flex items-center gap-1 text-sm text-slate-400 font-medium">
                  <Clock size={14} /> Posted {new Date(opportunity.created_at).toLocaleDateString()}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
                {opportunity.title}
              </h1>
              <p className="text-slate-400 max-w-3xl leading-relaxed">
                {opportunity.description}
              </p>
              
              <div className="mt-6">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Required AI Verified Skills</div>
                <div className="flex flex-wrap gap-2">
                  {(opportunity.required_skills || []).map((skill: string, i: number) => (
                    <span key={i} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold rounded-lg shadow-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-[#0a0a0a] border border-[rgba(255,255,255,0.05)] p-6 rounded-2xl min-w-[200px] text-center">
              <div className="text-sm font-bold text-slate-400 mb-1">Real Applicants</div>
              <div className="text-4xl font-black text-white">{applicants.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board Section */}
      <div>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="text-blue-400" /> Applicant Tracking (Kanban)
            </h2>
            <p className="text-slate-400 mt-1 text-sm">Drag and drop candidates across stages. Changes are saved automatically.</p>
          </div>
        </div>

        {applicants.length === 0 ? (
          <div className="premium-card rounded-3xl p-12 text-center flex flex-col items-center">
            <Users className="w-12 h-12 text-slate-500 mb-4" />
            <h3 className="text-xl font-bold text-slate-200 mb-2">No applications yet</h3>
            <p className="text-slate-400">When students apply to this role from the student portal, they will appear here with an AI match score.</p>
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
            {columns.map((columnStatus) => (
              <div 
                key={columnStatus}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, columnStatus)}
                className="flex-1 min-w-[320px] bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-4 flex flex-col h-[700px] snap-center"
              >
                <div className="flex items-center justify-between mb-4 px-2">
                  <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                    {columnStatus}
                  </h3>
                  <span className="text-xs font-bold text-slate-500 bg-[#0a0a0a] px-2 py-1 rounded-full">
                    {applicants.filter(a => a.status === columnStatus).length}
                  </span>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-700">
                  {applicants.filter(a => a.status === columnStatus).map((applicant) => (
                    <div 
                      key={applicant.id} 
                      draggable
                      onDragStart={(e) => handleDragStart(e, applicant.id)}
                      className="premium-card p-4 rounded-xl cursor-grab active:cursor-grabbing hover:border-blue-500/30 transition-all border border-[rgba(255,255,255,0.05)] group relative bg-[#0a0a0a]"
                    >
                      {/* Match Badge */}
                      <div className="absolute top-4 right-4">
                        <div className={`text-xs font-bold px-2 py-1 rounded-lg border flex flex-col items-center leading-none ${
                          applicant.matchScore >= 90 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          applicant.matchScore >= 70 ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          <span className="text-sm">{applicant.matchScore}</span>
                        </div>
                      </div>

                      <div className="pr-12">
                        <h4 className="text-base font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{applicant.name}</h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                          <Clock size={12} /> {new Date(applicant.appliedAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                            <CheckCircle2 size={10} className="text-emerald-400"/> Verified Hits
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {applicant.matchedSkills.length > 0 ? applicant.matchedSkills.map((s: string, i: number) => (
                              <span key={i} className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">{s}</span>
                            )) : <span className="text-[10px] text-slate-500">None</span>}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.05)] flex gap-2">
                        <Link 
                          href={`/company/students/${applicant.student_id}`}
                          className="flex-1 text-center py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold rounded-lg transition-colors"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
