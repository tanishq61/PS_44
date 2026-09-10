'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Mail, Phone, MapPin, Globe, Code2, Users, ExternalLink, Download, Share2, Award, BookOpen, Briefcase, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function PortfolioPage() {
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)
  const [assessment, setAssessment] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    async function loadPortfolio() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserData(user)
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
      setLoading(false)
    }
    loadPortfolio()
  }, [])

  if (loading) return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  )

  if (!assessment || !userData) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] max-w-2xl mx-auto text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
          <Briefcase className="w-12 h-12 text-indigo-400" />
        </div>
        <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Your Portfolio is Empty</h1>
        <p className="text-lg text-slate-500">You haven't built your digital portfolio yet. Take your first AI skill assessment to automatically generate your portfolio based on your skills.</p>
        <Link 
          href="/student/assessment"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] hover:-translate-y-1 mt-4"
        >
          Take Assessment <ArrowRight size={20} />
        </Link>
      </div>
    )
  }

  // Derive skills from assessment
  const skillsList = Object.entries(assessment.skill_profile).map(([name, score]: [string, any]) => ({
    name,
    level: score > 80 ? 'Advanced' : score > 50 ? 'Intermediate' : 'Beginner'
  }))

  const userEmail = userData.email
  const userName = userData.user_metadata?.full_name || userEmail.split('@')[0]

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-700">
      {/* Action Bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <p className="text-sm font-medium text-slate-500 pl-2">
          Your portfolio is <span className="text-emerald-600 font-bold">Public</span>
        </p>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors text-sm">
            <Download size={16} /> PDF Resume
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors shadow-md text-sm">
            <Share2 size={16} /> Share Link
          </button>
        </div>
      </div>

      {/* Main Portfolio Container */}
      <div className="bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden">
        {/* Header Banner */}
        <div className="h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
          <div className="absolute -bottom-16 left-8 md:left-12">
            <div className="w-32 h-32 bg-white rounded-full p-1.5 shadow-lg">
              <div className="w-full h-full bg-slate-200 rounded-full flex items-center justify-center overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${userName}&backgroundColor=f1f5f9`} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-20 px-8 md:px-12 pb-12">
          {/* Profile Header Info */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 mb-12">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2 capitalize">{userName}</h1>
              <p className="text-xl text-indigo-600 font-medium mb-4">Student & Aspiring Professional</p>
              <p className="text-slate-600 max-w-2xl leading-relaxed">
                Passionate student building a strong foundation in modern technologies. Ready to tackle complex problems and continuously learning through AI-driven assessments.
              </p>
            </div>
            
            {/* Contact Info Grid */}
            <div className="flex flex-col gap-3 text-sm text-slate-600 bg-slate-50 p-5 rounded-2xl border border-slate-100 min-w-[250px]">
              <a href="#" className="flex items-center gap-3 hover:text-indigo-600 transition-colors"><Mail size={16} /> {userEmail}</a>
              <div className="h-px bg-slate-200 my-1"></div>
              <div className="flex items-center gap-4 pt-1">
                <a href="#" className="text-slate-400 hover:text-slate-800 transition-colors"><Code2 size={20} /></a>
                <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors"><Users size={20} /></a>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column (Skills & Education) */}
            <div className="lg:col-span-1 space-y-10">
              {/* Skills */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Award className="text-indigo-500" /> Technical Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {skillsList.map((skill, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl flex flex-col w-full">
                      <span className="font-semibold text-slate-800 text-sm">{skill.name}</span>
                      <span className="text-xs text-slate-500">{skill.level}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Education */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <BookOpen className="text-indigo-500" /> Education
                </h2>
                <div className="space-y-6">
                  <div className="relative pl-4 before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-indigo-500 before:rounded-full">
                    <h3 className="font-bold text-slate-800">Current Degree</h3>
                    <p className="text-indigo-600 font-medium text-sm">University Student</p>
                    <p className="text-slate-500 text-xs mt-1 mb-2">Ongoing</p>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column (Projects & Experience) */}
            <div className="lg:col-span-2 space-y-10">
              {/* Projects */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Briefcase className="text-indigo-500" /> Work Experience
                </h2>
                <div className="p-12 border-2 border-dashed border-slate-200 rounded-2xl text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Briefcase className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-slate-700 font-bold mb-1">Looking for Opportunities</h3>
                  <p className="text-slate-500 text-sm">Check the Opportunities tab to find matched jobs and internships based on your AI assessment.</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
