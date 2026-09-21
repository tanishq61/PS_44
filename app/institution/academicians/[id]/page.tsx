'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { 
  ArrowLeft, 
  BookOpen, 
  Building2, 
  UserCircle,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'

export default function AcademicianProfileView() {
  const params = useParams()
  const id = params?.id as string

  const [profile, setProfile] = useState<any>(null)
  const [portfolio, setPortfolio] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadAcademician() {
      let targetId = id

      if (!targetId || targetId === 'undefined' || targetId === 'candidate') {
        setLoading(false)
        return
      }
      
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetId)
        .maybeSingle()
      
      if (prof) {
        setProfile(prof)
        
        const { data: items } = await supabase
          .from('portfolio_items')
          .select('*')
          .eq('student_id', prof.id)
          .order('created_at', { ascending: false })
          
        if (items) setPortfolio(items)
      } 
      
      setLoading(false)
    }

    loadAcademician()
  }, [id])

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center">Loading academician profile...</div>
  }

  if (!profile) {
    return (
      <div className="flex flex-col h-[50vh] items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold">Academician Not Found</h2>
        <Link href="/institution/opportunities" className="text-emerald-400 hover:underline">Return to opportunities</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link href="/institution/opportunities" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-400 transition-colors">
        <ArrowLeft size={16} /> Back to Opportunities
      </Link>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="premium-card p-8 rounded-3xl text-center flex flex-col items-center">
            <div className="w-24 h-24 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <UserCircle size={48} />
            </div>
            <h2 className="text-2xl font-bold text-white">{profile.full_name || 'Anonymous Faculty'}</h2>
            <p className="text-emerald-400 font-semibold mb-1">Academician (Faculty)</p>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="premium-card p-8 rounded-3xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Building2 className="text-emerald-400" /> Professional Details
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Currently teaching in (College/University)</label>
                <div className="px-4 py-3 bg-[#0a0a0a] border border-[rgba(255,255,255,0.05)] rounded-xl text-slate-200 font-medium">
                  {profile.org_name || 'Not provided'}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Account Role</label>
                <div className="px-4 py-3 bg-[#0a0a0a] border border-[rgba(255,255,255,0.05)] rounded-xl text-slate-200 font-medium capitalize">
                  {profile.role || 'academician'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="premium-card p-8 rounded-3xl">
             <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
               <BookOpen className="text-emerald-400" /> Publications & Research
             </h3>
             
             {portfolio.length === 0 ? (
               <p className="text-slate-400 text-sm italic">This academician has not added any research profiles yet.</p>
             ) : (
               <div className="space-y-4">
                 {portfolio.map(item => (
                   <div key={item.id} className="p-4 bg-[#0a0a0a] border border-[rgba(255,255,255,0.05)] rounded-xl">
                     <h4 className="font-bold text-slate-200">{item.title}</h4>
                     <a href={item.file_url} target="_blank" rel="noreferrer" className="text-sm text-emerald-400 hover:underline flex items-center gap-1 mt-2 inline-flex">
                       <ExternalLink size={14} /> View Link
                     </a>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  )
}
