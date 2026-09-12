'use client'

import React, { useRef, useState, useEffect } from 'react'
import { UserCircle, Briefcase, Zap, CheckCircle2 } from 'lucide-react'

export default function InteractiveMatchDemo() {
  const [hasMatched, setHasMatched] = useState(false)
  const scoreRef = useRef<HTMLSpanElement>(null)
  const lineRef = useRef<SVGPathElement>(null)

  const handleMatch = () => {
    if (hasMatched) return
    setHasMatched(true)

    import('gsap').then(({ default: gsap }) => {
      // Animate line drawing
      if (lineRef.current) {
        gsap.fromTo(lineRef.current,
          { strokeDashoffset: 1000 },
          { strokeDashoffset: 0, duration: 1.5, ease: "power2.inOut" }
        )
      }

      // Animate score counter
      if (scoreRef.current) {
        gsap.to(scoreRef.current, {
          innerHTML: 98,
          duration: 2,
          snap: { innerHTML: 1 },
          ease: "power2.out",
          onUpdate: function() {
            if (scoreRef.current) {
              scoreRef.current.innerHTML = Math.round(Number(scoreRef.current.innerHTML)).toString()
            }
          }
        })
      }
    })
  }

  return (
    <div className="w-full max-w-4xl mx-auto my-16 p-8 premium-card rounded-3xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <Zap className="w-64 h-64 text-indigo-500" />
      </div>

      <div className="text-center mb-10 relative z-10">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">See the AI Matchmaker in Action</h2>
        <p className="text-slate-400">Our engine instantly maps verified skills to job requirements.</p>
      </div>

      <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 z-10">
        
        {/* Student Card */}
        <div className="w-full md:w-1/3 bg-[#0a0a0a] border border-[rgba(255,255,255,0.05)] p-6 rounded-2xl shadow-lg relative z-20">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center">
              <UserCircle size={24} />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Alex Chen</h3>
              <p className="text-slate-400 text-sm">Computer Science</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300">React.js</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 size={10} /> Verified</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300">Node.js</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 size={10} /> Verified</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300">TypeScript</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 size={10} /> Verified</span>
            </div>
          </div>
        </div>

        {/* Connection Area */}
        <div className="flex-1 flex flex-col items-center justify-center relative min-h-[100px] md:min-h-0 z-10">
          <button 
            onClick={handleMatch}
            disabled={hasMatched}
            className={`premium-button-primary px-6 py-3 rounded-full flex items-center gap-2 relative z-30 transition-all ${hasMatched ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}
          >
            <Zap size={16} /> Run AI Match
          </button>

          {/* Glowing Score Result */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center transition-all duration-700 ${hasMatched ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
            <div className="w-20 h-20 bg-[#0a0a0a] border-2 border-indigo-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.4)] relative z-30">
              <span className="text-2xl font-black text-white flex items-center">
                <span ref={scoreRef}>0</span>%
              </span>
            </div>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-2 bg-[#030303] px-2 relative z-30">Match Score</span>
          </div>

          {/* SVG Connecting Line (Hidden on mobile for simplicity, or we can make it vertical) */}
          <svg className="absolute hidden md:block w-full h-full left-0 top-0 z-0 pointer-events-none" style={{ overflow: 'visible' }}>
            <path
              ref={lineRef}
              d="M 0 50 C 50 50, 50 50, 100 50"
              stroke="url(#gradient)"
              strokeWidth="4"
              fill="none"
              strokeDasharray="1000"
              strokeDashoffset="1000"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              className="drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="50%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Job Card */}
        <div className="w-full md:w-1/3 bg-[#0a0a0a] border border-[rgba(255,255,255,0.05)] p-6 rounded-2xl shadow-lg relative z-20">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
              <Briefcase size={24} />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Full Stack Dev</h3>
              <p className="text-slate-400 text-sm">TechCorp Inc.</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300">Required: React.js</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300">Required: Node.js</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300">Required: TypeScript</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
