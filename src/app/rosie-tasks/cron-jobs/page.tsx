'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Loader, Clock } from 'lucide-react'

interface CronJob {
  id: number
  project_id: string
  project_name: string
  status: 'success' | 'failed' | 'running' | 'complete'
  last_run_at: string
  next_run_at: string
  created_at: string
  nextRunCountdown: number | null
}

function formatCountdown(seconds: number | null): string {
  if (seconds === null || seconds <= 0) return 'Due now'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m ${secs}s`
  return `${secs}s`
}

export default function CronJobsPage() {
  const [jobs, setJobs] = useState<CronJob[]>([])
  const [loading, setLoading] = useState(true)
  const [countdowns, setCountdowns] = useState<Record<string, number>>({})

  useEffect(() => {
    fetchJobs()
    const interval = setInterval(fetchJobs, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Update countdowns every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdowns(prev => {
        const newCountdowns: Record<string, number> = {}
        jobs.forEach(job => {
          if (job.next_run_at) {
            const nextRun = new Date(job.next_run_at).getTime()
            const now = new Date().getTime()
            const countdown = Math.max(0, Math.floor((nextRun - now) / 1000))
            newCountdowns[job.project_id] = countdown
          }
        })
        return newCountdowns
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [jobs])

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/cron-jobs')
      const data = await response.json()
      setJobs(data.jobs || [])
    } catch (error) {
      console.error('Error fetching cron jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusBgColors = {
    success: 'bg-green-500/20 border-green-500/30',
    failed: 'bg-red-500/20 border-red-500/30',
    running: 'bg-yellow-500/20 border-yellow-500/30',
    complete: 'bg-blue-500/20 border-blue-500/30'
  }

  const statusTextColors = {
    success: 'text-green-300',
    failed: 'text-red-300',
    running: 'text-yellow-300',
    complete: 'text-blue-300'
  }

  const getCountdownColor = (countdown: number | null) => {
    if (countdown === null) return 'text-primary-400'
    if (countdown <= 300) return 'text-red-400 font-bold' // Due in 5 min or less
    if (countdown <= 3600) return 'text-yellow-400' // Due in 1 hour or less
    return 'text-green-400' // More than 1 hour
  }

  const handleRefresh = async () => {
    setLoading(true)
    await fetchJobs()
  }

  return (
    <div>
      {/* Controls */}
      <div className="mb-6">
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Jobs Table */}
      {loading && jobs.length === 0 ? (
        <div className="flex items-center gap-2 text-primary-300">
          <Loader size={20} className="animate-spin" />
          Loading cron jobs...
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-primary-800 border border-primary-700 rounded-lg p-8 text-center">
          <AlertCircle size={32} className="mx-auto mb-4 text-primary-400" />
          <p className="text-primary-300">No cron jobs found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary-700">
                <th className="text-left px-4 py-3 text-primary-400 font-semibold text-sm">Name</th>
                <th className="text-left px-4 py-3 text-primary-400 font-semibold text-sm">Status</th>
                <th className="text-left px-4 py-3 text-primary-400 font-semibold text-sm">Last Run</th>
                <th className="text-left px-4 py-3 text-primary-400 font-semibold text-sm">Next Run</th>
                <th className="text-left px-4 py-3 text-primary-400 font-semibold text-sm">Countdown</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-700">
              {jobs.map((job) => {
                const countdown = countdowns[job.project_id] ?? null
                return (
                  <tr key={job.id} className={`${statusBgColors[job.status]} border-primary-700 hover:bg-primary-700/20 transition`}>
                    <td className="px-4 py-3 text-white font-medium">{job.project_name}</td>
                    <td className={`px-4 py-3 text-xs font-bold ${statusTextColors[job.status]}`}>
                      {job.status.toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-primary-300 text-sm">
                      {job.last_run_at ? new Date(job.last_run_at).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-4 py-3 text-primary-300 text-sm">
                      {job.next_run_at ? new Date(job.next_run_at).toLocaleString() : 'N/A'}
                    </td>
                    <td className={`px-4 py-3 font-mono text-sm ${getCountdownColor(countdown)} flex items-center gap-2`}>
                      <Clock size={16} />
                      {formatCountdown(countdown)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
