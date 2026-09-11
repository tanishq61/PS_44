'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { 
  Building2, 
  User, 
  Settings, 
  Save, 
  Loader2, 
  CheckCircle2 
} from 'lucide-react'

export default function CompanyProfilePage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const supabase = createClient()

  // Profile Fields
  const [orgName, setOrgName] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [domain, setDomain] = useState('Technology & Software')

  // Settings Fields
  const [minMatchScore, setMinMatchScore] = useState(70)
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [autoShortlist, setAutoShortlist] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      setEmail(user.email || '')

      // 1. Fetch profile
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (prof) {
        setOrgName(prof.org_name || '')
        setFullName(prof.full_name || '')
      }

      // 2. Load stored settings / extra fields
      const stored = localStorage.getItem(`company_settings_${user.id}`)
      if (stored) {
        try {
          const s = JSON.parse(stored)
          if (s.domain) setDomain(s.domain)
          if (s.minMatchScore !== undefined) setMinMatchScore(s.minMatchScore)
          if (s.emailAlerts !== undefined) setEmailAlerts(s.emailAlerts)
          if (s.autoShortlist !== undefined) setAutoShortlist(s.autoShortlist)
        } catch (e) {
          console.error(e)
        }
      }
    }
    setLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSavedSuccess(false)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Save profile in Supabase
        await supabase
          .from('profiles')
          .update({
            org_name: orgName,
            full_name: fullName,
          })
          .eq('id', user.id)

        // Save settings in local storage
        localStorage.setItem(`company_settings_${user.id}`, JSON.stringify({
          domain,
          minMatchScore,
          emailAlerts,
          autoShortlist
        }))
      }

      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 3000)
    } catch (err) {
      console.error('Error saving:', err)
      alert('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="w-8 h-8 border-3 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Organization Profile</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage your company credentials and hiring settings.</p>
      </div>

      {/* Clean Segmented Tab Switcher */}
      <div className="flex bg-slate-200/80 p-1 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => { setActiveTab('profile'); setSavedSuccess(false); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'profile'
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 size={15} /> Profile
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('settings'); setSavedSuccess(false); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'settings'
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Settings size={15} /> Settings
        </button>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSave} className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        {activeTab === 'profile' ? (
          /* PROFILE SECTION */
          <div className="space-y-4">
            {/* Header Identity */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                {orgName ? orgName.charAt(0).toUpperCase() : <Building2 size={22} />}
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">{orgName || 'Organization Name'}</h2>
                <p className="text-xs text-slate-400">{email}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Organization Name
              </label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Contact Person
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Tanishq Sharma"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Industry Domain
              </label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g. Software & Technology"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Registered Email
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-sm cursor-not-allowed"
              />
            </div>
          </div>
        ) : (
          /* SETTINGS SECTION */
          <div className="space-y-5">
            {/* Match Threshold Slider */}
            <div className="space-y-3 pb-5 border-b border-slate-100">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">Minimum AI Match Threshold</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Highlight candidates who meet or exceed this skill match percentage.</p>
                </div>
                <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                  {minMatchScore}%
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={minMatchScore}
                onChange={(e) => setMinMatchScore(Number(e.target.value))}
                className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>0% (All)</span>
                <span>70% (Standard)</span>
                <span>90%+ (Top Tier)</span>
              </div>
            </div>

            {/* Notification & Filter Toggles */}
            <div className="space-y-3.5">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-blue-600 rounded cursor-pointer"
                />
                <div>
                  <div className="text-xs font-semibold text-slate-700">Email notifications</div>
                  <div className="text-xs text-slate-400 mt-0.5">Receive an email alert when a student applies.</div>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoShortlist}
                  onChange={(e) => setAutoShortlist(e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-blue-600 rounded cursor-pointer"
                />
                <div>
                  <div className="text-xs font-semibold text-slate-700">Auto-shortlist 90%+ matches</div>
                  <div className="text-xs text-slate-400 mt-0.5">Automatically mark high-compatibility applicants as Shortlisted.</div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Action Button & Confirmation */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div>
            {savedSuccess && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 animate-in fade-in">
                <CheckCircle2 size={15} /> Saved successfully
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
