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
    <div className="flex h-[50vh] items-center justify-center relative z-10">
      <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-400 rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Building2 className="text-blue-400" /> Institution Profile
        </h1>
        <p className="text-slate-400 mt-1">Manage your institution details and settings.</p>
      </div>

      <div className="premium-card p-8 rounded-3xl space-y-6">
        {successMsg && (
          <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-xl text-sm font-semibold flex items-center gap-2 border border-emerald-500/20">
            <Sparkles size={16} /> {successMsg}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-1">Institution Name</label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="premium-input"
              placeholder="e.g. University of Technology"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-1">Account Email (Read Only)</label>
            <div className="w-full px-4 py-3 bg-[#0a0a0a] border border-[rgba(255,255,255,0.05)] rounded-xl text-slate-500 text-sm font-medium flex items-center gap-2 cursor-not-allowed">
              <Mail size={16} /> {profile?.email || 'N/A'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-1">Website</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="premium-input"
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="pt-6 border-t border-[rgba(255,255,255,0.05)]">
          <button
            onClick={handleSave}
            disabled={saving}
            className="premium-button-primary px-6 py-3 disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
