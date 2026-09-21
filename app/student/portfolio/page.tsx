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
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [newItemTitle, setNewItemTitle] = useState('')
  const [newItemType, setNewItemType] = useState('project')
  const [newItemDesc, setNewItemDesc] = useState('')
  const [newItemFile, setNewItemFile] = useState<File | null>(null)
  const [uploadingItem, setUploadingItem] = useState(false)

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
    <div className="flex h-[50vh] items-center justify-center relative z-10">
      <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-400 rounded-full animate-spin"></div>
    </div>
  )

  if (!assessment || !userData) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] max-w-2xl mx-auto text-center space-y-6 animate-in fade-in zoom-in-95 duration-500 z-10 relative">
        <div className="w-24 h-24 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center mb-4">
          <Briefcase className="w-12 h-12 text-indigo-400" />
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">Your Portfolio is Empty</h1>
        <p className="text-lg text-slate-400 font-light">You haven't built your digital portfolio yet. Take your first AI skill assessment to automatically generate your portfolio based on your skills.</p>
        <Link 
          href="/student/assessment"
          className="premium-button-primary px-8 py-4 mt-4"
        >
          Take Assessment <ArrowRight className="ml-2 w-5 h-5" />
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

  const handleAddPortfolioItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItemTitle || !newItemType || !userData?.id) return

    setUploadingItem(true)
    try {
      const formData = new FormData()
      formData.append('userId', userData.id)
      formData.append('title', newItemTitle)
      formData.append('type', newItemType)
      formData.append('description', newItemDesc)
      if (newItemFile) formData.append('file', newItemFile)
      // Note: If no file is attached, the backend requires a file. For demo, we can just enforce file selection in the UI.

      const res = await fetch('/api/student/portfolio/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to upload item')

      alert("Item added successfully!")
      
      const { data: items } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('student_id', userData.id)
        .order('created_at', { ascending: false })
      if (items) setPortfolioItems(items)

      setIsAddingItem(false)
      setNewItemTitle('')
      setNewItemDesc('')
      setNewItemFile(null)
    } catch (error: any) {
      alert("Error adding item: " + error.message)
    } finally {
      setUploadingItem(false)
    }
  }

  const handleShare = () => {
    const link = `${window.location.origin}/company/students/${userData.id}`
    navigator.clipboard.writeText(link)
    alert("Public portfolio link copied to clipboard!\n" + link)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-700 z-10 relative">
      {/* Action Bar */}
      <div className="flex justify-between items-center glass-panel p-4">
        <p className="text-sm font-medium text-slate-400 pl-2">
          Your portfolio is <span className="text-emerald-400 font-bold">Public</span>
        </p>
        <div className="flex gap-3">
          {resumeUrl ? (
            <a href={resumeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.05)] text-slate-300 rounded-xl font-semibold transition-colors text-sm">
              <Download size={16} /> View PDF Resume
            </a>
          ) : (
            <label className={`flex items-center gap-2 px-4 py-2 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.05)] text-slate-300 rounded-xl font-semibold transition-colors text-sm ${uploadingResume ? 'opacity-70 pointer-events-none' : 'cursor-pointer'}`}>
              {uploadingResume ? (
                <><Loader2 size={16} className="animate-spin text-indigo-400" /> Uploading...</>
              ) : (
                <><Download size={16} /> Upload PDF Resume</>
              )}
              <input type="file" accept=".pdf" className="hidden" disabled={uploadingResume} onChange={handleUploadResume} />
            </label>
          )}
          <button onClick={handleShare} className="premium-button-primary py-2 px-4 text-sm font-semibold">
            <Share2 size={16} className="mr-2" /> Share Link
          </button>
        </div>
      </div>

      {/* Main Portfolio Container */}
      <div className="glass-panel overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Header Banner */}
        <div className="h-48 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 relative border-b border-[rgba(255,255,255,0.05)]">
          <div className="absolute -bottom-16 left-8 md:left-12">
            <div className="w-32 h-32 bg-[#121212] rounded-full p-1.5 shadow-xl border border-[rgba(255,255,255,0.1)]">
              <div className="w-full h-full bg-[#1a1a1a] rounded-full flex items-center justify-center overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${userName}&backgroundColor=1e1e1e`} alt="Avatar" className="w-full h-full object-cover opacity-80" />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-20 px-8 md:px-12 pb-12 relative z-10">
          {/* Profile Header Info */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 mb-12">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 capitalize">{userName}</h1>
              <p className="text-xl text-indigo-400 font-medium mb-4">Student & Aspiring Professional</p>
              <p className="text-slate-400 max-w-2xl leading-relaxed font-light">
                Passionate student building a strong foundation in modern technologies. Ready to tackle complex problems and continuously learning through AI-driven assessments.
              </p>
            </div>
            
            {/* Contact Info Grid */}
            <div className="flex flex-col gap-3 text-sm text-slate-400 bg-[rgba(255,255,255,0.02)] p-5 rounded-2xl border border-[rgba(255,255,255,0.05)] min-w-[250px]">
              <a href="#" className="flex items-center gap-3 hover:text-indigo-400 transition-colors"><Mail size={16} /> {userEmail}</a>
              <div className="h-px bg-[rgba(255,255,255,0.05)] my-1"></div>
              <div className="flex items-center gap-4 pt-1">
                <a href="#" className="text-slate-500 hover:text-white transition-colors"><Code2 size={20} /></a>
                <a href="#" className="text-slate-500 hover:text-blue-400 transition-colors"><Users size={20} /></a>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column (Skills & Education) */}
            <div className="lg:col-span-1 space-y-10">
              {/* Skills */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Award className="text-indigo-400" /> Technical Skills
                  </h2>
                  <button
                    onClick={() => setIsAddingSkill(!isAddingSkill)}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 shadow-sm"
                  >
                    <Plus size={14} /> Add Skill
                  </button>
                </div>

                {isAddingSkill && (
                  <form onSubmit={handleAddCustomSkill} className="mb-4 p-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1.5">Skill Name</label>
                      <input
                        type="text"
                        placeholder="e.g. React, Python"
                        value={newSkillName}
                        onChange={(e) => setNewSkillName(e.target.value)}
                        className="w-full px-3 py-2 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-600"
                        required
                        autoFocus
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1">
                        <label className="text-xs font-bold text-slate-400 block mb-1.5">Proficiency</label>
                        <select
                          value={newSkillLevel}
                          onChange={(e) => setNewSkillLevel(e.target.value)}
                          className="w-full px-2.5 py-2 border border-[rgba(255,255,255,0.05)] rounded-xl text-xs bg-[rgba(255,255,255,0.03)] text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 [&>option]:bg-[#121212] [&>option]:text-white"
                        >
                          <option value="Advanced">Advanced</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Beginner">Beginner</option>
                        </select>
                      </div>
                      <div className="flex items-end gap-2 pt-5">
                        <button
                          type="button"
                          onClick={() => setIsAddingSkill(false)}
                          className="text-xs px-3 py-2 text-slate-400 hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="text-xs px-4 py-2 bg-indigo-600/80 text-white font-bold rounded-xl hover:bg-indigo-600 transition-colors border border-indigo-500/50"
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
                        className="group relative bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-indigo-500/30 p-3.5 rounded-2xl flex items-center justify-between transition-all"
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-200 text-sm group-hover:text-white transition-colors">{skill.name}</span>
                          <span className={`text-[11px] font-bold mt-1 ${
                            skill.level === 'Advanced' ? 'text-emerald-400' :
                            skill.level === 'Intermediate' ? 'text-indigo-400' : 'text-slate-400'
                          }`}>
                            {skill.level} {skill.score > 0 ? `• Verified (${skill.score}%)` : ''}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          title="Remove skill from portfolio"
                          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-all"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center border border-dashed border-[rgba(255,255,255,0.1)] rounded-2xl">
                      <p className="text-xs text-slate-500">No skills selected for display.</p>
                      <button 
                        onClick={handleResetSkills}
                        className="text-xs text-indigo-400 font-semibold hover:text-indigo-300 mt-2"
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
                      className="text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      Show all {sortedAssessed.length} assessed skills
                    </button>
                  )}
                  {showAllSkills && (
                    <button 
                      onClick={() => setShowAllSkills(false)}
                      className="text-slate-400 hover:text-slate-300 font-medium"
                    >
                      Show only top skills
                    </button>
                  )}
                  {hiddenSkills.length > 0 && (
                    <button 
                      onClick={handleResetSkills}
                      className="text-slate-500 hover:text-slate-400 text-[11px] ml-auto"
                    >
                      Reset hidden ({hiddenSkills.length})
                    </button>
                  )}
                </div>
              </section>

              {/* Education */}
              <section>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <BookOpen className="text-indigo-400" /> Education
                </h2>
                <div className="space-y-6">
                  <div className="relative pl-5 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-indigo-500 before:rounded-full before:shadow-[0_0_8px_rgba(99,102,241,0.8)]">
                    <h3 className="font-bold text-slate-200">Current Degree</h3>
                    <p className="text-indigo-400 font-medium text-sm">University Student</p>
                    <p className="text-slate-500 text-xs mt-1 mb-2">Ongoing</p>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column (Projects & Experience) */}
            <div className="lg:col-span-2 space-y-10">
              {/* Document Vault / Projects */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Briefcase className="text-indigo-400" /> Document Vault & Projects
                  </h2>
                  <button
                    onClick={() => setIsAddingItem(!isAddingItem)}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 shadow-sm"
                  >
                    <Plus size={14} /> Add Item
                  </button>
                </div>

                {isAddingItem && (
                  <form onSubmit={handleAddPortfolioItem} className="mb-6 p-5 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-400 block mb-1.5">Title</label>
                        <input type="text" required value={newItemTitle} onChange={(e) => setNewItemTitle(e.target.value)} placeholder="e.g. AWS Cloud Certificate" className="w-full px-3 py-2 bg-[#121212] border border-[rgba(255,255,255,0.05)] rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 block mb-1.5">Category</label>
                        <select value={newItemType} onChange={(e) => setNewItemType(e.target.value)} className="w-full px-3 py-2 bg-[#121212] border border-[rgba(255,255,255,0.05)] rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500">
                          <option value="certificate">Certificate</option>
                          <option value="project">Project</option>
                          <option value="internship">Internship Report</option>
                          <option value="achievement">Achievement</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1.5">Description</label>
                      <textarea rows={2} required value={newItemDesc} onChange={(e) => setNewItemDesc(e.target.value)} placeholder="Briefly describe this item..." className="w-full px-3 py-2 bg-[#121212] border border-[rgba(255,255,255,0.05)] rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"></textarea>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1.5">Attach Document (PDF/Image)</label>
                      <input type="file" required onChange={(e) => setNewItemFile(e.target.files?.[0] || null)} className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20 transition-all cursor-pointer" />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button type="button" onClick={() => setIsAddingItem(false)} className="text-xs px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancel</button>
                      <button type="submit" disabled={uploadingItem} className="text-xs px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50">
                        {uploadingItem ? 'Uploading...' : 'Save Document'}
                      </button>
                    </div>
                  </form>
                )}

                {portfolioItems.length > 0 ? (
                  <div className="space-y-6">
                    {portfolioItems.map((item) => (
                      <div key={item.id} className="premium-card p-6 flex flex-col gap-2 group hover:-translate-y-1 transition-transform">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-white text-lg group-hover:text-indigo-300 transition-colors">{item.title}</h3>
                          <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold px-2.5 py-1 rounded-full uppercase">
                            {item.type}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm font-light leading-relaxed">{item.description}</p>
                        {item.file_url && (
                          <a href={item.file_url} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors mt-3 inline-flex items-center gap-1">
                            View Attachment <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 border border-dashed border-[rgba(255,255,255,0.1)] rounded-2xl text-center flex flex-col items-center justify-center bg-[rgba(255,255,255,0.01)]">
                    <div className="w-16 h-16 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-full flex items-center justify-center mb-5">
                      <Briefcase className="w-8 h-8 text-slate-500" />
                    </div>
                    <h3 className="text-white font-bold mb-2">Looking for Opportunities</h3>
                    <p className="text-slate-400 text-sm max-w-sm leading-relaxed">Check the Opportunities tab to find matched jobs and internships based on your AI assessment.</p>
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
