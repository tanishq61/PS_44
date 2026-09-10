'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { BrainCircuit, Sparkles, ArrowRight, CheckCircle2, Loader2, ArrowLeft, Check } from 'lucide-react'

type Question = {
  question: string;
  type: string;
  options?: string[];
  skill_tag: string;
}

export default function AssessmentPage() {
  const [loading, setLoading] = useState(false)
  const [field, setField] = useState('Software Engineering')
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(0) // For paginated questions
  const router = useRouter()
  const supabase = createClient()

  const startAssessment = async () => {
    if (!field.trim()) return;
    setLoading(true)
    try {
      const res = await fetch('/api/assessment/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field })
      })
      const data = await res.json()
      // Optional: mock questions if API fails or returns empty, for UI demonstration
      if (data && data.length > 0) {
        setQuestions(data)
      } else {
        setQuestions([
          { question: "What is the primary difference between let and var in JavaScript?", type: "MCQ", options: ["Scope", "Hoisting", "Both Scope and Hoisting", "None"], skill_tag: "JavaScript" },
          { question: "Which data structure uses LIFO (Last In First Out)?", type: "MCQ", options: ["Queue", "Stack", "Tree", "Graph"], skill_tag: "Data Structures" },
          { question: "What does the 'S' in SOLID principles stand for?", type: "MCQ", options: ["Single Responsibility", "Static Typing", "Synchronous Processing", "Scalability"], skill_tag: "Software Engineering" },
          { question: "Explain the virtual DOM in React.", type: "TEXT", skill_tag: "React" },
          { question: "Which CSS property is used to change the background color?", type: "MCQ", options: ["color", "bgcolor", "background-color", "bg-color"], skill_tag: "CSS" }
        ])
      }
    } catch (e) {
      console.error(e)
      // Fallback for demo
      setQuestions([
        { question: "What is the primary difference between let and var in JavaScript?", type: "MCQ", options: ["Scope", "Hoisting", "Both Scope and Hoisting", "None"], skill_tag: "JavaScript" },
        { question: "Which data structure uses LIFO (Last In First Out)?", type: "MCQ", options: ["Queue", "Stack", "Tree", "Graph"], skill_tag: "Data Structures" },
        { question: "What does the 'S' in SOLID principles stand for?", type: "MCQ", options: ["Single Responsibility", "Static Typing", "Synchronous Processing", "Scalability"], skill_tag: "Software Engineering" },
        { question: "Explain the virtual DOM in React.", type: "TEXT", skill_tag: "React" },
        { question: "Which CSS property is used to change the background color?", type: "MCQ", options: ["color", "bgcolor", "background-color", "bg-color"], skill_tag: "CSS" }
      ])
    } finally {
      setLoading(false)
      setCurrentStep(0)
    }
  }

  const submitAssessment = async () => {
    setSubmitting(true)
    
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
      // For demo, route anyway if api is not fully functional
      router.push('/student/profile')
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

  if (questions.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center animate-in fade-in zoom-in-95 duration-700">
        <div className="max-w-xl w-full bg-white rounded-3xl p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <BrainCircuit className="w-48 h-48 text-indigo-600" />
          </div>
          
          <div className="relative z-10">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Sparkles className="w-10 h-10 text-indigo-600" />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800 tracking-tight">AI Skill Assessment</h1>
            <p className="text-slate-500 mb-10 text-lg leading-relaxed">
              Enter your target domain. Our AI will generate a personalized assessment to evaluate your skills, map your profile, and find your perfect opportunities.
            </p>
            
            <div className="space-y-6 max-w-md mx-auto text-left">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block">Target Domain / Field of Study</label>
                <input 
                  type="text" 
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                  placeholder="e.g. Software Engineering, UX Design..."
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800 font-medium"
                  onKeyDown={(e) => e.key === 'Enter' && startAssessment()}
                />
              </div>

              <button
                onClick={startAssessment}
                disabled={loading || !field.trim()}
                className="w-full group relative flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] disabled:opacity-70 disabled:pointer-events-none overflow-hidden"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Generating Assessment...
                  </>
                ) : (
                  <>
                    <span className="relative z-10">Start Assessment</span>
                    <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                    <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
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
    <div className="max-w-3xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
      {/* Header & Progress */}
      <div className="mb-10">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Domain Assessment</h1>
            <p className="text-indigo-600 font-semibold">{field}</p>
          </div>
          <div className="text-slate-500 font-medium bg-slate-100 px-4 py-2 rounded-xl text-sm">
            Question <span className="font-bold text-slate-800">{currentStep + 1}</span> of {questions.length}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500 ease-out rounded-full shadow-sm"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {/* Question Card */}
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 mb-8 min-h-[420px] flex flex-col relative overflow-hidden">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-6">
          <span className="px-3.5 py-1.5 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-100/80">
            {q.skill_tag}
          </span>
          <span className="px-3 py-1 bg-slate-100 text-slate-600 font-medium text-xs rounded-xl">
            {hasOptions 
              ? (isMultiSelect ? 'Multiple Select (Select all that apply)' : 'Multiple Choice') 
              : 'Written Response'
            }
          </span>
        </div>
        
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-8 leading-relaxed">
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
                      w-full group flex items-center p-4 md:p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 text-left relative
                      ${isSelected 
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-md shadow-indigo-100 ring-2 ring-indigo-500/20' 
                        : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/90 bg-white'
                      }
                    `}
                  >
                    {/* Option Letter Badge */}
                    <div className={`
                      w-8 h-8 rounded-xl font-bold text-sm flex items-center justify-center mr-4 transition-all shrink-0
                      ${isSelected 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-700'
                      }
                    `}>
                      {optionLetter}
                    </div>

                    {/* Option Text */}
                    <span className={`text-base md:text-lg flex-1 transition-colors ${isSelected ? 'font-semibold text-indigo-950' : 'text-slate-700'}`}>
                      {opt}
                    </span>

                    {/* Indicator Circle/Checkbox */}
                    <div className={`
                      w-6 h-6 ${isMultiSelect ? 'rounded-lg' : 'rounded-full'} border-2 flex items-center justify-center ml-4 transition-all shrink-0
                      ${isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white group-hover:border-indigo-300'}
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
                className="w-full h-full p-6 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-all text-slate-700 text-lg resize-none"
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
          className="flex items-center gap-2 px-6 py-4 text-slate-500 font-bold hover:text-slate-800 transition-colors disabled:opacity-0"
        >
          <ArrowLeft size={20} /> Previous
        </button>

        <button
          onClick={handleNext}
          disabled={!isAnswered || submitting}
          className={`
            flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all shadow-md
            ${!isAnswered 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
              : isLastQuestion
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:-translate-y-0.5'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] hover:-translate-y-0.5'
            }
          `}
        >
          {submitting ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Processing AI Score...</>
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
