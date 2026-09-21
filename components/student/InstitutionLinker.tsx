'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Building2, CheckCircle2, Loader2 } from 'lucide-react'

export default function InstitutionLinker({ currentInstitutionId, studentId }: { currentInstitutionId: string | null, studentId: string }) {
  const [institutions, setInstitutions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(currentInstitutionId)
  const supabase = createClient()

  useEffect(() => {
    async function loadInstitutions() {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, org_name')
        .eq('role', 'institution')
      
      setInstitutions(data || [])
      setLoading(false)
    }
    loadInstitutions()
  }, [])

  const handleSave = async (id: string) => {
    setSaving(true)
    await supabase.from('profiles').update({ institution_id: id }).eq('id', studentId)
    setSelectedId(id)
    setSaving(false)
  }

  if (loading) return null;

  return (
    <div className="glass-panel p-6 mt-8 mb-8 border border-[rgba(255,255,255,0.05)] rounded-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
          <Building2 className="text-indigo-400 w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">University / Institution Link</h2>
          <p className="text-sm text-slate-400">Link your profile to your college so they can track your progress.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <select 
          className="w-full sm:w-[300px] bg-[#121212] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
          value={selectedId || ''}
          onChange={(e) => handleSave(e.target.value)}
          disabled={saving}
        >
          <option value="" disabled>Select your institution...</option>
          {institutions.map(inst => (
             <option key={inst.id} value={inst.id}>
               {inst.org_name || inst.full_name || 'Unknown Institution'}
             </option>
          ))}
        </select>
        
        {saving && <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />}
        {selectedId && !saving && (
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" /> Linked Successfully
          </div>
        )}
      </div>
    </div>
  )
}
