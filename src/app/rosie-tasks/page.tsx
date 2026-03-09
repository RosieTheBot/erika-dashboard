'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RosieTasksIndex() {
  const router = useRouter()

  useEffect(() => {
    router.push('/rosie-tasks/current-projects')
  }, [router])

  return null
}
