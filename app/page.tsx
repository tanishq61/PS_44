import Link from 'next/link'
import { ArrowRight, GraduationCap, Briefcase, Building2, BookOpen } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-blue-50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-blue-950">
                  Academia-Industry Collaboration Portal
                </h1>
                <p className="mx-auto max-w-[700px] text-blue-800 md:text-xl">
                  Connecting students, academicians, industry, and institutions for skill mapping, live projects, internships, and placements across all disciplines.
                </p>
              </div>
              <div className="space-x-4 pt-4">
                <Link
                  href="/signup"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-blue-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-700 disabled:pointer-events-none disabled:opacity-50"
                >
                  Get Started
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-11 items-center justify-center rounded-md border border-blue-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-blue-100 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-950 disabled:pointer-events-none disabled:opacity-50"
                >
                  Log In
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 bg-blue-100 rounded-full">
                  <GraduationCap className="h-10 w-10 text-blue-700" />
                </div>
                <h2 className="text-xl font-bold">For Students</h2>
                <p className="text-gray-500 text-sm">
                  Take AI-powered skill assessments, build your digital portfolio, and discover internships tailored to your profile.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 bg-blue-100 rounded-full">
                  <Briefcase className="h-10 w-10 text-blue-700" />
                </div>
                <h2 className="text-xl font-bold">For Industry</h2>
                <p className="text-gray-500 text-sm">
                  Post opportunities, mentor students, and find the best-matched talent based on verified skill profiles and compatibility.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 bg-blue-100 rounded-full">
                  <Building2 className="h-10 w-10 text-blue-700" />
                </div>
                <h2 className="text-xl font-bold">For Institutions</h2>
                <p className="text-gray-500 text-sm">
                  Track skill trends, readiness, and placement funnels through comprehensive analytics and reporting dashboards.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 bg-blue-100 rounded-full">
                  <BookOpen className="h-10 w-10 text-blue-700" />
                </div>
                <h2 className="text-xl font-bold">For Academicians</h2>
                <p className="text-gray-500 text-sm">
                  Collaborate with industry on research, live projects, and workshops to bridge the academia-industry gap.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500">
          © 2026 Academia-Industry Collaboration Portal. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
