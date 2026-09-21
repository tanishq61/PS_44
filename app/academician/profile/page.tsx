'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { UserCircle, BookOpen, Building2, Plus, ExternalLink, Trash2 } from 'lucide-react'

export default function AcademicianProfile() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const [portfolio, setPortfolio] = useState<any[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        setProfile({ ...data, email: user.email })
        
        const { data: items } = await supabase
          .from('portfolio_items')
          .select('*')
          .eq('student_id', user.id)
          .order('created_at', { ascending: false })
        if (items) setPortfolio(items)
      }
      setLoading(false)
    }
    loadData()
  }, [])

  const handleAddResearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle || !newUrl) return
    setIsAdding(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data, error } = await supabase.from('portfolio_items').insert({
        student_id: user.id,
        title: newTitle,
        type: 'project',
        description: 'Research Profile / Publication',
        file_url: newUrl
      }).select()

      if (data) {
        setPortfolio([data[0], ...portfolio])
        setNewTitle('')
        setNewUrl('')
      }
    }
    setIsAdding(false)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('portfolio_items').delete().eq('id', id)
    setPortfolio(portfolio.filter(p => p.id !== id))
  }

  if (loading) return (
    <div className="flex h-[50vh] items-center justify-center relative z-10">
      <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-400 rounded-full animate-spin"></div>
    </div>
  )

  if (!profile) return null

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative z-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 premium-card p-6 rounded-3xl">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            Academic Profile
          </h1>
          <p className="text-slate-400 mt-1">Manage your personal details and academic credentials.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="premium-card p-8 rounded-3xl text-center flex flex-col items-center">
            <div className="w-24 h-24 bg-orange-500/10 text-orange-400 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
              <UserCircle size={48} />
            </div>
            <h2 className="text-2xl font-bold text-white">{profile.full_name || 'Professor'}</h2>
            <p className="text-orange-400 font-semibold mb-1">Academician (Faculty)</p>
            <p className="text-sm text-slate-500">{profile.email}</p>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="premium-card p-8 rounded-3xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Building2 className="text-orange-400" /> Professional Details
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Organization / College</label>
                <div className="px-4 py-3 bg-[#0a0a0a] border border-[rgba(255,255,255,0.05)] rounded-xl text-slate-200 font-medium">
                  {profile.org_name || 'Not provided'}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Account Role</label>
                <div className="px-4 py-3 bg-[#0a0a0a] border border-[rgba(255,255,255,0.05)] rounded-xl text-slate-200 font-medium capitalize">
                  {profile.role}
                </div>
              </div>
            </div>
          </div>
          
          <div className="premium-card p-8 rounded-3xl">
             <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
               <BookOpen className="text-orange-400" /> Publications & Research
             </h3>
             
             {/* List existing research/profiles */}
             <div className="space-y-4 mb-8">
               {portfolio.length === 0 ? (
                 <p className="text-slate-400 text-sm italic">No research profiles added yet.</p>
               ) : (
                 portfolio.map(item => (
                   <div key={item.id} className="flex items-center justify-between p-4 bg-[#0a0a0a] border border-[rgba(255,255,255,0.05)] rounded-xl">
                     <div>
                       <h4 className="font-bold text-slate-200">{item.title}</h4>
                       <a href={item.file_url} target="_blank" rel="noreferrer" className="text-sm text-orange-400 hover:underline flex items-center gap-1 mt-1">
                         <ExternalLink size={14} /> View Link
                       </a>
                     </div>
                     <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-500 hover:text-red-400 transition-colors">
                       <Trash2 size={18} />
                     </button>
                   </div>
                 ))
               )}
             </div>

             {/* Add New */}
             <div className="border-t border-[rgba(255,255,255,0.05)] pt-6">
               <h4 className="font-bold text-slate-300 mb-4 text-sm">Add Google Scholar / ORCID / Publication Link</h4>
               <form onSubmit={handleAddResearch} className="space-y-4">
                 <div>
                   <input
                     type="text"
                     placeholder="Title (e.g., Google Scholar Profile)"
                     required
                     value={newTitle}
                     onChange={e => setNewTitle(e.target.value)}
                     className="flex h-10 w-full rounded-md border border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                   />
                 </div>
                 <div>
                   <input
                     type="url"
                     placeholder="URL (https://...)"
                     required
                     value={newUrl}
                     onChange={e => setNewUrl(e.target.value)}
                     className="flex h-10 w-full rounded-md border border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                   />
                 </div>
                 <button
                   type="submit"
                   disabled={isAdding}
                   className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
                 >
                   <Plus size={16} /> {isAdding ? 'Adding...' : 'Add Link'}
                 </button>
               </form>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
