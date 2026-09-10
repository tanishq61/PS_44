'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles, TrendingUp, Target, Award, BrainCircuit } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { createClient } from '@/lib/supabase'

export default function StudentDashboard() {
  const [userName, setUserName] = useState<string>('')
  const [assessment, setAssessment] = useState<any>(null)
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
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadUserData()
  }, [])

  const allSkills = assessment?.skill_profile
    ? Object.entries(assessment.skill_profile).map(([name, score]) => ({
        name,
        score: Number(score)
      })).sort((a, b) => b.score - a.score)
    : []

  const skillsData = allSkills.slice(0, 5)
  const topSkill = allSkills.length > 0 ? allSkills[0] : null

  const profileCompletion = assessment ? 85 : 30

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {/* Welcome Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-blue-900 to-emerald-900 p-8 md:p-12 text-white shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
          <Sparkles className="w-48 h-48 text-emerald-300" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Welcome back{userName ? `, ${userName}` : ''}!
          </h1>
          <p className="text-lg md:text-xl text-indigo-100 mb-8 font-light">
            {assessment 
              ? 'Your skill profile is verified. Check your latest verified matches and growth roadmap.'
              : 'Complete your first AI skill assessment to unlock your personalized career roadmap and job matches.'
            }
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/student/opportunities" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:-translate-y-0.5"
            >
              View Matches <ArrowRight size={18} />
            </Link>
            <Link 
              href="/student/assessment" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-medium transition-all duration-300"
            >
              {assessment ? 'Take New Assessment' : 'Start Assessment'}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-start gap-4 transition-all hover:shadow-md">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Profile Completion</p>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-bold text-slate-800">{profileCompletion}%</h3>
              <span className="text-xs font-medium text-emerald-600 mb-1 flex items-center">
                <TrendingUp size={12} className="mr-1"/> {assessment ? '+15%' : 'Pending Assessment'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-start gap-4 transition-all hover:shadow-md">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Top Skill</p>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-bold text-slate-800">
                {topSkill ? topSkill.name : 'Not Assessed'}
              </h3>
              {topSkill && (
                <span className="text-xs font-medium text-slate-400 mb-1">{topSkill.score}%</span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-start gap-4 transition-all hover:shadow-md">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Opportunities</p>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-bold text-slate-800">{assessment ? '8' : 'Available'}</h3>
              <span className="text-xs font-medium text-emerald-600 mb-1 flex items-center">
                <TrendingUp size={12} className="mr-1"/> {assessment ? 'AI Matched' : 'Explore all'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Skills Chart */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Your Top Skills</h2>
            <Link href="/student/profile" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
              View full profile →
            </Link>
          </div>
          <div className="flex-1 min-h-[250px] flex items-center justify-center">
            {skillsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={skillsData} layout="vertical" margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 500}} width={120} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)'}} />
                  <Bar dataKey="score" fill="#6366f1" radius={[0, 100, 100, 0]} barSize={24}>
                    {skillsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : index === 1 ? '#3b82f6' : index === 2 ? '#6366f1' : '#8b5cf6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center p-6 space-y-3">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto text-indigo-600">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <p className="text-sm text-slate-500 font-medium">No skill assessment taken yet.</p>
                <Link
                  href="/student/assessment"
                  className="inline-block text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-all"
                >
                  Take Skill Assessment →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="bg-gradient-to-b from-slate-50 to-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Recommended for You</h2>
          <div className="space-y-4">
            <Link href="/student/opportunities" className="block group bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">Explore Industry Internships</h3>
                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">Active</span>
              </div>
              <p className="text-sm text-slate-500 mb-3">Browse openings matched against your academic domain and skills.</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">Software Engineering</span>
                <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">Web Development</span>
              </div>
            </Link>

            <Link href="/student/assessment" className="block group bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">Take AI Domain Assessment</h3>
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">Skill Analysis</span>
              </div>
              <p className="text-sm text-slate-500">Benchmark your technical capabilities, find skill gaps, and get personalized recommendations.</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
