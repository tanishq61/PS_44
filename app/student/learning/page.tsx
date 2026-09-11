'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { 
  BookOpen, 
  Sparkles, 
  Compass, 
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  PlayCircle,
  Check,
  Trophy,
  RotateCcw,
  PartyPopper
} from 'lucide-react'
import Link from 'next/link'

export default function StudentLearning() {
  const [learningPath, setLearningPath] = useState<any[]>([])
  const [recommendedCourses, setRecommendedCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [gaps, setGaps] = useState<string[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      setUserId(user.id)

      // Restore saved roadmap if available
      try {
        const savedPath = localStorage.getItem(`learning_path_${user.id}`)
        if (savedPath) {
          setLearningPath(JSON.parse(savedPath))
        }
        const savedProgress = localStorage.getItem(`learning_progress_${user.id}`)
        if (savedProgress) {
          setCompletedSteps(JSON.parse(savedProgress))
        }
      } catch (err) {
        console.error("Error restoring roadmap:", err)
      }

      // 1. Get latest assessment for gap analysis
      const { data: assessment } = await supabase
        .from('skill_assessments')
        .select('gap_analysis')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      let currentGaps: string[] = []
      if (assessment?.gap_analysis) {
        currentGaps = Array.from(new Set(Object.values(assessment.gap_analysis).flat() as string[]))
        setGaps(currentGaps)
      }

      // 2. Load industry courses/workshops that match gaps
      const { data: opps } = await supabase
        .from('opportunities')
        .select('*, profiles(org_name)')
        .in('type', ['course', 'workshop'])
        .order('created_at', { ascending: false })
      
      if (opps) {
        const matchedOpps = opps.filter(opp => {
          if (!opp.required_skills || currentGaps.length === 0) return true
          const reqStr = opp.required_skills.join(' ').toLowerCase()
          return currentGaps.some(gap => reqStr.includes(gap.toLowerCase()))
        })
        setRecommendedCourses(matchedOpps.length > 0 ? matchedOpps : opps)
      }
    }
    setLoading(false)
  }

  const handleGeneratePath = async () => {
    if (gaps.length === 0) {
      alert("Take the skill assessment first to generate a personalized learning path.")
      return
    }

    setGenerating(true)
    try {
      const res = await fetch('/api/learning/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gaps })
      })
      const data = await res.json()
      if (data && data.learning_path) {
        setLearningPath(data.learning_path)
        setCompletedSteps([])
        if (userId) {
          localStorage.setItem(`learning_path_${userId}`, JSON.stringify(data.learning_path))
          localStorage.setItem(`learning_progress_${userId}`, JSON.stringify([]))
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setGenerating(false)
    }
  }

  const toggleStep = (stepIndex: number) => {
    const updated = completedSteps.includes(stepIndex)
      ? completedSteps.filter(i => i !== stepIndex)
      : [...completedSteps, stepIndex]
    
    setCompletedSteps(updated)
    if (userId) {
      localStorage.setItem(`learning_progress_${userId}`, JSON.stringify(updated))
    }
  }

  const resetRoadmapProgress = () => {
    if (confirm("Reset your roadmap progress to start over?")) {
      setCompletedSteps([])
      if (userId) {
        localStorage.setItem(`learning_progress_${userId}`, JSON.stringify([]))
      }
    }
  }

  if (loading) return (
    <div className="flex h-[50vh] items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
    </div>
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 p-8 md:p-12 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Compass className="w-64 h-64 text-indigo-400" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-200 text-sm font-medium mb-6">
            <Sparkles size={14} /> AI-Powered Learning
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-white">
            Personalized Learning Path
          </h1>
          <p className="text-lg md:text-xl text-indigo-200 font-light max-w-2xl mb-8">
            Bridge your skill gaps with curated courses from industry partners and an AI-generated step-by-step learning roadmap.
          </p>
          
          <button 
            onClick={handleGeneratePath}
            disabled={generating || learningPath.length > 0}
            className="group relative inline-flex items-center gap-2 bg-indigo-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-600 transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] disabled:opacity-70 disabled:pointer-events-none overflow-hidden"
          >
            {generating ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Generating Roadmaps...</>
            ) : learningPath.length > 0 ? (
              <><CheckCircle2 size={20} /> Path Generated</>
            ) : (
              <>
                <span className="relative z-10">Generate My AI Roadmap</span>
                <Sparkles size={20} className="relative z-10" />
                <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              </>
            )}
          </button>
        </div>
      </div>

      {gaps.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
          <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
            <BookOpen size={20} />
          </div>
          <div>
            <h3 className="font-bold text-amber-900 mb-1">No Skill Gaps Found</h3>
            <p className="text-amber-700 text-sm mb-3">Take the AI skill assessment first to identify areas for improvement and generate a customized path.</p>
            <Link href="/student/assessment" className="text-sm font-bold text-amber-700 hover:text-amber-900 underline">Take Assessment Now</Link>
          </div>
        </div>
      )}

      {/* Generated Path */}
      {learningPath.length > 0 && (() => {
        const totalSteps = learningPath.length
        const completedCount = completedSteps.length
        const progressPercent = Math.round((completedCount / totalSteps) * 100)
        const isAllCompleted = completedCount === totalSteps && totalSteps > 0

        return (
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-200">
            {/* Header & Overall Progress */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                  <Compass className="text-indigo-600 w-7 h-7" /> Your Step-by-Step Roadmap
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Check off each milestone as you complete it to track your real-time learning progress.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Progress</div>
                  <div className="text-xl font-extrabold text-indigo-600">
                    {completedCount} / {totalSteps} <span className="text-sm font-semibold text-slate-500">({progressPercent}%)</span>
                  </div>
                </div>
                {completedCount > 0 && (
                  <button
                    onClick={resetRoadmapProgress}
                    title="Reset progress"
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                  >
                    <RotateCcw size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 mb-8">
              <div 
                className={`h-full transition-all duration-700 ease-out rounded-full shadow-sm ${
                  isAllCompleted 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                    : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Celebration Card when 100% Completed */}
            {isAllCompleted && (
              <div className="mb-8 p-6 md:p-8 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300 rounded-3xl animate-in zoom-in-95 duration-500 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
                <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-200">
                  <Trophy className="w-9 h-9" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold mb-1">
                    <PartyPopper size={14} /> Roadmap Completed!
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-emerald-950">
                    Congratulations! You finished your entire roadmap!
                  </h3>
                  <p className="text-emerald-800 text-sm mt-1 leading-relaxed">
                    You have mastered all the milestone steps to bridge your skill gaps. You are now prepared to retake the assessment or apply for industry opportunities.
                  </p>
                </div>
                <Link
                  href="/student/assessment"
                  className="px-6 py-3.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shrink-0 shadow-md shadow-emerald-300 hover:shadow-lg hover:-translate-y-0.5 text-sm"
                >
                  Verify via Re-assessment
                </Link>
              </div>
            )}

            {/* Steps Timeline */}
            <div className="relative border-l-2 border-indigo-100 ml-5 space-y-8 pb-4">
              {learningPath.map((step, index) => {
                const isCompleted = completedSteps.includes(index)

                return (
                  <div 
                    key={index} 
                    className="relative pl-8 animate-in slide-in-from-left-4 duration-500" 
                    style={{ animationDelay: `${index * 120}ms` }}
                  >
                    {/* Timeline Node Check Indicator */}
                    <button
                      type="button"
                      onClick={() => toggleStep(index)}
                      className={`
                        absolute -left-[15px] top-4 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer z-10 shadow-sm
                        ${isCompleted 
                          ? 'bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600 ring-4 ring-emerald-100' 
                          : 'bg-white border-slate-300 text-transparent hover:border-indigo-400 hover:ring-4 hover:ring-indigo-50'
                        }
                      `}
                    >
                      <Check size={16} className={`stroke-[3] ${isCompleted ? 'opacity-100' : 'opacity-0'}`} />
                    </button>
                    
                    {/* Card Container */}
                    <div 
                      onClick={() => toggleStep(index)}
                      className={`
                        p-6 md:p-7 rounded-2xl border-2 transition-all cursor-pointer select-none
                        ${isCompleted 
                          ? 'bg-emerald-50/40 border-emerald-200/80 shadow-sm' 
                          : 'bg-slate-50 border-slate-100 hover:border-indigo-200 hover:bg-white hover:shadow-md'
                        }
                      `}
                    >
                      <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <h3 className={`text-xl font-bold transition-colors ${isCompleted ? 'text-emerald-950 line-through decoration-emerald-500 decoration-2 opacity-80' : 'text-slate-800'}`}>
                            Step {index + 1}: {step.title}
                          </h3>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${
                            isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-700'
                          }`}>
                            {step.type}
                          </span>
                          <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md bg-slate-200 text-slate-700">
                            <Clock size={12} /> {step.duration}
                          </span>
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                            isCompleted ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-200/70 text-slate-500'
                          }`}>
                            {isCompleted ? 'Completed ✓' : 'Mark Done'}
                          </span>
                        </div>
                      </div>
                      
                      <p className={`leading-relaxed transition-colors ${isCompleted ? 'text-emerald-800/80' : 'text-slate-600'}`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}

      {/* Industry Courses */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
          <BookOpen className="text-indigo-600" /> Recommended Industry Programs
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {recommendedCourses.length === 0 ? (
            <div className="col-span-2 bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
              <PlayCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-700 mb-2">No active programs</h3>
              <p className="text-slate-500">There are currently no matching courses or workshops. Check back later!</p>
            </div>
          ) : (
            recommendedCourses.map(course => (
              <div key={course.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col group">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${course.type === 'course' ? 'bg-emerald-50 text-emerald-700' : 'bg-purple-50 text-purple-700'}`}>
                    {course.type.toUpperCase()}
                  </span>
                  <span className="text-sm font-semibold text-slate-500">{course.profiles?.org_name}</span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 mb-3">{course.title}</h3>
                <p className="text-slate-600 text-sm mb-6 line-clamp-3 flex-1">
                  {course.description}
                </p>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <div className="flex gap-2">
                    {course.required_skills?.slice(0, 2).map((skill: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase">
                        {skill}
                      </span>
                    ))}
                    {course.required_skills?.length > 2 && (
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded">
                        +{course.required_skills.length - 2}
                      </span>
                    )}
                  </div>
                  <button className="text-indigo-600 font-bold text-sm flex items-center gap-1 group-hover:text-indigo-800 transition-colors">
                    Enroll <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
