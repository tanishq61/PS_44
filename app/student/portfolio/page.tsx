'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Mail, Phone, MapPin, Globe, Code2, Users, ExternalLink, Download, Share2, Award, BookOpen, Briefcase, ArrowRight, Plus, X, Loader2 } from 'lucide-react'
import Link from 'next/link'

const cleanSkillName = (name: string) => {
  const map: Record<string, string> = {
    "Database Performance & Query Optimization": "Database Optimization",
    "Algorithm Optimization & Data Structures": "Data Structures & Algorithms",
    "Version Control & Git Workflow": "Git & Version Control",
    "System Architecture & Asynchronous Processing": "System Architecture",
    "Incident Triage & Debugging Methodology": "Debugging & Incident Triage",
    "Clean Code & Refactoring": "Clean Code & Refactoring",
    "Technical Communication & Trade-off Management": "Technical Communication",
    "Engineering Ethics & Risk Assessment": "Engineering Ethics"
  }
  return map[name] || name
}

export default function PortfolioPage() {
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)
  const [assessment, setAssessment] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [portfolioItems, setPortfolioItems] = useState<any[]>([])
  
  // Custom skills & visibility states
  const [customSkills, setCustomSkills] = useState<{ name: string; level: string }[]>([])
  const [hiddenSkills, setHiddenSkills] = useState<string[]>([])
  const [showAllSkills, setShowAllSkills] = useState(false)
  const [isAddingSkill, setIsAddingSkill] = useState(false)
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillLevel, setNewSkillLevel] = useState('Intermediate')
  const [uploadingResume, setUploadingResume] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function loadPortfolio() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserData(user)
        
        // Load custom & hidden skills from localStorage
        try {
          const savedCustom = localStorage.getItem(`custom_skills_${user.id}`)
          if (savedCustom) setCustomSkills(JSON.parse(savedCustom))
          const savedHidden = localStorage.getItem(`hidden_skills_${user.id}`)
          if (savedHidden) setHiddenSkills(JSON.parse(savedHidden))
        } catch (e) {
          console.error(e)
        }

        // Fetch profile
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        if (prof) setProfile(prof)

        // Fetch portfolio items
        const { data: items } = await supabase
          .from('portfolio_items')
          .select('*')
          .eq('student_id', user.id)
          .order('created_at', { ascending: false })
        if (items) setPortfolioItems(items)

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

  // Derive assessed skills sorted by score descending
  const sortedAssessed = Object.entries(assessment.skill_profile || {})
    .map(([rawName, score]: [string, any]) => ({
      rawName,
      name: cleanSkillName(rawName),
      score: Number(score),
      level: Number(score) > 80 ? 'Advanced' : Number(score) > 50 ? 'Intermediate' : 'Beginner',
      isCustom: false
    }))
    .sort((a, b) => b.score - a.score)

  // Show only proficient skills (score >= 60) by default to avoid cluttering with "Beginner" badges
  const proficientAssessed = sortedAssessed.filter(s => s.score >= 60)
  const baseAssessed = showAllSkills
    ? sortedAssessed
    : (proficientAssessed.length > 0 ? proficientAssessed : sortedAssessed.slice(0, 3))

  // Filter out any skills the user removed/hid
  const visibleAssessed = baseAssessed.filter(s => !hiddenSkills.includes(s.rawName) && !hiddenSkills.includes(s.name))

  // Combine with custom added skills
  const skillsList = [
    ...visibleAssessed,
    ...customSkills.map(c => ({ rawName: c.name, name: c.name, score: 0, level: c.level, isCustom: true }))
  ]

  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSkillName.trim()) return
    const updated = [...customSkills, { name: newSkillName.trim(), level: newSkillLevel }]
    setCustomSkills(updated)
    if (userData?.id) {
      localStorage.setItem(`custom_skills_${userData.id}`, JSON.stringify(updated))
    }
    setNewSkillName('')
    setIsAddingSkill(false)
  }

  const handleRemoveSkill = (skillToRemove: any) => {
    if (skillToRemove.isCustom) {
      const updated = customSkills.filter(s => s.name !== skillToRemove.name)
      setCustomSkills(updated)
      if (userData?.id) {
        localStorage.setItem(`custom_skills_${userData.id}`, JSON.stringify(updated))
      }
    } else {
      const updated = [...hiddenSkills, skillToRemove.rawName, skillToRemove.name]
      setHiddenSkills(updated)
      if (userData?.id) {
        localStorage.setItem(`hidden_skills_${userData.id}`, JSON.stringify(updated))
      }
    }
  }

  const handleResetSkills = () => {
    setHiddenSkills([])
    if (userData?.id) {
      localStorage.removeItem(`hidden_skills_${userData.id}`)
    }
  }

  const userEmail = userData.email
  const userName = profile?.full_name || userData.user_metadata?.full_name || userEmail.split('@')[0]
  const resumeUrl = profile?.resume_url

  const handleUploadResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userData?.id) return

    setUploadingResume(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', userData.id)

      const res = await fetch('/api/student/resume', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload resume')
      }

      setProfile((prev: any) => ({ ...prev, resume_url: data.publicUrl }))
      alert("Resume uploaded successfully!")
    } catch (error: any) {
      alert("Error uploading resume: " + error.message)
    } finally {
      setUploadingResume(false)
    }
  }

  const handleShare = () => {
    const link = `${window.location.origin}/company/students/${userData.id}`
    navigator.clipboard.writeText(link)
    alert("Public portfolio link copied to clipboard!\n" + link)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-700">
      {/* Action Bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <p className="text-sm font-medium text-slate-500 pl-2">
          Your portfolio is <span className="text-emerald-600 font-bold">Public</span>
        </p>
        <div className="flex gap-3">
          {resumeUrl ? (
            <a href={resumeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors text-sm">
              <Download size={16} /> View PDF Resume
            </a>
          ) : (
            <label className={`flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors text-sm ${uploadingResume ? 'opacity-70 pointer-events-none' : 'cursor-pointer'}`}>
              {uploadingResume ? (
                <><Loader2 size={16} className="animate-spin text-indigo-600" /> Uploading...</>
              ) : (
                <><Download size={16} /> Upload PDF Resume</>
              )}
              <input type="file" accept=".pdf" className="hidden" disabled={uploadingResume} onChange={handleUploadResume} />
            </label>
          )}
          <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors shadow-md text-sm">
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
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Award className="text-indigo-500" /> Technical Skills
                  </h2>
                  <button
                    onClick={() => setIsAddingSkill(!isAddingSkill)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 shadow-sm"
                  >
                    <Plus size={14} /> Add Skill
                  </button>
                </div>

                {isAddingSkill && (
                  <form onSubmit={handleAddCustomSkill} className="mb-4 p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-3 animate-in fade-in zoom-in-95 duration-200">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Skill Name</label>
                      <input
                        type="text"
                        placeholder="e.g. React, Python, Machine Learning"
                        value={newSkillName}
                        onChange={(e) => setNewSkillName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                        autoFocus
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Proficiency</label>
                        <select
                          value={newSkillLevel}
                          onChange={(e) => setNewSkillLevel(e.target.value)}
                          className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="Advanced">Advanced</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Beginner">Beginner</option>
                        </select>
                      </div>
                      <div className="flex items-end gap-2 pt-4">
                        <button
                          type="button"
                          onClick={() => setIsAddingSkill(false)}
                          className="text-xs px-3 py-1.5 text-slate-500 hover:text-slate-700"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="text-xs px-3.5 py-1.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                <div className="flex flex-col gap-2">
                  {skillsList.length > 0 ? (
                    skillsList.map((skill, idx) => (
                      <div 
                        key={idx} 
                        className="group relative bg-white border border-slate-200 hover:border-indigo-200 p-3 rounded-2xl flex items-center justify-between transition-all shadow-sm hover:shadow"
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 text-sm">{skill.name}</span>
                          <span className={`text-[11px] font-bold mt-0.5 ${
                            skill.level === 'Advanced' ? 'text-emerald-600' :
                            skill.level === 'Intermediate' ? 'text-indigo-600' : 'text-slate-500'
                          }`}>
                            {skill.level} {skill.score > 0 ? `• Verified (${skill.score}%)` : ''}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          title="Remove skill from portfolio"
                          className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition-all"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center border border-dashed border-slate-200 rounded-2xl">
                      <p className="text-xs text-slate-500">No skills selected for display.</p>
                      <button 
                        onClick={handleResetSkills}
                        className="text-xs text-indigo-600 font-semibold hover:underline mt-1"
                      >
                        Restore assessed skills
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs">
                  {sortedAssessed.length > visibleAssessed.length && !showAllSkills && (
                    <button 
                      onClick={() => setShowAllSkills(true)}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold"
                    >
                      Show all {sortedAssessed.length} assessed skills
                    </button>
                  )}
                  {showAllSkills && (
                    <button 
                      onClick={() => setShowAllSkills(false)}
                      className="text-slate-500 hover:text-slate-700 font-medium"
                    >
                      Show only top skills
                    </button>
                  )}
                  {hiddenSkills.length > 0 && (
                    <button 
                      onClick={handleResetSkills}
                      className="text-slate-400 hover:text-slate-600 text-[11px] ml-auto"
                    >
                      Reset hidden ({hiddenSkills.length})
                    </button>
                  )}
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
                  <Briefcase className="text-indigo-500" /> Projects & Experience
                </h2>
                {portfolioItems.length > 0 ? (
                  <div className="space-y-6">
                    {portfolioItems.map((item) => (
                      <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-slate-800 text-lg">{item.title}</h3>
                          <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-2 py-1 rounded-full uppercase">
                            {item.type}
                          </span>
                        </div>
                        <p className="text-slate-600 text-sm">{item.description}</p>
                        {item.file_url && (
                          <a href={item.file_url} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 hover:underline mt-2">
                            View Attachment / Link
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 border-2 border-dashed border-slate-200 rounded-2xl text-center flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <Briefcase className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-slate-700 font-bold mb-1">Looking for Opportunities</h3>
                    <p className="text-slate-500 text-sm">Check the Opportunities tab to find matched jobs and internships based on your AI assessment.</p>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
