'use client'

import React, { useRef, useEffect } from 'react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { BrainCircuit, ShieldCheck, Target, TrendingUp, Users } from 'lucide-react'

const mockData = [
  { value: 40 }, { value: 30 }, { value: 50 }, { value: 45 }, { value: 70 }, { value: 65 }, { value: 95 }
]

export default function BentoFeatures() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger')
    ]).then(([gsapPkg, scrollTriggerPkg]) => {
      const gsap = gsapPkg.default
      const ScrollTrigger = scrollTriggerPkg.default
      gsap.registerPlugin(ScrollTrigger)
      
      if (!containerRef.current) return
      
      const cards = containerRef.current.querySelectorAll('.bento-card')
      
      gsap.fromTo(cards, 
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
          }
        }
      )
    })
  }, [])

  return (
    <div className="w-full max-w-6xl mx-auto my-24 px-4" ref={containerRef}>
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">The Modern Talent Engine</h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">Everything you need to bridge the gap between academia and industry in one unified platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 auto-rows-[250px]">
        
        {/* Large Feature - AI Assessment */}
        <div className="bento-card premium-card rounded-3xl p-8 col-span-1 md:col-span-2 row-span-1 md:row-span-2 relative overflow-hidden group flex flex-col">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <BrainCircuit className="w-64 h-64 text-indigo-400" />
          </div>
          
          <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center mb-6">
            <BrainCircuit size={24} />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">AI-Powered Skill Verification</h3>
          <p className="text-slate-400 max-w-md leading-relaxed mb-8 flex-1">
            Move beyond self-reported resumes. Our AI proctors and evaluates real-world coding challenges, providing an objective, verified skill profile for every student.
          </p>
          
          {/* Mini UI Mockup inside card */}
          <div className="mt-auto bg-[#0a0a0a] border border-[rgba(255,255,255,0.05)] rounded-2xl p-4 shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400">Skill Growth</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1"><TrendingUp size={12}/> +24%</span>
            </div>
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData}>
                  <Line type="monotone" dataKey="value" stroke="#818cf8" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Small Feature 1 */}
        <div className="bento-card premium-card rounded-3xl p-8 flex flex-col justify-between group">
          <div>
            <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mb-4">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Authentic Profiles</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Institutions verify student identities, ensuring companies only interview real, qualified candidates.</p>
          </div>
        </div>

        {/* Small Feature 2 */}
        <div className="bento-card premium-card rounded-3xl p-8 flex flex-col justify-between group">
          <div>
            <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-4">
              <Target size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Precision Matching</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Our algorithm ranks candidates based on exact skill matches, reducing recruitment time by 80%.</p>
          </div>
        </div>

      </div>
    </div>
  )
}
