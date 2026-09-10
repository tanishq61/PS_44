'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Building2, 
  Briefcase, 
  Users, 
  TrendingUp, 
  ArrowRight, 
  MapPin, 
  Clock,
  Sparkles
} from 'lucide-react'

// Dummy data for dashboard
const dashboardStats = {
  activePostings: 3,
  totalApplicants: 42,
  newMatches: 12,
  interviewing: 5
}

const recentPostings = [
  { id: 1, title: 'Frontend Developer', type: 'Job', applicants: 15, daysLeft: 5, status: 'Active' },
  { id: 2, title: 'UX Design Intern', type: 'Internship', applicants: 24, daysLeft: 12, status: 'Active' },
  { id: 3, title: 'Data Analyst', type: 'Job', applicants: 3, daysLeft: 20, status: 'Active' },
]

export default function CompanyDashboard() {
  const [userName] = useState<string>('TechCorp Inc.')

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {/* Welcome Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 md:p-12 text-white shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Building2 className="w-64 h-64 text-blue-500" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
            <Sparkles size={14} /> AI Talent Matching Active
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-slate-100">
            Welcome back, {userName}
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-8 font-light">
            You have {dashboardStats.newMatches} new high-match candidates for your active postings.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/company/opportunities" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] hover:-translate-y-0.5"
            >
              Post New Opportunity
            </Link>
            <Link 
              href="/company/candidates" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium transition-all duration-300"
            >
              Review Matches <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between transition-all hover:shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Briefcase className="w-6 h-6" />
            </div>
            <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
              <TrendingUp size={12} className="mr-1"/> Active
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-800">{dashboardStats.activePostings}</h3>
            <p className="text-sm font-medium text-slate-500">Active Postings</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between transition-all hover:shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-800">{dashboardStats.totalApplicants}</h3>
            <p className="text-sm font-medium text-slate-500">Total Applicants</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between transition-all hover:shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="flex items-center text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
              High Match
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-800">{dashboardStats.newMatches}</h3>
            <p className="text-sm font-medium text-slate-500">New AI Matches</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between transition-all hover:shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-800">{dashboardStats.interviewing}</h3>
            <p className="text-sm font-medium text-slate-500">In Interview</p>
          </div>
        </div>
      </section>

      {/* Recent Postings List */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Your Active Postings</h2>
            <p className="text-slate-500 mt-1 text-sm">Manage your jobs and internships</p>
          </div>
          <Link href="/company/opportunities" className="text-blue-600 font-semibold text-sm hover:text-blue-800 transition-colors">
            View All
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm font-semibold">
                  <th className="p-4 pl-6">Role</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Applicants</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentPostings.map((job, index) => (
                  <tr key={job.id} className={`group hover:bg-slate-50 transition-colors ${index !== recentPostings.length - 1 ? 'border-b border-slate-100' : ''}`}>
                    <td className="p-4 pl-6">
                      <div className="font-bold text-slate-800">{job.title}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Clock size={12} /> {job.daysLeft} days left
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${job.type === 'Job' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'}`}>
                        {job.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-slate-400" />
                        <span className="font-semibold text-slate-700">{job.applicants}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-50 border border-blue-100 text-blue-600">
                        {job.status}
                      </span>
                    </td>
                    <td className="p-4 text-right pr-6">
                      <Link 
                        href={`/company/opportunities/${job.id}`}
                        className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <ArrowRight size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
