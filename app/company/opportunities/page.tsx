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
    const query = supabase.from('opportunities').select('*').order('created_at', { ascending: false })
    
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
    <div className="flex h-[50vh] items-center justify-center">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            Opportunities
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Manage your job and internship postings.</p>
        </div>
        {!showCreateForm && (
          <button 
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            <Plus size={18} /> Post Opportunity
          </button>
        )}
      </div>

      {/* Create Form Overlay */}
      {showCreateForm && (
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200 animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Create New Posting</h2>
            <button onClick={() => setShowCreateForm(false)} className="text-slate-400 hover:text-slate-600 p-2 bg-slate-50 rounded-full">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Job Title</label>
                <input 
                  required 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  placeholder="e.g. Senior Frontend Developer" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Opportunity Type</label>
                <select 
                  value={type} 
                  onChange={e => setType(e.target.value)} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
                >
                  <option value="job">Full-time Job</option>
                  <option value="internship">Internship</option>
                  <option value="course">Course</option>
                  <option value="workshop">Workshop</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Required Skills (Comma separated)</label>
              <input 
                required 
                value={skills} 
                onChange={e => setSkills(e.target.value)} 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                placeholder="e.g. React, TypeScript, UI Design" 
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
              <textarea 
                rows={4} 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" 
                placeholder="Describe the role and responsibilities..." 
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Application Deadline</label>
              <input 
                type="date" 
                value={deadline} 
                onChange={e => setDeadline(e.target.value)} 
                className="w-full md:w-1/2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" 
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-3 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={submitting}
                className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-70"
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
            <div className="col-span-2 bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No active postings</h3>
              <p className="text-slate-500 max-w-sm mb-6">You haven't created any opportunities yet. Create your first posting to start finding AI-matched talent.</p>
              <button 
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all"
              >
                <Plus size={18} /> Post Your First Job
              </button>
            </div>
          ) : (
            opportunities.map((opp) => (
              <div key={opp.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1">{opp.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                      <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md text-slate-700">
                        <Briefcase size={14} /> {opp.type}
                      </span>
                      {opp.deadline && (
                        <span className="flex items-center gap-1">
                          <Clock size={14} /> Due {new Date(opp.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold flex flex-col items-center">
                    <span className="text-lg">0</span>
                    Applicants
                  </div>
                </div>

                <p className="text-slate-600 text-sm mb-6 line-clamp-2 flex-1">
                  {opp.description || "No description provided."}
                </p>

                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Target Skills</div>
                    <div className="flex flex-wrap gap-2">
                      {(opp.required_skills || []).map((skill: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <Link 
                      href={`/company/opportunities/${opp.id}`}
                      className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 group"
                    >
                      View Details & Matches
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
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
