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
        const facultyApplicants = apps.map((app: any) => {
          return {
            id: app.id,
            student_id: app.student_id,
            name: app.profiles?.full_name || 'Anonymous Faculty',
            status: app.status,
            appliedAt: app.applied_at
          }
        })
        setApplicants(facultyApplicants)
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
        <Link href="/institution/opportunities" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-400 transition-colors mb-6 font-medium text-sm">
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

        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="text-emerald-400" /> Faculty Applicants
            </h2>
            <p className="text-slate-400 mt-1 text-sm">Academicians who have applied to this opportunity.</p>
          </div>
        </div>

        <div className="grid gap-6">
          {applicants.length === 0 ? (
             <div className="premium-card rounded-3xl p-12 text-center flex flex-col items-center">
               <Users className="w-12 h-12 text-slate-500 mb-4" />
               <h3 className="text-xl font-bold text-slate-200 mb-2">No applications yet</h3>
               <p className="text-slate-400">When academicians apply to this role from the faculty portal, they will appear here.</p>
             </div>
          ) : applicants.map((applicant) => (
            <div key={applicant.id} className="premium-card p-6 rounded-3xl flex flex-col md:flex-row gap-6 md:items-center">
              
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center flex-shrink-0">
                <Users size={28} />
              </div>

              {/* Applicant Info */}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-white">{applicant.name}</h3>
                    <p className="text-slate-400 text-sm font-medium flex items-center gap-1">
                      Applied {new Date(applicant.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                    applicant.status === 'shortlisted' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-800 border-[rgba(255,255,255,0.05)] text-slate-400'
                  }`}>
                    {applicant.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-row md:flex-col gap-2 border-t md:border-t-0 md:border-l border-[rgba(255,255,255,0.05)] pt-4 md:pt-0 md:pl-6">
                <Link 
                  href={`/institution/academicians/${applicant.student_id || 'candidate'}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-colors"
                >
                  View Profile
                </Link>
                <button 
                  onClick={() => alert(`Contact feature for ${applicant.name} is coming soon!`)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#0a0a0a] hover:bg-[#111] text-slate-300 border border-[rgba(255,255,255,0.05)] text-sm font-bold rounded-xl transition-colors"
                >
                  <Mail size={16} /> Contact
                </button>
              </div>
            </div>
          ))}
        </div>
    </div>
  )
}
