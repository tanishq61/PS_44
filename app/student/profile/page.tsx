'use client'

import { Suspense, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { BookOpen, AlertCircle, FileText, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

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

function ProfileContent() {
  const [assessment, setAssessment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const searchParams = useSearchParams()
  const assessmentId = searchParams.get('assessmentId')

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        let assessmentData: any = null
        if (assessmentId) {
          const res = await supabase
            .from('skill_assessments')
            .select('*')
            .eq('student_id', user.id)
            .eq('id', assessmentId)
            .single()
          assessmentData = res.data
        } else {
          const res = await supabase
            .from('skill_assessments')
            .select('*')
            .eq('student_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
          assessmentData = res.data
        }
        
        if (assessmentData) {
          setAssessment(assessmentData)
        } else {
          setAssessment(null)
        }
      } else {
        setAssessment(null)
      }
      setLoading(false)
    }
    loadProfile()
  }, [assessmentId])

  if (loading) return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  )

  if (!assessment) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] max-w-2xl mx-auto text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
          <BookOpen className="w-12 h-12 text-indigo-400" />
        </div>
        <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Your Skill Profile</h1>
        <p className="text-lg text-slate-500">You haven't taken the AI skill assessment yet. Take the assessment to unlock your profile, discover your skill gaps, and get matched with opportunities.</p>
        <Link 
          href="/student/assessment"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] hover:-translate-y-1 mt-4"
        >
          Take Assessment Now <ArrowRight size={20} />
        </Link>
      </div>
    )
  }

  const chartData = Object.entries(assessment.skill_profile).map(([name, score]) => ({
    name: cleanSkillName(name),
    score
  })).sort((a: any, b: any) => b.score - a.score)

  // Dynamic Gap Analysis based on the actual lowest scores in the assessment
  const lowestSkills = [...chartData].reverse().slice(0, 3);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out z-10 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 glass-panel p-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            Skill Profile <Sparkles className="text-indigo-400 w-6 h-6" />
          </h1>
          <p className="text-slate-400 mt-1">Your AI-analyzed skill breakdown and gap analysis.</p>
        </div>
        <Link 
          href="/student/opportunities"
          className="premium-button-primary px-6 py-3"
        >
          View Matched Jobs <ArrowRight className="ml-2 w-4 h-4" />
        </Link>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Assessed Skills Chart */}
        <div className="lg:col-span-3 glass-panel p-8 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="text-indigo-400 h-6 w-6" />
              Verified Skills
            </h2>
            {chartData.length > 0 && (
              <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20">
                Top Skill: {chartData[0].name} ({String(chartData[0].score)}%)
              </div>
            )}
          </div>
          <div className="flex-1 min-h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" width={160} tickLine={false} axisLine={false} tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 500}} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#121212', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff'}} />
                <Bar dataKey="score" radius={[0, 8, 8, 0] as any} barSize={28} background={{ fill: 'rgba(255,255,255,0.02)', radius: [0, 8, 8, 0] as any }}>
                  {
                    chartData.map((entry: any, index) => (
                      <Cell key={`cell-${index}`} fill={entry.score > 80 ? '#10b981' : entry.score > 60 ? '#6366f1' : '#f59e0b'} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gap Analysis */}
        <div className="lg:col-span-2 space-y-6">
          <div className="premium-card p-8 text-white relative overflow-hidden h-full flex flex-col">
            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
              <AlertCircle className="w-32 h-32 text-indigo-400" />
            </div>
            <div className="relative z-10 flex-1 flex flex-col">
              <h2 className="text-2xl font-bold mb-2">Skill Gaps & Learning</h2>
              <p className="text-indigo-200 text-sm mb-6 font-light">Based on your assessment, these are the key areas you should focus on to improve your industry readiness.</p>
              
              <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-[rgba(255,255,255,0.05)] rounded-2xl p-5 mb-6 flex-1">
                <h3 className="font-bold text-lg mb-4 text-white">Identified Gaps</h3>
                <ul className="space-y-4">
                  {lowestSkills.length > 0 ? lowestSkills.map((skill: any, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                      <div className="min-w-2 min-h-2 mt-1.5 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                      <div>
                        <span className="font-semibold text-white block mb-0.5">{skill.name}</span>
                        <p className="text-slate-400 text-xs">Current Score: <span className="text-amber-400 font-medium">{skill.score}%</span> — Needs improvement</p>
                      </div>
                    </li>
                  )) : (
                    <li className="flex items-center gap-2 text-sm text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" /> Highly compatible, no major gaps identified.
                    </li>
                  )}
                </ul>
              </div>
              
              {lowestSkills.length > 0 && (
                <Link href="/student/learning" className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-bold text-white transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] flex justify-center items-center gap-2">
                  <Sparkles size={18} /> Generate Personalized Learning Path
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex h-[50vh] items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  )
}
