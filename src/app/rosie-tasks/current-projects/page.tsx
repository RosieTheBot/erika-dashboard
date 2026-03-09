'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Loader, ChevronDown, ChevronUp } from 'lucide-react'

interface ProjectHistory {
  id: number
  project_id: string
  project_name: string
  project_type: 'cron_job' | 'memory_item' | 'manual'
  status: 'success' | 'failed' | 'running' | 'complete'
  last_run_at: string
  next_run_at: string
  error_message: string
  created_at: string
}

export default function CurrentProjectsPage() {
  const [projects, setProjects] = useState<ProjectHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'success' | 'failed' | 'running' | 'complete'>('all')

  useEffect(() => {
    fetchProjects()
    
    // Poll for updates every 5 minutes
    const interval = setInterval(fetchProjects, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      const data = await response.json()
      setProjects(data.projects || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusColors = {
    success: 'bg-green-500/20 border-green-500/30 text-green-300',
    failed: 'bg-red-500/20 border-red-500/30 text-red-300',
    running: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300',
    complete: 'bg-blue-500/20 border-blue-500/30 text-blue-300'
  }

  const statusIcons = {
    success: '✓',
    failed: '✕',
    running: '⟳',
    complete: '✓'
  }

  const typeColors = {
    cron_job: 'text-purple-400',
    memory_item: 'text-blue-400',
    manual: 'text-gray-400'
  }

  // Filter out cron jobs - only show active projects (manual and memory items)
  const activeProjects = projects.filter(p => p.project_type !== 'cron_job')
  
  const filteredProjects = filter === 'all' 
    ? activeProjects
    : activeProjects.filter(p => p.status === filter)

  const handleRefresh = async () => {
    setLoading(true)
    await fetchProjects()
  }

  return (
    <div>
      {/* Filter and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          {(['all', 'success', 'failed', 'running', 'complete'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded-lg font-medium transition text-sm ${
                filter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-primary-800/50 text-primary-300 hover:bg-primary-800'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition disabled:opacity-50 ml-auto"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Projects List */}
      {loading && projects.length === 0 ? (
        <div className="flex items-center gap-2 text-primary-300">
          <Loader size={20} className="animate-spin" />
          Loading projects...
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-primary-800 border border-primary-700 rounded-lg p-8 text-center">
          <AlertCircle size={32} className="mx-auto mb-4 text-primary-400" />
          <p className="text-primary-300">No active projects found</p>
          <p className="text-xs text-primary-400 mt-2">Scheduled cron jobs are shown in the Cron Jobs section</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-primary-800/50 border border-primary-700 rounded-lg overflow-hidden hover:shadow-lg transition">
              {/* Project Header */}
              <button
                onClick={() => setExpandedId(expandedId === project.project_id ? null : project.project_id)}
                className="w-full p-4 flex items-center justify-between hover:bg-primary-700/30 transition"
              >
                <div className="flex items-center gap-4 flex-1 text-left">
                  <div className={`w-3 h-3 rounded-full flex items-center justify-center text-xs font-bold ${statusColors[project.status]}`}>
                    {statusIcons[project.status]}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{project.project_name}</h3>
                    <p className={`text-xs ${typeColors[project.project_type]}`}>
                      {project.project_type.replace('_', ' ').toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm hidden sm:block">
                    <p className="text-primary-300">
                      Last Run: {project.last_run_at ? new Date(project.last_run_at).toLocaleDateString() : 'Never'}
                    </p>
                    <p className={`text-xs font-medium ${statusColors[project.status]}`}>
                      {project.status.toUpperCase()}
                    </p>
                  </div>
                  {expandedId === project.project_id ? (
                    <ChevronUp className="text-primary-400" />
                  ) : (
                    <ChevronDown className="text-primary-400" />
                  )}
                </div>
              </button>

              {/* Expanded Details */}
              {expandedId === project.project_id && (
                <div className="bg-primary-700/20 border-t border-primary-700 p-4 space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-primary-400 mb-1">Status</p>
                      <p className="text-white font-semibold">{project.status}</p>
                    </div>
                    <div>
                      <p className="text-xs text-primary-400 mb-1">Type</p>
                      <p className="text-white font-semibold">{project.project_type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-primary-400 mb-1">Last Run</p>
                      <p className="text-white font-semibold">
                        {project.last_run_at ? new Date(project.last_run_at).toLocaleString() : 'Never'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-primary-400 mb-1">Next Run</p>
                      <p className="text-white font-semibold">
                        {project.next_run_at ? new Date(project.next_run_at).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  {project.error_message && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
                      <p className="text-xs text-red-300 font-semibold mb-1">Error</p>
                      <p className="text-red-200 text-sm">{project.error_message}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
