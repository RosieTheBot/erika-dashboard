'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function RosieTasksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const isActive = (path: string) => pathname.includes(path)

  return (
    <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">
          Rosie Tasks
        </h1>
        <p className="text-primary-300 text-sm sm:text-base">
          Manage projects, cron jobs, and ideas
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 mb-8 border-b border-primary-700 flex-wrap">
        <Link
          href="/rosie-tasks/current-projects"
          className={`px-4 py-2 font-medium transition border-b-2 ${
            isActive('current-projects')
              ? 'border-primary-500 text-white'
              : 'border-transparent text-primary-400 hover:text-white'
          }`}
        >
          Current Projects
        </Link>
        <Link
          href="/rosie-tasks/cron-jobs"
          className={`px-4 py-2 font-medium transition border-b-2 ${
            isActive('cron-jobs')
              ? 'border-primary-500 text-white'
              : 'border-transparent text-primary-400 hover:text-white'
          }`}
        >
          Cron Jobs
        </Link>
        <Link
          href="/rosie-tasks/ideas"
          className={`px-4 py-2 font-medium transition border-b-2 ${
            isActive('ideas')
              ? 'border-primary-500 text-white'
              : 'border-transparent text-primary-400 hover:text-white'
          }`}
        >
          Ideas
        </Link>
        <Link
          href="/rosie-tasks/org-chart"
          className={`px-4 py-2 font-medium transition border-b-2 ${
            isActive('org-chart')
              ? 'border-primary-500 text-white'
              : 'border-transparent text-primary-400 hover:text-white'
          }`}
        >
          Org Chart
        </Link>
        <Link
          href="/rosie-tasks/agent-status"
          className={`px-4 py-2 font-medium transition border-b-2 ${
            isActive('agent-status')
              ? 'border-primary-500 text-white'
              : 'border-transparent text-primary-400 hover:text-white'
          }`}
        >
          Agent Status
        </Link>
        <Link
          href="/rosie-tasks/task-assignments"
          className={`px-4 py-2 font-medium transition border-b-2 ${
            isActive('task-assignments')
              ? 'border-primary-500 text-white'
              : 'border-transparent text-primary-400 hover:text-white'
          }`}
        >
          Task Assignments
        </Link>
      </div>

      {/* Content */}
      <div>
        {children}
      </div>
    </div>
  )
}
