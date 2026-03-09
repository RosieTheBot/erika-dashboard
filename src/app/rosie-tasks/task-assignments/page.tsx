'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Clock, AlertTriangle, Filter, RefreshCw } from 'lucide-react'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'
import { SkeletonTable } from '@/components/ui/Skeleton'
import Button from '@/components/ui/Button'

interface TaskAssignment {
  id: string
  task_name: string
  assigned_agent: string
  status: 'in_progress' | 'blocked' | 'complete' | 'pending'
  priority: 'low' | 'medium' | 'high' | 'critical'
  created_at: string
  completed_at?: string
  estimated_time: string
  actual_time?: string
  description: string
  blocked_reason?: string
}

const mockTaskData: TaskAssignment[] = [
  {
    id: 'task-001',
    task_name: 'AirDNA Market Analysis - Austin STR Portfolio',
    assigned_agent: 'Stu',
    status: 'in_progress',
    priority: 'high',
    created_at: '2026-03-08T10:30:00Z',
    estimated_time: '2h',
    description: 'Analyze 12 properties in Austin market for revenue potential and seasonal trends',
    blocked_reason: undefined
  },
  {
    id: 'task-002',
    task_name: 'Deploy Dashboard Updates to Vercel',
    assigned_agent: 'Cody',
    status: 'in_progress',
    priority: 'high',
    created_at: '2026-03-08T09:15:00Z',
    estimated_time: '45m',
    description: 'Deploy new org-chart and agent-status pages to production'
  },
  {
    id: 'task-003',
    task_name: 'Generate Buyer Campaign Email',
    assigned_agent: 'Mel',
    status: 'complete',
    priority: 'medium',
    created_at: '2026-03-08T08:00:00Z',
    completed_at: '2026-03-08T11:30:00Z',
    estimated_time: '1.5h',
    actual_time: '1h 28m',
    description: 'Create personalized email campaign for active buyers'
  },
  {
    id: 'task-004',
    task_name: 'Update Task Tracking Database Schema',
    assigned_agent: 'Cody',
    status: 'blocked',
    priority: 'critical',
    created_at: '2026-03-08T07:00:00Z',
    estimated_time: '3h',
    description: 'Add agent_sessions and task_assignments tables to Supabase',
    blocked_reason: 'Waiting for database access confirmation'
  },
  {
    id: 'task-005',
    task_name: 'Schedule Weekly Team Sync',
    assigned_agent: 'Aly',
    status: 'complete',
    priority: 'low',
    created_at: '2026-03-07T14:00:00Z',
    completed_at: '2026-03-07T14:30:00Z',
    estimated_time: '30m',
    actual_time: '25m',
    description: 'Coordinate weekly meeting between all agents'
  },
  {
    id: 'task-006',
    task_name: 'Analyze Market Trends for Q2',
    assigned_agent: 'Stu',
    status: 'pending',
    priority: 'medium',
    created_at: '2026-03-08T12:00:00Z',
    estimated_time: '4h',
    description: 'Review market data and prepare quarterly analysis report'
  },
  {
    id: 'task-007',
    task_name: 'Monitor API Performance Metrics',
    assigned_agent: 'Cody',
    status: 'in_progress',
    priority: 'medium',
    created_at: '2026-03-08T06:00:00Z',
    estimated_time: '1h',
    description: 'Check API response times and error rates in production'
  },
  {
    id: 'task-008',
    task_name: 'Process Seller Onboarding Checklist',
    assigned_agent: 'Aly',
    status: 'pending',
    priority: 'high',
    created_at: '2026-03-08T11:45:00Z',
    estimated_time: '2h',
    description: 'Complete onboarding documentation for new sellers'
  },
  {
    id: 'task-009',
    task_name: 'Update Social Media Strategy',
    assigned_agent: 'Mel',
    status: 'pending',
    priority: 'medium',
    created_at: '2026-03-08T13:00:00Z',
    estimated_time: '1.5h',
    description: 'Review and update content calendar for next month'
  }
]

export default function TaskAssignmentsPage() {
  const [tasks, setTasks] = useState<TaskAssignment[]>(mockTaskData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [filterAgent, setFilterAgent] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const fetchTasks = async () => {
    try {
      setError(null)
      const response = await fetch('/api/rosie-tasks/task-assignments')
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      const data = await response.json()
      if (data.tasks && Array.isArray(data.tasks)) {
        setTasks(data.tasks)
      } else {
        console.warn('API did not return tasks array, using mock data')
      }
      setLastUpdated(new Date())
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tasks'
      console.error('Failed to fetch tasks:', error)
      setError(errorMessage)
      // Keep existing data on error
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    // Initial load
    fetchTasks()
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchTasks()
    }, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-500/20 border-green-500/30 text-green-300'
      case 'in_progress':
        return 'bg-blue-500/20 border-blue-500/30 text-blue-300'
      case 'pending':
        return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300'
      case 'blocked':
        return 'bg-red-500/20 border-red-500/30 text-red-300'
      default:
        return 'bg-primary-500/20 border-primary-500/30 text-primary-300'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500 text-white'
      case 'high':
        return 'bg-orange-500 text-white'
      case 'medium':
        return 'bg-yellow-500 text-white'
      case 'low':
        return 'bg-green-500 text-white'
      default:
        return 'bg-primary-500 text-white'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 size={18} className="text-green-400" />
      case 'in_progress':
        return <Clock size={18} className="text-blue-400 animate-pulse" />
      case 'pending':
        return <AlertCircle size={18} className="text-yellow-400" />
      case 'blocked':
        return <AlertTriangle size={18} className="text-red-400" />
      default:
        return <AlertCircle size={18} />
    }
  }

  const agents = ['all', ...new Set(tasks.map(t => t.assigned_agent))]
  const statuses = ['all', 'in_progress', 'pending', 'complete', 'blocked']
  const priorities = ['all', 'critical', 'high', 'medium', 'low']

  const filteredTasks = tasks.filter(task =>
    (filterAgent === 'all' || task.assigned_agent === filterAgent) &&
    (filterStatus === 'all' || task.status === filterStatus) &&
    (filterPriority === 'all' || task.priority === filterPriority)
  )

  const stats = {
    total: tasks.length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    complete: tasks.filter(t => t.status === 'complete').length,
    blocked: tasks.filter(t => t.status === 'blocked').length
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchTasks()
  }

  return (
    <div className="container-page space-section">
      {/* Header with Refresh */}
      <div className="flex items-start justify-between">
        <div>
          <h1>Task Assignments</h1>
          <p className="text-primary-300 mt-2">
            Manage and track agent task assignments. Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={<RefreshCw size={16} />}
          onClick={handleRefresh}
          isLoading={isRefreshing}
        >
          Refresh
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <ErrorState
          message={error}
          onRetry={handleRefresh}
        />
      )}

      {/* Summary Stats */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-primary-800/50 border border-primary-700 rounded-lg p-4 h-20 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-primary-800/50 border border-primary-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-xs text-primary-300 mt-1">Total Tasks</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{stats.inProgress}</p>
          <p className="text-xs text-primary-300 mt-1">In Progress</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
          <p className="text-xs text-primary-300 mt-1">Pending</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{stats.complete}</p>
          <p className="text-xs text-primary-300 mt-1">Complete</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{stats.blocked}</p>
          <p className="text-xs text-primary-300 mt-1">Blocked</p>
        </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-primary-800/50 border border-primary-700 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4 text-white">
          <Filter size={20} />
          <h3 className="font-semibold">Filters</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Agent Filter */}
          <div>
            <label className="block text-xs font-semibold text-primary-300 mb-2">Agent</label>
            <select
              value={filterAgent}
              onChange={(e) => setFilterAgent(e.target.value)}
              className="w-full bg-primary-700 border border-primary-600 rounded text-white text-sm p-2"
            >
              {agents.map(agent => (
                <option key={agent} value={agent}>
                  {agent === 'all' ? 'All Agents' : agent}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-primary-300 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-primary-700 border border-primary-600 rounded text-white text-sm p-2"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-xs font-semibold text-primary-300 mb-2">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full bg-primary-700 border border-primary-600 rounded text-white text-sm p-2"
            >
              {priorities.map(priority => (
                <option key={priority} value={priority}>
                  {priority === 'all' ? 'All Priorities' : priority.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {loading ? (
          <SkeletonTable />
        ) : error && filteredTasks.length === 0 ? (
          <EmptyState
            icon={AlertCircle}
            title="Unable to Load Tasks"
            description="There was an error loading your tasks. Check your connection and try again."
            variant="warning"
          />
        ) : filteredTasks.length === 0 ? (
          <EmptyState
            icon={AlertCircle}
            title="No Tasks Found"
            description={filterAgent === 'all' && filterStatus === 'all' && filterPriority === 'all' 
              ? "You don't have any tasks yet. Create your first task to get started."
              : "No tasks match your current filter. Try adjusting your filters."}
            action={filterAgent !== 'all' || filterStatus !== 'all' || filterPriority !== 'all' 
              ? { label: 'Clear Filters', onClick: () => { setFilterAgent('all'); setFilterStatus('all'); setFilterPriority('all'); } }
              : undefined}
            variant="info"
          />
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-primary-800/50 border border-primary-700 rounded-lg overflow-hidden hover:shadow-lg transition"
            >
              {/* Task Header */}
              <button
                onClick={() => setExpandedId(expandedId === task.id ? null : task.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-primary-700/30 transition text-left"
              >
                <div className="flex items-center gap-4 flex-1">
                  {getStatusIcon(task.status)}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold truncate">{task.task_name}</h3>
                    <p className="text-sm text-primary-400">
                      Assigned to: <span className="font-medium text-white">{task.assigned_agent}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                      {task.priority.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              </button>

              {/* Task Details - Expanded */}
              {expandedId === task.id && (
                <div className="bg-primary-700/20 border-t border-primary-700 p-4 space-y-4">
                  {/* Description */}
                  <div>
                    <p className="text-xs font-semibold text-primary-400 mb-2">Description</p>
                    <p className="text-white text-sm">{task.description}</p>
                  </div>

                  {/* Timing Info */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-primary-400 mb-1">Created</p>
                      <p className="text-white text-sm font-medium">
                        {new Date(task.created_at).toLocaleDateString()} {new Date(task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-primary-400 mb-1">Estimated Time</p>
                      <p className="text-white text-sm font-medium">{task.estimated_time}</p>
                    </div>
                    {task.actual_time && (
                      <div>
                        <p className="text-xs text-primary-400 mb-1">Actual Time</p>
                        <p className="text-green-400 text-sm font-medium">{task.actual_time}</p>
                      </div>
                    )}
                    {task.completed_at && (
                      <div>
                        <p className="text-xs text-primary-400 mb-1">Completed</p>
                        <p className="text-white text-sm font-medium">
                          {new Date(task.completed_at).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Blocked Reason */}
                  {task.blocked_reason && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
                      <p className="text-xs text-red-300 font-semibold mb-1">Blocked Reason</p>
                      <p className="text-red-200 text-sm">{task.blocked_reason}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2 border-t border-primary-700">
                    <Button size="sm" variant="primary">View Details</Button>
                    {task.status !== 'complete' && (
                      <Button size="sm" variant="secondary">Update Status</Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Agent Workload Summary */}
      <div className="bg-primary-800/50 border border-primary-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">Agent Workload Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {['Stu', 'Mel', 'Aly', 'Cody'].map(agent => {
            const agentTasks = tasks.filter(t => t.assigned_agent === agent)
            const completed = agentTasks.filter(t => t.status === 'complete').length
            const inProgress = agentTasks.filter(t => t.status === 'in_progress').length
            
            return (
              <div key={agent} className="bg-primary-700/30 rounded-lg p-4 border border-primary-600">
                <p className="font-semibold text-white mb-3">{agent}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-primary-300">Total:</span>
                    <span className="text-white font-medium">{agentTasks.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-300">In Progress:</span>
                    <span className="text-blue-400 font-medium">{inProgress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-300">Complete:</span>
                    <span className="text-green-400 font-medium">{completed}</span>
                  </div>
                  {agentTasks.length > 0 && (
                    <div className="w-full bg-primary-600 rounded-full h-2 mt-2">
                      <div
                        className="h-2 rounded-full bg-green-500"
                        style={{ width: `${(completed / agentTasks.length) * 100}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
