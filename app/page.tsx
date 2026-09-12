'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import AudienceSection from '@/components/landing/AudienceSection'
import NetworkBackground from '@/components/landing/NetworkBackground'
import LiveMarquee from '@/components/landing/LiveMarquee'
import InteractiveMatchDemo from '@/components/landing/InteractiveMatchDemo'
import BentoFeatures from '@/components/landing/BentoFeatures'
import { useEffect, useRef } from 'react'

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    import('gsap').then(({ default: gsap }) => {
      if (!containerRef.current) return
      
      const tl = gsap.timeline()
      
      tl.fromTo(containerRef.current.querySelector('.hero-text'),
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      )
      
      tl.fromTo(containerRef.current.querySelectorAll('.hero-button'),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" },
        "-=0.4"
      )
    })
  }, [])

  return (
    <div className="flex flex-col min-h-screen relative z-0" ref={containerRef}>
      <NetworkBackground />
      <Navbar />
      <main className="flex-1 flex flex-col items-center w-full overflow-x-hidden">
        {/* Background glow specific to hero */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
        
        <section className="w-full pt-20 pb-4 md:pt-28 md:pb-8 lg:pt-36 lg:pb-12 flex items-center justify-center">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center text-center hero-text max-w-[1320px] mx-auto">
              <div className="flex flex-col items-center max-w-4xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                  Platform Live
                </div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl/none text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500 mb-6">
                  CareerBridge
                </h1>
                <p className="mx-auto max-w-[700px] text-slate-400 md:text-xl font-light leading-relaxed mb-9">
                  Connecting students, academicians, industry, and institutions for skill mapping, live projects, internships, and placements across all disciplines.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup" className="hero-button premium-button-primary px-8 py-3.5 text-base">
                  Get Started <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
                <Link href="/login" className="hero-button premium-button-secondary px-8 py-3.5 text-base">
                  Log In
                </Link>
              </div>
            </div>
          </div>
        </section>

        <LiveMarquee />
        
        <InteractiveMatchDemo />
        <BentoFeatures />

        <AudienceSection />
      </main>
      
      <footer className="w-full py-8 px-6 border-t border-[rgba(255,255,255,0.05)] text-center relative z-10">
        <p className="text-sm text-slate-500">
          © 2026 CareerBridge. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
