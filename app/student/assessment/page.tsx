'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BrainCircuit, Sparkles, ArrowRight, CheckCircle2, Loader2, ArrowLeft, Check, History, Video, AlertTriangle } from 'lucide-react'

type Question = {
  question: string;
  type: string;
  options?: string[];
  skill_tag: string;
}

function ProctoringWidget({ onCameraReady, onCameraError }: { onCameraReady: () => void, onCameraError: (err: boolean) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        onCameraReady()
      } catch (err) {
        setHasError(true)
        onCameraError(true)
      }
    }
    startCamera()

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="relative p-[2px] bg-gradient-to-r from-rose-500/50 to-indigo-500/50 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(244,63,94,0.15)]">
        <div className="bg-[#0a0a0a] rounded-xl overflow-hidden border border-[rgba(255,255,255,0.05)] w-48 md:w-56">
          <div className="bg-[#111] px-3 py-2 flex items-center justify-between border-b border-[rgba(255,255,255,0.05)]">
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              AI Proctoring
            </span>
            <Video size={14} className="text-slate-500" />
          </div>
          {hasError ? (
            <div className="h-32 flex flex-col items-center justify-center bg-slate-900/50 p-4 text-center">
              <AlertTriangle size={24} className="text-amber-500 mb-2" />
              <p className="text-xs text-slate-400 font-medium">Camera access required for AI verification</p>
            </div>
          ) : (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-32 md:h-36 object-cover transform -scale-x-100" // Mirrors the camera
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-[rgba(255,255,255,0.1)] rounded-b-xl pointer-events-none" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AssessmentPage() {
  const [cameraError, setCameraError] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [showHistory, setShowHistory] = useState(true)
  const [loading, setLoading] = useState(false)
  const [loadingStage, setLoadingStage] = useState('')
  const [fetchingHistory, setFetchingHistory] = useState(true)
  const [field, setField] = useState('Software Engineering')
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitStage, setSubmitStage] = useState('')
  const [currentStep, setCurrentStep] = useState(0) // For paginated questions
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadHistory() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('skill_assessments')
          .select('*')
          .eq('student_id', user.id)
          .order('created_at', { ascending: false })

        if (data && data.length > 0) {
          setHistory(data)
          setShowHistory(true)
        } else {
          setShowHistory(false)
        }
      } else {
        setShowHistory(false)
      }
      setFetchingHistory(false)
    }
    loadHistory()
  }, [])

  const startAssessment = async () => {
    if (!field.trim()) return;
    setLoading(true)
    setLoadingStage('Analyzing skill domain...')

    const stageTimer1 = setTimeout(() => setLoadingStage('Generating practical MCQs...'), 1200)
    const stageTimer2 = setTimeout(() => setLoadingStage('Formulating scenario question...'), 2800)

    try {
      const res = await fetch('/api/assessment/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field })
      })
      const data = await res.json()
      if (data && data.length > 0) {
        setQuestions(data)
      } else {
        setQuestions([
          { question: "What is the primary difference between let and var in JavaScript?", type: "MCQ", options: ["Scope", "Hoisting", "Both Scope and Hoisting", "None"], skill_tag: "Software Engineering" },
          { question: "Which data structure uses LIFO (Last In First Out)?", type: "MCQ", options: ["Queue", "Stack", "Tree", "Graph"], skill_tag: "Data Structures" },
          { question: "What does the 'S' in SOLID principles stand for?", type: "MCQ", options: ["Single Responsibility", "Static Typing", "Synchronous Processing", "Scalability"], skill_tag: "Software Engineering" },
          { question: "Which command records changes to a local Git repository?", type: "MCQ", options: ["git commit", "git push", "git fetch", "git rebase"], skill_tag: "Version Control" },
          { question: "Which of the following is a document-based NoSQL database?", type: "MCQ", options: ["MongoDB", "PostgreSQL", "MySQL", "SQLite"], skill_tag: "Database Management" },
          { question: "When multiple threads access shared resources concurrently without locks, what issue can occur?", type: "MCQ", options: ["Race condition", "Deadlock only", "Memory leak only", "Stack overflow"], skill_tag: "Computer Science Fundamentals" },
          { question: "Which Agile meeting is held at the end of a sprint to reflect and improve?", type: "MCQ", options: ["Sprint Retrospective", "Daily Standup", "Sprint Planning", "Backlog Refinement"], skill_tag: "Team Collaboration" },
          { question: "Describe how you approach learning an unfamiliar technology stack under tight project deadlines.", type: "short-answer", skill_tag: "Adaptability" }
        ])
      }
    } catch (e) {
      console.error(e)
      setQuestions([
        { question: "What is the primary difference between let and var in JavaScript?", type: "MCQ", options: ["Scope", "Hoisting", "Both Scope and Hoisting", "None"], skill_tag: "Software Engineering" },
        { question: "Which data structure uses LIFO (Last In First Out)?", type: "MCQ", options: ["Queue", "Stack", "Tree", "Graph"], skill_tag: "Data Structures" },
        { question: "What does the 'S' in SOLID principles stand for?", type: "MCQ", options: ["Single Responsibility", "Static Typing", "Synchronous Processing", "Scalability"], skill_tag: "Software Engineering" },
        { question: "Which command records changes to a local Git repository?", type: "MCQ", options: ["git commit", "git push", "git fetch", "git rebase"], skill_tag: "Version Control" },
        { question: "Which of the following is a document-based NoSQL database?", type: "MCQ", options: ["MongoDB", "PostgreSQL", "MySQL", "SQLite"], skill_tag: "Database Management" },
        { question: "When multiple threads access shared resources concurrently without locks, what issue can occur?", type: "MCQ", options: ["Race condition", "Deadlock only", "Memory leak only", "Stack overflow"], skill_tag: "Computer Science Fundamentals" },
        { question: "Which Agile meeting is held at the end of a sprint to reflect and improve?", type: "MCQ", options: ["Sprint Retrospective", "Daily Standup", "Sprint Planning", "Backlog Refinement"], skill_tag: "Team Collaboration" },
        { question: "Describe how you approach learning an unfamiliar technology stack under tight project deadlines.", type: "short-answer", skill_tag: "Adaptability" }
      ])
    } finally {
      clearTimeout(stageTimer1)
      clearTimeout(stageTimer2)
      setLoading(false)
      setLoadingStage('')
      setCurrentStep(0)
    }
  }

  const submitAssessment = async () => {
    setSubmitting(true)
    setSubmitStage('Evaluating answers...')
    const timer = setTimeout(() => setSubmitStage('Mapping 8 core skill competencies...'), 1500)

    const qaPairs = questions.map((q, i) => ({
      question: q.question,
      answer: answers[i] || '',
      skill_tag: q.skill_tag
    }))

    try {
      const res = await fetch('/api/assessment/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qaPairs })
      })
      const result = await res.json()

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('skill_assessments').insert({
          student_id: user.id,
          responses: qaPairs,
          skill_profile: result.skill_profile,
          gap_analysis: result.gap_analysis
        })
      }

      router.push('/student/profile')
    } catch (e) {
      console.error(e)
      setSubmitting(false)
      router.push('/student/profile')
    } finally {
      clearTimeout(timer)
    }
  }

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      submitAssessment()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const progress = questions.length > 0 ? ((currentStep) / questions.length) * 100 : 0

  if (fetchingHistory) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>
  }

  if (showHistory) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-500 z-10 relative">
        <div className="flex justify-between items-center glass-panel p-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <History className="text-indigo-400" /> Assessment History
            </h1>
            <p className="text-slate-400 mt-1">Review your past skill assessments and generate a new one.</p>
          </div>
          <button
            onClick={() => setShowHistory(false)}
            className="premium-button-primary px-6 py-3"
          >
            <Sparkles size={18} className="mr-2" /> Take New Assessment
          </button>
        </div>

        <div className="grid gap-4">
          {history.map((hist, index) => (
            <div key={hist.id} className="premium-card p-6 flex justify-between items-center group">
              <div>
                <h3 className="font-bold text-white text-lg">Assessment #{history.length - index}</h3>
                <p className="text-sm text-slate-400">{new Date(hist.created_at).toLocaleDateString()} at {new Date(hist.created_at).toLocaleTimeString()}</p>
              </div>
              <Link
                href={`/student/profile?assessmentId=${hist.id}`}
                className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
              >
                View Profile →
              </Link>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center animate-in fade-in zoom-in-95 duration-700 z-10 relative">
        <div className="max-w-xl w-full premium-card p-8 md:p-12 text-center relative overflow-hidden">
          {history.length > 0 && (
            <button
              onClick={() => setShowHistory(true)}
              className="absolute top-6 left-6 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <BrainCircuit className="w-48 h-48 text-indigo-400" />
          </div>

          <div className="relative z-10">
            <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Sparkles className="w-10 h-10 text-indigo-400" />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white tracking-tight">AI Skill Assessment</h1>
            <p className="text-slate-400 mb-10 text-lg leading-relaxed">
              Enter your target domain. Our AI will generate a personalized assessment to evaluate your skills, map your profile, and find your perfect opportunities.
            </p>

            <div className="space-y-6 max-w-md mx-auto text-left">
              <div>
                <label className="text-sm font-bold text-slate-300 mb-2 block">Target Domain / Field of Study</label>
                <input
                  type="text"
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                  placeholder="e.g. Software Engineering, UX Design..."
                  className="w-full px-5 py-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-[rgba(255,255,255,0.05)] transition-all text-white font-medium"
                  onKeyDown={(e) => e.key === 'Enter' && startAssessment()}
                />
              </div>

              <button
                onClick={startAssessment}
                disabled={loading || !field.trim()}
                className="w-full group relative flex items-center justify-center gap-2 premium-button-primary py-4 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <span className="flex items-center gap-2.5 animate-pulse text-indigo-100 font-semibold">
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    {loadingStage || 'Generating Assessment...'}
                  </span>
                ) : (
                  <>
                    <span className="relative z-10">Start Assessment</span>
                    <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform ml-1" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const q = questions[currentStep]
  const hasOptions = Boolean(q?.options && q.options.length > 0)
  const isMultiSelect = Boolean(
    hasOptions && (
      (q.type && q.type.toUpperCase().includes('MULTI') && !q.type.toUpperCase().includes('MCQ')) ||
      (q.type && q.type.toUpperCase().includes('CHECKBOX')) ||
      (q.question && q.question.toLowerCase().includes('select all')) ||
      (q.question && q.question.toLowerCase().includes('which of the following are'))
    )
  )

  const handleSelectOption = (opt: string) => {
    if (isMultiSelect) {
      const current = answers[currentStep] ? answers[currentStep].split(', ').filter(Boolean) : []
      const next = current.includes(opt)
        ? current.filter(x => x !== opt)
        : [...current, opt]
      setAnswers(prev => ({ ...prev, [currentStep]: next.join(', ') }))
    } else {
      setAnswers(prev => ({ ...prev, [currentStep]: opt }))
    }
  }

  const isAnswered = Boolean(answers[currentStep] && answers[currentStep].trim().length > 0)
  const isLastQuestion = currentStep === questions.length - 1

  return (
    <div className="max-w-3xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-8 duration-500 z-10 relative">

      {/* AI PROCTORING WIDGET */}
      <ProctoringWidget onCameraError={setCameraError} onCameraReady={() => setCameraReady(true)} />

      {/* CAMERA WAITING OVERLAY */}
      {!cameraReady && !cameraError && (
        <div className="fixed inset-0 z-[100] bg-[#030303]/90 backdrop-blur-md flex items-center justify-center">
          <div className="premium-card p-8 max-w-sm text-center">
            <Video className="w-16 h-16 text-indigo-500 mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-bold text-white mb-2">Waiting for Camera</h3>
            <p className="text-slate-400 mb-6 text-sm">Please allow camera access in your browser prompt to begin the AI verified assessment.</p>
          </div>
        </div>
      )}

      {/* CAMERA ERROR OVERLAY */}
      {cameraError && (
        <div className="fixed inset-0 z-[100] bg-[#030303]/90 backdrop-blur-md flex items-center justify-center">
          <div className="premium-card p-8 max-w-sm text-center border-rose-500/30">
            <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto mb-4 animate-bounce" />
            <h3 className="text-xl font-bold text-white mb-2">Proctoring Error</h3>
            <p className="text-slate-400 mb-6 text-sm">Camera access is required to take this AI verified assessment. Please allow camera permissions in your browser and refresh the page.</p>
            <button onClick={() => window.location.reload()} className="premium-button-primary px-6 py-3 w-full">
              Refresh Page
            </button>
          </div>
        </div>
      )}

      {/* Header & Progress */}
      <div className="mb-10">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Domain Assessment</h1>
            <p className="text-indigo-400 font-semibold">{field}</p>
          </div>
          <div className="text-slate-300 font-medium bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] px-4 py-2 rounded-xl text-sm">
            Question <span className="font-bold text-white">{currentStep + 1}</span> of {questions.length}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-[#1a1a1a] rounded-full overflow-hidden p-0.5 border border-[rgba(255,255,255,0.05)]">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500 ease-out rounded-full shadow-sm"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="premium-card p-8 md:p-12 mb-8 min-h-[420px] flex flex-col relative overflow-hidden">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-6">
          <span className="px-3.5 py-1.5 bg-indigo-500/10 text-indigo-400 font-bold text-xs rounded-xl border border-indigo-500/20">
            {q.skill_tag}
          </span>
          <span className="px-3 py-1 bg-[rgba(255,255,255,0.05)] text-slate-300 font-medium text-xs rounded-xl border border-[rgba(255,255,255,0.05)]">
            {hasOptions
              ? (isMultiSelect ? 'Multiple Select (Select all that apply)' : 'Multiple Choice')
              : 'Written Response'
            }
          </span>
        </div>

        <h2 className="text-xl md:text-2xl font-bold text-white mb-8 leading-relaxed">
          {q.question}
        </h2>

        <div className="flex-1">
          {hasOptions && q.options ? (
            <div className="space-y-3.5">
              {q.options.map((opt, optIndex) => {
                const isSelected = isMultiSelect
                  ? (answers[currentStep]?.split(', ').includes(opt) ?? false)
                  : answers[currentStep] === opt

                const optionLetter = String.fromCharCode(65 + optIndex)

                return (
                  <button
                    key={optIndex}
                    type="button"
                    onClick={() => handleSelectOption(opt)}
                    className={`
                      w-full group flex items-center p-4 md:p-5 rounded-2xl border cursor-pointer transition-all duration-200 text-left relative
                      ${isSelected
                        ? 'border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.1)] ring-1 ring-indigo-500/30'
                        : 'border-[rgba(255,255,255,0.1)] hover:border-indigo-400/50 hover:bg-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)]'
                      }
                    `}
                  >
                    {/* Option Letter Badge */}
                    <div className={`
                      w-8 h-8 rounded-xl font-bold text-sm flex items-center justify-center mr-4 transition-all shrink-0
                      ${isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-[rgba(255,255,255,0.1)] text-slate-300 group-hover:bg-indigo-500/20 group-hover:text-indigo-300'
                      }
                    `}>
                      {optionLetter}
                    </div>

                    {/* Option Text */}
                    <span className={`text-base md:text-lg flex-1 transition-colors ${isSelected ? 'font-semibold text-white' : 'text-slate-300 group-hover:text-white'}`}>
                      {opt}
                    </span>

                    {/* Indicator Circle/Checkbox */}
                    <div className={`
                      w-6 h-6 ${isMultiSelect ? 'rounded-lg' : 'rounded-full'} border flex items-center justify-center ml-4 transition-all shrink-0
                      ${isSelected ? 'border-indigo-500 bg-indigo-600 text-white' : 'border-[rgba(255,255,255,0.2)] bg-transparent group-hover:border-indigo-400'}
                    `}>
                      {isSelected && (
                        isMultiSelect
                          ? <Check size={14} className="stroke-[3]" />
                          : <div className="w-2.5 h-2.5 bg-white rounded-full" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="h-full">
              <textarea
                rows={8}
                placeholder="Type your detailed answer here. Focus on clarity and technical accuracy..."
                className="w-full h-full p-6 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:bg-[rgba(255,255,255,0.05)] focus:outline-none transition-all text-white text-lg resize-none placeholder:text-slate-600"
                value={answers[currentStep] || ''}
                onChange={(e) => setAnswers({ ...answers, [currentStep]: e.target.value })}
              />
            </div>
          )}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0 || submitting}
          className="flex items-center gap-2 px-6 py-4 text-slate-400 font-bold hover:text-white transition-colors disabled:opacity-0"
        >
          <ArrowLeft size={20} /> Previous
        </button>

        <button
          onClick={handleNext}
          disabled={!isAnswered || submitting}
          className={`
            flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all shadow-md
            ${!isAnswered
              ? 'bg-[rgba(255,255,255,0.05)] text-slate-500 cursor-not-allowed shadow-none'
              : isLastQuestion
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:-translate-y-0.5'
                : 'premium-button-primary'
            }
          `}
        >
          {submitting ? (
            <span className="flex items-center gap-2 animate-pulse">
              <Loader2 className="w-5 h-5 animate-spin" /> {submitStage || 'Processing AI Score...'}
            </span>
          ) : isLastQuestion ? (
            <><CheckCircle2 size={20} /> Complete Assessment</>
          ) : (
            <>Next Question <ArrowRight size={20} /></>
          )}
        </button>
      </div>
    </div>
  )
}
