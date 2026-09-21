'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles, TrendingUp, Target, Award, BrainCircuit } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { createClient } from '@/lib/supabase'

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

export default function StudentDashboard() {
  const [userName, setUserName] = useState<string>('')
  const [assessment, setAssessment] = useState<any>(null)
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const name = user.user_metadata?.full_name || user.email?.split('@')[0] || ''
          setUserName(name ? name.charAt(0).toUpperCase() + name.slice(1) : '')

          const { data } = await supabase
            .from('skill_assessments')
            .select('*')
            .eq('student_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          if (data) {
            setAssessment(data)
          }

          const { data: opps } = await supabase.from('opportunities').select('*').in('type', ['job', 'internship'])
          if (opps) setOpportunities(opps)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadUserData()
  }, [])

  // AI Matching calculation
  const calculateMatchScore = (requiredSkills: string[], studentProfile: Record<string, number>) => {
    if (!requiredSkills || requiredSkills.length === 0) return 100
    if (!studentProfile) return 0

    let totalScore = 0
    let matchCount = 0

    requiredSkills.forEach(reqSkill => {
      const reqLower = reqSkill.toLowerCase()
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

    const rawAverage = totalScore / requiredSkills.length
    const coverageMultiplier = matchCount === requiredSkills.length ? 1.1 : 1.0
    return Math.min(100, Math.round(rawAverage * coverageMultiplier))
  }

  const allSkills = assessment?.skill_profile
    ? Object.entries(assessment.skill_profile).map(([name, score]) => ({
        name: cleanSkillName(name),
        score: Number(score)
      })).sort((a, b) => b.score - a.score)
    : []

  const skillsData = allSkills.slice(0, 5)
  const topSkill = allSkills.length > 0 ? allSkills[0] : null

  const profileCompletion = assessment ? 80 : 30

  // Count high match opportunities (> 70%)
  const highMatchCount = assessment && opportunities.length > 0
    ? opportunities.filter(opp => calculateMatchScore(opp.required_skills, assessment.skill_profile) >= 70).length
    : 0

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out z-10 relative">
      {/* Welcome Section */}
      <section className="relative overflow-hidden premium-card p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-10 p-8 opacity-20 pointer-events-none">
          <Sparkles className="w-48 h-48 text-indigo-400" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Profile Active
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
            Welcome back{userName ? `, ${userName}` : ''}
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-8 font-light">
            {assessment 
              ? 'Your skill profile is verified. Check your latest verified matches and growth roadmap.'
              : 'Complete your first AI skill assessment to unlock your personalized career roadmap and job matches.'
            }
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/student/opportunities" 
              className="premium-button-primary px-6 py-3"
            >
              View Matches <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <Link 
              href="/student/assessment" 
              className="premium-button-secondary px-6 py-3"
            >
              {assessment ? 'Take New Assessment' : 'Start Assessment'}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="premium-card p-6 flex flex-col justify-between transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="neumorphic-icon w-12 h-12 text-indigo-400 group-hover:text-indigo-300 transition-colors">
              <Target className="w-6 h-6" />
            </div>
            <span className="flex items-center text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md">
              <TrendingUp size={12} className="mr-1"/> {assessment ? '+15%' : 'Pending'}
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white mb-1">{profileCompletion}%</h3>
            <p className="text-sm font-medium text-slate-500">Profile Completion</p>
          </div>
        </div>
        
        <div className="premium-card p-6 flex flex-col justify-between transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="neumorphic-icon w-12 h-12 text-violet-400 group-hover:text-violet-300 transition-colors">
              <Award className="w-6 h-6" />
            </div>
            {topSkill && (
              <span className="flex items-center text-xs font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-1 rounded-md">
                {topSkill.score}% Match
              </span>
            )}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-1 truncate">
              {topSkill ? topSkill.name : 'Not Assessed'}
            </h3>
            <p className="text-sm font-medium text-slate-500">Top Verified Skill</p>
          </div>
        </div>

        <div className="premium-card p-6 flex flex-col justify-between transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="neumorphic-icon w-12 h-12 text-blue-400 group-hover:text-blue-300 transition-colors">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="flex items-center text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-md">
              <TrendingUp size={12} className="mr-1"/> AI Matched
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white mb-1">{assessment ? highMatchCount : opportunities.length || '0'}</h3>
            <p className="text-sm font-medium text-slate-500">Active Opportunities</p>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Skills Chart */}
        <div className="glass-panel p-8 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Your Top Skills</h2>
            <Link href="/student/profile" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
              View full profile →
            </Link>
          </div>
          <div className="flex-1 min-h-[250px] flex items-center justify-center">
            {skillsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={skillsData} layout="vertical" margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 500}} width={120} />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#0a0a0a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff'}} />
                  <Bar dataKey="score" fill="#6366f1" radius={[0, 100, 100, 0]} barSize={24}>
                    {skillsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#8b5cf6' : index === 1 ? '#6366f1' : index === 2 ? '#4f46e5' : '#4338ca'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center p-6 space-y-3">
                <div className="w-12 h-12 bg-[#121212] border border-[rgba(255,255,255,0.05)] rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <p className="text-sm text-slate-500 font-medium">No skill assessment taken yet.</p>
                <Link
                  href="/student/assessment"
                  className="inline-block text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-xl transition-all"
                >
                  Take Skill Assessment →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="glass-panel p-8">
          <h2 className="text-xl font-bold text-white mb-6">Recommended for You</h2>
          <div className="space-y-4">
            <Link href="/student/opportunities" className="block group premium-card p-5 cursor-pointer hover:border-indigo-500/30">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors">Explore Industry Internships</h3>
                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-1 rounded-full">Active</span>
              </div>
              <p className="text-sm text-slate-400 mb-4">Browse openings matched against your academic domain and skills.</p>
              <div className="flex flex-wrap gap-2">
                <span className="premium-badge bg-[#1a1a1a] border-[rgba(255,255,255,0.1)] text-slate-300">Software Engineering</span>
                <span className="premium-badge bg-[#1a1a1a] border-[rgba(255,255,255,0.1)] text-slate-300">Web Development</span>
              </div>
            </Link>

            <Link href="/student/assessment" className="block group premium-card p-5 cursor-pointer hover:border-violet-500/30">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-white group-hover:text-violet-400 transition-colors">Take AI Domain Assessment</h3>
                <span className="bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold px-2 py-1 rounded-full">Analysis</span>
              </div>
              <p className="text-sm text-slate-400">Benchmark your technical capabilities, find skill gaps, and get personalized recommendations.</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
