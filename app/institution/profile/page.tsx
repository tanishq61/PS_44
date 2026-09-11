'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Building2, Mail, Save, Loader2, Sparkles } from 'lucide-react'

export default function InstitutionProfile() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [orgName, setOrgName] = useState('')
  const [website, setWebsite] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (prof) {
          setProfile(prof)
          setOrgName(prof.org_name || prof.full_name || '')
          setWebsite(prof.website || '')
        } else {
          // fallback if not in profiles yet
          setProfile({ id: user.id, email: user.email })
          setOrgName(user.user_metadata?.org_name || '')
        }
      }
      setLoading(false)
    }
    loadProfile()
  }, [])

  async function handleSave() {
    if (!profile) return
    setSaving(true)
    setSuccessMsg('')
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          org_name: orgName,
          full_name: orgName, // mirror for consistency
          website: website,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)

      if (error) throw error
      setSuccessMsg('Profile updated successfully.')
    } catch (error: any) {
      console.error('Error updating profile:', error)
      alert(error.message || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex h-[50vh] items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
          <Building2 className="text-blue-600" /> Institution Profile
        </h1>
        <p className="text-slate-500 mt-1">Manage your institution details and settings.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
        {successMsg && (
          <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-semibold flex items-center gap-2 border border-emerald-100">
            <Sparkles size={16} /> {successMsg}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Institution Name</label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm font-medium transition-all"
              placeholder="e.g. University of Technology"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Account Email (Read Only)</label>
            <div className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-sm font-medium flex items-center gap-2 cursor-not-allowed">
              <Mail size={16} /> {profile?.email || 'N/A'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Website</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm font-medium transition-all"
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-sm disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
