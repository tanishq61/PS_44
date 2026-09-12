'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { 
  Plus, 
  Briefcase, 
  Users, 
  ArrowRight,
  Clock,
  Search,
  Building2,
  X,
  Loader2
} from 'lucide-react'

export default function CompanyOpportunities() {
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const supabase = createClient()

  // Form State
  const [title, setTitle] = useState('')
  const [type, setType] = useState('job')
  const [description, setDescription] = useState('')
  const [skills, setSkills] = useState('')
  const [deadline, setDeadline] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadOpportunities()
  }, [])

  async function loadOpportunities() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    // If not authenticated (testing), we just fetch all for demo purposes, 
    // but in real app we filter by industry_id = user.id
    const query = supabase
      .from('opportunities')
      .select('*, applications(count)')
      .order('created_at', { ascending: false })
    
    // if (user) query.eq('industry_id', user.id) // Un-comment for strict user filtering
    
    const { data } = await query
    setOpportunities(data || [])
    setLoading(false)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const required_skills = skills.split(',').map(s => s.trim()).filter(Boolean)
    const { data: { user } } = await supabase.auth.getUser()

    try {
      const { data, error } = await supabase.from('opportunities').insert({
        title,
        type,
        description,
        required_skills,
        deadline: deadline || null,
        industry_id: user?.id || null // Works if RLS permits or if user exists
      }).select()

      if (error) throw error
      
      // Reset form
      setTitle('')
      setDescription('')
      setSkills('')
      setDeadline('')
      setShowCreateForm(false)
      loadOpportunities() // Reload list

    } catch (error) {
      console.error("Error creating opportunity:", error)
      alert("Failed to create opportunity. Check console.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="flex h-[50vh] items-center justify-center relative z-10">
      <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-400 rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 premium-card p-6 rounded-3xl">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            Opportunities
          </h1>
          <p className="text-slate-400 mt-1">Manage your job and internship postings.</p>
        </div>
        {!showCreateForm && (
          <button 
            onClick={() => setShowCreateForm(true)}
            className="premium-button-primary px-6 py-3"
          >
            <Plus size={18} /> Post Opportunity
          </button>
        )}
      </div>

      {/* Create Form Overlay */}
      {showCreateForm && (
        <div className="premium-card p-8 rounded-3xl">
          <div className="flex justify-between items-center mb-6 pb-6 border-b border-[rgba(255,255,255,0.05)]">
            <h2 className="text-2xl font-bold text-white">Create Opportunity</h2>
            <button onClick={() => setShowCreateForm(false)} className="p-2 text-slate-400 hover:bg-[#1a1a1a] rounded-full">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Title</label>
                <input 
                  required 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  className="premium-input" 
                  placeholder="e.g. Software Engineering Intern" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Type</label>
                <select 
                  value={type} 
                  onChange={e => setType(e.target.value)} 
                  className="premium-input"
                >
                  <option value="job" className="bg-[#0a0a0a]">Job</option>
                  <option value="internship" className="bg-[#0a0a0a]">Internship</option>
                  <option value="project" className="bg-[#0a0a0a]">Live Project</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Required Skills (Comma separated)</label>
              <input 
                required 
                value={skills} 
                onChange={e => setSkills(e.target.value)} 
                className="premium-input" 
                placeholder="e.g. React, TypeScript, UI Design" 
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Description</label>
              <textarea 
                rows={4} 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                className="premium-input resize-none" 
                placeholder="Describe the role and responsibilities..." 
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Application Deadline</label>
              <input 
                type="date" 
                value={deadline} 
                onChange={e => setDeadline(e.target.value)} 
                className="premium-input md:w-1/2" 
                style={{ colorScheme: 'dark' }}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[rgba(255,255,255,0.05)]">
              <button 
                type="button" 
                onClick={() => setShowCreateForm(false)}
                className="premium-button-secondary px-6 py-3"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={submitting}
                className="premium-button-primary px-8 py-3 disabled:opacity-70"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Publish Opportunity'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {!showCreateForm && (
        <div className="grid lg:grid-cols-2 gap-6">
          {opportunities.length === 0 ? (
            <div className="col-span-2 premium-card rounded-3xl p-12 flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No active postings</h3>
              <p className="text-slate-400 max-w-sm mb-6 text-center">You haven't created any opportunities yet. Create your first posting to start finding AI-matched talent.</p>
              <button 
                onClick={() => setShowCreateForm(true)}
                className="premium-button-primary px-6 py-3"
              >
                <Plus size={18} /> Post Your First Job
              </button>
            </div>
          ) : (
            opportunities.map((opp) => (
              <div key={opp.id} className="premium-card rounded-3xl p-6 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{opp.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-slate-400 font-medium">
                      <span className="flex items-center gap-1 bg-[#0a0a0a] border border-[rgba(255,255,255,0.05)] px-2.5 py-1 rounded-md text-slate-300">
                        <Briefcase size={14} /> {opp.type}
                      </span>
                      {opp.deadline && (
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock size={14} /> Due {new Date(opp.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg text-xs font-bold flex flex-col items-center">
                    <span className="text-lg">{opp.applications?.[0]?.count || 0}</span>
                    Applicants
                  </div>
                </div>

                <p className="text-slate-400 text-sm mb-6 line-clamp-2 flex-1">
                  {opp.description || "No description provided."}
                </p>

                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Skills</div>
                    <div className="flex flex-wrap gap-2">
                      {opp.required_skills?.map((skill: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs font-medium rounded-lg">
                          {skill}
                        </span>
                      ))}
                      {!opp.required_skills?.length && <span className="text-sm text-slate-500 italic">None specified</span>}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[rgba(255,255,255,0.05)] flex justify-end">
                    <Link 
                      href={`/company/opportunities/${opp.id}`}
                      className="text-blue-400 font-bold text-sm flex items-center gap-1 hover:text-blue-300 transition-colors"
                    >
                      View Details & Applicants <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
