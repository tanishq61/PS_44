'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { GraduationCap, Building2, Briefcase, ArrowRight, Search, Target, Users, BookOpen, LineChart, ShieldCheck } from 'lucide-react'
import StudentPreview from './StudentPreview'
import InstitutionPreview from './InstitutionPreview'
import IndustryPreview from './IndustryPreview'

type AudienceType = 'student' | 'institution' | 'industry'

const CONTENT = {
  student: {
    headline: "Build your future. One opportunity at a time.",
    description: "Discover opportunities, showcase your skills, build real-world experience, and connect with the people who can help move your career forward.",
    features: [
      { icon: Search, title: "Discover Opportunities", desc: "Find relevant internships, projects, and career opportunities matched to your skills." },
      { icon: Target, title: "Showcase Your Skills", desc: "Build a digital profile that highlights your assessments, projects, and achievements." },
      { icon: Briefcase, title: "Build Real Experience", desc: "Work on meaningful industry projects and gain experience that goes beyond the classroom." },
      { icon: Users, title: "Grow Your Network", desc: "Connect with institutions, companies, mentors, and other ambitious students." }
    ],
    ctaText: "Explore Student Experience",
    ctaLink: "/signup", // Or whatever exists
    PreviewComponent: StudentPreview
  },
  institution: {
    headline: "Empower students. Connect them with opportunity.",
    description: "Give students the tools, opportunities, and connections they need to turn academic potential into real-world outcomes.",
    features: [
      { icon: Users, title: "Student Discovery", desc: "Discover talented students based on verified skills, interests, and potential." },
      { icon: Briefcase, title: "Opportunity Management", desc: "Create and manage opportunities that connect students with meaningful experiences." },
      { icon: Building2, title: "Campus Engagement", desc: "Build stronger connections between your institution, students, and industry partners." },
      { icon: LineChart, title: "Track Outcomes", desc: "Monitor participation, applications, engagement, and student readiness metrics." }
    ],
    ctaText: "Explore Institution Experience",
    ctaLink: "/institution",
    PreviewComponent: InstitutionPreview
  },
  industry: {
    headline: "Find talent. Build together.",
    description: "Discover exceptional students, post real-world projects, build your talent pipeline, and connect with the next generation of innovators.",
    features: [
      { icon: Target, title: "Talent Pipeline", desc: "Discover skilled and motivated student candidates for your future team with AI matching." },
      { icon: BookOpen, title: "Project Posting", desc: "Launch real-world projects and challenges that attract highly capable contributors." },
      { icon: Building2, title: "Campus Reach", desc: "Connect directly with students and academic institutions to expand your talent network." },
      { icon: ShieldCheck, title: "Recruiting Tools", desc: "Move from discovery to opportunity with a streamlined, data-driven recruitment experience." }
    ],
    ctaText: "Explore Industry Experience",
    ctaLink: "/company",
    PreviewComponent: IndustryPreview
  }
}

export default function AudienceSection() {
  const [activeTab, setActiveTab] = useState<AudienceType>('student')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  
  const handleTabChange = (tab: AudienceType) => {
    if (tab === activeTab || isTransitioning) return
    setIsTransitioning(true)
    
    import('gsap').then(({ default: gsap }) => {
      if (!contentRef.current) return
      
      const elements = contentRef.current.querySelectorAll('.anim-element')
      
      // Fade out
      gsap.to(elements, {
        opacity: 0,
        y: -10,
        duration: 0.3,
        stagger: 0.05,
        ease: "power2.in",
        onComplete: () => {
          setActiveTab(tab)
          
          // Fade in new content
          gsap.fromTo(elements, 
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power3.out", onComplete: () => setIsTransitioning(false) }
          )
        }
      })
    })
  }

  // Initial load animation
  useEffect(() => {
    import('gsap').then(({ default: gsap }) => {
      if (!contentRef.current) return
      const elements = contentRef.current.querySelectorAll('.anim-element')
      gsap.fromTo(elements,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" }
      )
    })
  }, [])

  const currentContent = CONTENT[activeTab]
  const Preview = currentContent.PreviewComponent

  return (
    <section className="w-full pt-8 pb-20 md:pt-16 md:pb-28 relative z-10">
      <div className="container px-4 md:px-6 md:px-8 mx-auto max-w-[1320px]">
        
        {/* Switcher */}
        <div className="flex justify-center mb-10 md:mb-14">
          <div className="inline-flex p-1.5 rounded-2xl bg-[#080808] border border-[rgba(255,255,255,0.06)] shadow-inner">
            <button
              onClick={() => handleTabChange('student')}
              className={`relative flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === 'student' 
                  ? 'bg-[#1a1a1a] text-white shadow-md border border-[rgba(255,255,255,0.1)]' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent'
              }`}
            >
              <GraduationCap className="w-4 h-4" /> Student
            </button>
            <button
              onClick={() => handleTabChange('institution')}
              className={`relative flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === 'institution' 
                  ? 'bg-[#1a1a1a] text-white shadow-md border border-[rgba(255,255,255,0.1)]' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent'
              }`}
            >
              <Building2 className="w-4 h-4" /> Institution
            </button>
            <button
              onClick={() => handleTabChange('industry')}
              className={`relative flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === 'industry' 
                  ? 'bg-[#1a1a1a] text-white shadow-md border border-[rgba(255,255,255,0.1)]' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent'
              }`}
            >
              <Briefcase className="w-4 h-4" /> Industry
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div ref={contentRef} className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-14 items-center">
          
          {/* Left Text & Features */}
          <div className="lg:col-span-5 flex flex-col gap-8 md:gap-10">
            <div className="flex flex-col gap-4">
              <h2 className="anim-element text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                {currentContent.headline}
              </h2>
              <p className="anim-element text-lg text-slate-400 leading-relaxed">
                {currentContent.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {currentContent.features.map((feature, idx) => (
                <div key={idx} className="anim-element flex flex-col gap-3 group">
                  <div className="w-10 h-10 rounded-lg bg-[#0d0d0d] border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-indigo-400 group-hover:text-indigo-300 group-hover:scale-105 transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1.5">{feature.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="anim-element pt-2">
              <Link href={currentContent.ctaLink} className="premium-button-secondary px-6 py-3">
                {currentContent.ctaText} <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Preview */}
          <div className="lg:col-span-7 anim-element relative perspective-1000 flex items-center justify-center w-full">
            {/* Background ambient glow for the preview */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="relative w-full aspect-[4/3] max-h-[600px] rounded-[24px] bg-[#050505] border border-[rgba(255,255,255,0.1)] shadow-2xl overflow-hidden flex flex-col transform transition-transform duration-700 ease-out hover:scale-[1.02]">
              {/* Browser-like Header */}
              <div className="h-12 bg-[#0a0a0a] border-b border-[rgba(255,255,255,0.05)] flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                </div>
                <div className="ml-4 flex-1 flex justify-center">
                  <div className="h-6 w-48 bg-[#111] rounded-md border border-[rgba(255,255,255,0.03)] flex items-center justify-center">
                    <span className="text-[10px] text-slate-500 font-mono">app.ps-56.com/{activeTab}</span>
                  </div>
                </div>
              </div>
              
              {/* Dashboard Wrapper */}
              <div className="flex-1 overflow-hidden relative">
                <Preview />
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  )
}
