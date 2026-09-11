'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CompanySettingsRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/company/profile')
  }, [router])

  return (
    <div className="flex h-[50vh] items-center justify-center text-sm text-slate-400">
      Loading settings...
    </div>
  )
}
