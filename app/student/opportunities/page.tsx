'use client'

import { useState } from 'react'
import { Search, Building2, MapPin, DollarSign, Briefcase, Star, Clock, Sparkles, Filter } from 'lucide-react'

// Mock Data for Opportunities
const mockJobs = [
  {
    id: 1,
    title: 'Frontend Developer Intern',
    company: 'TechNova Solutions',
    location: 'Remote',
    stipend: '$3k - $4k / month',
    type: 'Internship',
    posted: '2 days ago',
    matchScore: 92,
    skills: ['React', 'TypeScript', 'Tailwind CSS'],
    description: 'We are looking for an enthusiastic frontend intern to join our core product team. You will be building user interfaces for our new AI-driven analytics dashboard.',
  },
  {
    id: 2,
    title: 'Full Stack Engineer (Entry Level)',
    company: 'Nexus Dynamics',
    location: 'San Francisco, CA',
    stipend: '$90k - $120k / year',
    type: 'Full-time',
    posted: '5 hours ago',
    matchScore: 85,
    skills: ['Node.js', 'React', 'PostgreSQL'],
    description: 'Join Nexus Dynamics to build scalable backend services and responsive frontend applications. Perfect for recent graduates with strong foundation in JavaScript.',
  },
  {
    id: 3,
    title: 'UI/UX Design Intern',
    company: 'CreativePulse',
    location: 'New York, NY (Hybrid)',
    stipend: '$2.5k / month',
    type: 'Internship',
    posted: '1 week ago',
    matchScore: 45,
    skills: ['Figma', 'Prototyping', 'User Research'],
    description: 'Help us design the next generation of creative tools. You will work closely with our senior designers and product managers.',
  }
]

export default function OpportunitiesPage() {
  const [selectedJob, setSelectedJob] = useState(mockJobs[0])
  const [searchQuery, setSearchQuery] = useState('')

  const filteredJobs = mockJobs.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    job.company.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Opportunities</h1>
          <p className="text-slate-500 mt-1">AI-matched internships and jobs based on your skills.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search roles, companies..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
            />
          </div>
          <button className="flex items-center justify-center p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors shadow-sm">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6">
        {/* Jobs List */}
        <div className="w-full lg:w-5/12 xl:w-1/3 flex flex-col gap-4 overflow-y-auto pr-2 pb-8 custom-scrollbar">
          {filteredJobs.map(job => (
            <div 
              key={job.id} 
              onClick={() => setSelectedJob(job)}
              className={`
                p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden
                ${selectedJob.id === job.id 
                  ? 'bg-indigo-50/50 border-indigo-200 shadow-md ring-1 ring-indigo-500/20' 
                  : 'bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100'
                }
              `}
            >
              {selectedJob.id === job.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
              )}
              
              <div className="flex justify-between items-start mb-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-indigo-600">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                  job.matchScore >= 80 ? 'bg-emerald-100 text-emerald-700' : 
                  job.matchScore >= 60 ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  <Sparkles className="w-3 h-3" />
                  {job.matchScore}% Match
                </div>
              </div>
              
              <h3 className="font-bold text-slate-800 text-lg mb-1">{job.title}</h3>
              <p className="text-slate-500 text-sm font-medium mb-4">{job.company}</p>
              
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/> {job.location}</span>
                <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5"/> {job.type}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> {job.posted}</span>
              </div>
            </div>
          ))}
          {filteredJobs.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No opportunities found matching your search.
            </div>
          )}
        </div>

        {/* Job Details */}
        <div className="hidden lg:flex flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex-col">
          {selectedJob ? (
            <div className="flex-1 overflow-y-auto">
              {/* Header */}
              <div className="p-8 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white relative">
                <div className="absolute top-8 right-8 w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-500 transform rotate-3">
                  <Building2 className="w-10 h-10" />
                </div>
                
                <div className={`inline-flex px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 mb-6 ${
                  selectedJob.matchScore >= 80 ? 'bg-emerald-100 text-emerald-700' : 
                  selectedJob.matchScore >= 60 ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  <Sparkles className="w-4 h-4" />
                  {selectedJob.matchScore}% AI Match based on your skill profile
                </div>
                
                <h2 className="text-3xl font-bold text-slate-800 mb-2">{selectedJob.title}</h2>
                <p className="text-xl text-indigo-600 font-medium mb-6">{selectedJob.company}</p>
                
                <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-600">
                  <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg"><MapPin className="w-4 h-4 text-slate-400"/> {selectedJob.location}</div>
                  <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg"><Briefcase className="w-4 h-4 text-slate-400"/> {selectedJob.type}</div>
                  <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg"><DollarSign className="w-4 h-4 text-slate-400"/> {selectedJob.stipend}</div>
                </div>
              </div>

              {/* Body */}
              <div className="p-8 space-y-8">
                <section>
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-indigo-500" /> Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.skills.map((skill, idx) => (
                      <span key={idx} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-semibold border border-indigo-100">
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-slate-800 mb-4">About the Role</h3>
                  <p className="text-slate-600 leading-relaxed">
                    {selectedJob.description}
                  </p>
                  <p className="text-slate-600 leading-relaxed mt-4">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>
                </section>

                <div className="pt-8 flex gap-4">
                  <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] hover:-translate-y-0.5">
                    Apply Now
                  </button>
                  <button className="px-6 py-3.5 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl font-bold transition-colors">
                    Save for later
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <Briefcase className="w-16 h-16 mb-4 text-slate-200" />
              <p className="text-lg font-medium">Select an opportunity to view details</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Add custom scrollbar styles inline for convenience */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }
      `}} />
    </div>
  )
}
