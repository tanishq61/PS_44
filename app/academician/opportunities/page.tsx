'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { 
  Briefcase, 
  Clock, 
  MapPin, 
  Building2,
  Search,
  BookOpen
} from 'lucide-react'

export default function AcademicianOpportunities() {
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [applications, setApplications] = useState<string[]>([])
  const [applyingTo, setApplyingTo] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

      // Fetch opportunities that match academician interests
      const { data: opps } = await supabase
        .from('opportunities')
        .select('*, profiles(org_name)')
        .in('type', ['fdp', 'consultancy', 'research', 'internship'])
        .order('created_at', { ascending: false })

    if (user) {
      const { data: apps } = await supabase
        .from('applications')
        .select('opportunity_id')
        .eq('student_id', user.id) // note: student_id column is just the generic applicant id
      
      if (apps) {
        setApplications(apps.map(a => a.opportunity_id))
      }
    }

    setOpportunities(opps || [])
    setLoading(false)
  }

  const handleApply = async (opportunity: any) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert("Please log in to apply.")
      return
    }

    setErrorMsg(null)
    setApplyingTo(opportunity.id)

    try {
      const res = await fetch('/api/academician/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunity_id: opportunity.id })
      })
      
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to apply')
      }

      setApplications([...applications, opportunity.id])
    } catch (error: any) {
      console.error("Error applying:", error)
      setErrorMsg(`Failed to apply: ${error.message}`)
    } finally {
      setApplyingTo(null)
    }
  }

  // Filter opportunities based on search query
  const filteredOpportunities = opportunities.filter(opp => {
    if (!searchQuery) return true
    const searchLower = searchQuery.toLowerCase()
    return (
      opp.title?.toLowerCase().includes(searchLower) ||
      opp.type?.toLowerCase().includes(searchLower) ||
      opp.profiles?.org_name?.toLowerCase().includes(searchLower)
    )
  })

  if (loading) return (
    <div className="flex h-[50vh] items-center justify-center relative z-10">
      <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-400 rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 z-10 relative">
      {/* Header */}
      <div className="premium-card p-8 md:p-12 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <BookOpen className="w-64 h-64 text-orange-400" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-white">
            Academician Network
          </h1>
          <p className="text-lg md:text-xl text-slate-400 font-light max-w-2xl mb-8">
            Browse and apply for Faculty Development Programs (FDPs), industry internships, consultancy roles, and corporate-funded research projects.
          </p>
          
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search FDPs, consultancies, institutes..." 
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:bg-[rgba(255,255,255,0.05)] transition-all shadow-lg"
            />
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl flex items-center justify-between">
          <p className="font-bold">{errorMsg}</p>
          <button onClick={() => setErrorMsg(null)}>X</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredOpportunities.length > 0 ? (
          filteredOpportunities.map(opp => (
            <div key={opp.id} className="premium-card p-6 flex flex-col group hover:-translate-y-1 transition-transform border border-transparent hover:border-orange-500/30">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors">{opp.title}</h3>
                  <div className="flex items-center gap-2 text-slate-400 mt-2">
                    <Building2 size={16} />
                    <span className="font-medium text-slate-300">{opp.profiles?.org_name || 'Anonymous Org'}</span>
                  </div>
                </div>
                <div className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {opp.type}
                </div>
              </div>
              
              <p className="text-slate-400 text-sm mb-6 flex-1 line-clamp-3">
                {opp.description || 'No description provided.'}
              </p>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[rgba(255,255,255,0.05)]">
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <MapPin size={14} /> {opp.location || 'Remote'}
                  </div>
                  {opp.duration && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Clock size={14} /> {opp.duration}
                    </div>
                  )}
                </div>
                
                {applications.includes(opp.id) ? (
                  <button 
                    disabled
                    className="premium-button-secondary bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-6 py-2.5 text-sm w-full sm:w-auto opacity-100"
                  >
                    Applied ✓
                  </button>
                ) : (
                  <button 
                    onClick={() => handleApply(opp)}
                    disabled={applyingTo === opp.id}
                    className="premium-button-primary bg-orange-600 hover:bg-orange-700 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] px-6 py-2.5 text-sm w-full sm:w-auto disabled:opacity-50"
                  >
                    {applyingTo === opp.id ? 'Applying...' : 'Apply Now'}
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-1 lg:col-span-2 premium-card p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No opportunities found</h3>
            <p className="text-slate-400 max-w-md mx-auto">
              {searchQuery 
                ? `No postings match your search for "${searchQuery}". Try different keywords.` 
                : "There are currently no FDPs or Consultancy roles posted by the industry. Please check back later."}
            </p>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-6 text-orange-400 font-semibold hover:text-orange-300"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
