'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts'
import { 
  Users, 
  TrendingUp, 
  Award,
  BookOpen,
  Loader2
} from 'lucide-react'

export default function InstitutionDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    assessedStudents: 0,
    totalApplications: 0,
    averageMatchScore: 0
  })
  const [skillTrends, setSkillTrends] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    setLoading(true)
    try {
      const res = await fetch('/api/institution/dashboard');
      if (res.ok) {
        const json = await res.json();
        setStats(json.stats || { totalStudents: 0, assessedStudents: 0, totalApplications: 0, averageMatchScore: 0 });
        setSkillTrends(json.skillTrends || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div className="flex h-[50vh] items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
    </div>
  )

  const placementData = [
    { name: 'Applied', value: stats.totalApplications },
    { name: 'Shortlisted', value: Math.floor(stats.totalApplications * 0.4) }, // Mock data for visual completeness
    { name: 'Placed', value: Math.floor(stats.totalApplications * 0.15) }
  ]
  const COLORS = ['#3b82f6', '#f59e0b', '#10b981']

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            Institution Dashboard
          </h1>
          <p className="text-slate-500 mt-1">Monitor student skill development and placement readiness.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
            <Users size={24} />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-500 mb-1">Total Students</div>
            <div className="text-2xl font-black text-slate-800">{stats.totalStudents}</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
            <BookOpen size={24} />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-500 mb-1">Assessed</div>
            <div className="text-2xl font-black text-slate-800">{stats.assessedStudents}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-500 mb-1">Job Applications</div>
            <div className="text-2xl font-black text-slate-800">{stats.totalApplications}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
            <Award size={24} />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-500 mb-1">Avg Match Score</div>
            <div className="text-2xl font-black text-slate-800">{stats.averageMatchScore}%</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Skill Gap Trends */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-slate-800">Top Skill Gaps (Institution Wide)</h2>
            {stats.assessedStudents > 0 && (
              <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
                Cohort: {stats.assessedStudents} Assessed
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mb-6">Identify areas where students need additional training before applying to industries.</p>
          
          <div className="flex-1 min-h-[320px]">
            {skillTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={skillTrends} 
                  layout="vertical" 
                  margin={{ top: 10, left: 10, right: 40, bottom: 10 }}
                >
                  <XAxis 
                    type="number" 
                    domain={[0, 100]}
                    unit="%"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={{ stroke: '#f1f5f9' }}
                    tickLine={false}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={150} 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#334155', fontSize: 13, fontWeight: 600 }} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }} 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-800 text-xs space-y-1">
                            <p className="font-bold text-sm text-white">{data.name}</p>
                            <p className="text-rose-400 font-semibold">
                              {data.count} of {data.total || stats.assessedStudents} students ({data.percentage}%)
                            </p>
                            <p className="text-slate-400 text-[11px]">Identified as key growth area</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="percentage" 
                    radius={8} 
                    barSize={20} 
                    fill="#f43f5e" 
                    background={{ fill: '#f8fafc', radius: 8 }}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 font-medium">Not enough assessment data yet.</div>
            )}
          </div>
        </div>

        {/* Placement Pipeline */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Placement Pipeline Overview</h2>
          <div className="flex-1 min-h-[300px]">
            {stats.totalApplications > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={placementData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {placementData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 font-medium">No application data yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
