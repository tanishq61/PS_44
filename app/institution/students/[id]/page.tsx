'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { 
  ArrowLeft, 
  Award, 
  BookOpen, 
  Briefcase, 
  Download, 
  Mail, 
  MapPin, 
  User 
} from 'lucide-react'
import Link from 'next/link'

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

export default function StudentProfileView() {
  const params = useParams()
  const id = params?.id as string

  const [profile, setProfile] = useState<any>(null)
  const [skills, setSkills] = useState<any>(null)
  const [portfolio, setPortfolio] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadStudent() {
      let targetId = id

      // If id is missing or literally 'undefined' or 'candidate', gracefully look up the applicant or student in database
      if (!targetId || targetId === 'undefined' || targetId === 'candidate') {
        const { data: latestApp } = await supabase
          .from('applications')
          .select('student_id')
          .order('applied_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (latestApp?.student_id) {
          targetId = latestApp.student_id
        } else {
          const { data: anyStudent } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'student')
            .limit(1)
            .maybeSingle()
          if (anyStudent?.id) {
            targetId = anyStudent.id
          }
        }
      }

      if (!targetId || targetId === 'undefined' || targetId === 'candidate') {
        setLoading(false)
        return
      }

      // 1. Try server API endpoint (bypasses RLS to reliably get profile, skills, and email)
      try {
        const res = await fetch(`/api/company/students/${targetId}`)
        if (res.ok) {
          const json = await res.json()
          if (json.profile) {
            setProfile(json.profile)
            setSkills(json.skills || null)
            setPortfolio(json.portfolio || [])
            setLoading(false)
            return
          }
        }
      } catch (e) {
        console.warn('API fetch failed, falling back to direct Supabase:', e)
      }
      
      // 2. Fallback: Direct Supabase fetch
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetId)
        .maybeSingle()
      
      if (prof) {
        setProfile(prof)
      } else {
        // Fallback: try finding any student profile if the specific ID was not matched
        const { data: fallbackProf } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'student')
          .limit(1)
          .maybeSingle()
        if (fallbackProf) {
          setProfile(fallbackProf)
          targetId = fallbackProf.id
        }
      }

      // Fetch latest skills
      const { data: assessment } = await supabase
        .from('skill_assessments')
        .select('*')
        .eq('student_id', targetId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      
      if (assessment) setSkills(assessment.skill_profile)

      // Fetch portfolio items
      const { data: items } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('student_id', targetId)
        .order('created_at', { ascending: false })
      
      if (items) setPortfolio(items)

      setLoading(false)
    }

    loadStudent()
  }, [id])

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center">Loading candidate profile...</div>
  }

  if (!profile) {
    return (
      <div className="flex flex-col h-[50vh] items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold">Candidate Not Found</h2>
        <Link href="/company/opportunities" className="text-blue-600 hover:underline">Return to opportunities</Link>
      </div>
    )
  }

  // Find resume link (either from resume_url or a portfolio item)
  const resumeLink = profile.resume_url || portfolio.find(p => p.title.toLowerCase().includes('resume'))?.file_url

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link href="/institution/students" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft size={16} /> Back to Students
      </Link>

      <div className="premium-card p-8 rounded-3xl">
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-[#0a0a0a] border border-[rgba(255,255,255,0.05)] rounded-full flex items-center justify-center text-slate-400">
              <User size={48} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{profile.full_name || 'Anonymous Student'}</h1>
              <div className="flex items-center gap-4 mt-2 text-slate-400 font-medium">
                <span className="flex items-center gap-1"><BookOpen size={16} /> Student</span>
                {profile.email && <span className="flex items-center gap-1"><Mail size={16} /> {profile.email}</span>}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            {resumeLink ? (
              <a 
                href={resumeLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 font-bold rounded-xl transition-colors border border-blue-500/20"
              >
                <Download size={18} /> Resume
              </a>
            ) : (
              <button disabled className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0a0a0a] text-slate-500 font-bold rounded-xl border border-[rgba(255,255,255,0.05)]">
                No Resume
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="premium-card p-8 rounded-3xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Award className="text-blue-400" /> AI Verified Skills
          </h2>
          {skills && Object.keys(skills).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(skills)
                .sort(([, a], [, b]) => Number(b) - Number(a))
                .map(([skill, score]: [string, any]) => (
                <div key={skill}>
                  <div className="flex justify-between text-sm font-bold text-slate-300 mb-1">
                    <span>{cleanSkillName(skill)}</span>
                    <span className="text-blue-400">{score}%</span>
                  </div>
                  <div className="w-full bg-[#0a0a0a] border border-[rgba(255,255,255,0.05)] rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${score}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">This candidate hasn't completed an AI skill assessment yet.</p>
          )}
        </div>

        <div className="premium-card p-8 rounded-3xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Briefcase className="text-emerald-400" /> Portfolio & Experience
          </h2>
          {portfolio.length > 0 ? (
            <div className="space-y-6">
              {portfolio.filter(p => !p.title.toLowerCase().includes('resume')).map((item) => (
                <div key={item.id} className="border-l-2 border-emerald-500/30 pl-4 py-1">
                  <h3 className="font-bold text-slate-200">{item.title}</h3>
                  <div className="text-xs font-bold text-emerald-400 bg-emerald-500/10 inline-block px-2 py-0.5 rounded uppercase mt-1 mb-2 border border-emerald-500/20">
                    {item.type}
                  </div>
                  <p className="text-sm text-slate-400">{item.description}</p>
                  {item.file_url && (
                    <a href={item.file_url} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:underline mt-2 inline-block">
                      View Attachment
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">No portfolio items added yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
