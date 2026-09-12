'use client'

import React from 'react'
import { Sparkles, Briefcase, GraduationCap, Building2 } from 'lucide-react'

const events = [
  { text: "Sarah just scored 95% in React Assessment", icon: <Sparkles size={14} className="text-emerald-400" /> },
  { text: "TechCorp posted a new Frontend Internship", icon: <Briefcase size={14} className="text-blue-400" /> },
  { text: "NIT joined the CareerBridge network", icon: <Building2 size={14} className="text-indigo-400" /> },
  { text: "Alex matched with 3 new tech roles", icon: <GraduationCap size={14} className="text-amber-400" /> },
  { text: "GlobalSystems is actively hiring Node.js devs", icon: <Briefcase size={14} className="text-blue-400" /> },
  { text: "Priya achieved 'Top 1%' in Python", icon: <Sparkles size={14} className="text-emerald-400" /> },
]

export default function LiveMarquee() {
  return (
    <div className="w-full max-w-6xl mx-auto py-8 mb-4 overflow-hidden relative z-10 flex items-center" style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)' }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}} />
      <div className="animate-marquee flex gap-4 w-[200%]">
        {/* Render multiple times for seamless loop */}
        {[...events, ...events, ...events, ...events].map((event, i) => (
          <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0a0a0a]/80 border border-[rgba(255,255,255,0.05)] shadow-sm text-xs font-medium text-slate-300 whitespace-nowrap">
            {event.icon}
            <span>{event.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
