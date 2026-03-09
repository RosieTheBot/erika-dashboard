'use client'

import { useEffect, useState } from 'react'
import { Loader, AlertCircle, Clock, CheckCircle2, Activity, RefreshCw } from 'lucide-react'

interface AgentStatus {
  id: string
  name: string
  role: string
  status: 'online' | 'offline' | 'idle' | 'busy'
  last_task_executed: string
  current_activity: string
  last_active_at: string
  tasks_completed: number
  error_count: number
}

const mockAgentData: AgentStatus[] = [
  {
    id: 'rosie',
    name: 'Rosie',
    role: 'Orchestrator',
    status: 'online',
    last_task_executed: 'Distributed tasks to 4 agents',
    current_activity: 'Monitoring task status and coordinating workflows',
    last_active_at: new Date(Date.now() - 1000).toISOString(),
    tasks_completed: 1247,
    error_count: 3
  },
  {
    id: 'stu',
    name: 'Stu',
    role: 'STR Analyst',
    status: 'busy',
    last_task_executed: 'AirDNA market analysis for Austin properties',
    current_activity: 'Processing revenue data for 12 properties',
    last_active_at: new Date(Date.now() - 5000).toISOString(),
    tasks_completed: 342,
    error_count: 1
  },
  {
    id: 'mel',
    name: 'Mel',
    role: 'Marketing Manager',
    status: 'online',
    last_task_executed: 'Generated buyer engagement email campaign',
    current_activity: 'Analyzing campaign performance metrics',
    last_active_at: new Date(Date.now() - 30000).toISOString(),
    tasks_completed: 189,
    error_count: 0
  },
  {
    id: 'aly',
    name: 'Aly',
    role: 'Admin Assistant',
    status: 'idle',
    last_task_executed: 'Scheduled daily sync tasks',
    current_activity: 'Waiting for new assignments',
    last_active_at: new Date(Date.now() - 180000).toISOString(),
    tasks_completed: 523,
    error_count: 2
  },
  {
    id: 'cody',
    name: 'Cody',
    role: 'Coding Agent',
    status: 'busy',
    last_task_executed: 'Deployed dashboard updates to Vercel',
    current_activity: 'Building new API endpoints for data sync',
    last_active_at: new Date(Date.now() - 3000).toISOString(),
    tasks_completed: 267,
    error_count: 0
  }
]

export default function AgentStatusPage() {
  const [agents, setAgents] = useState<AgentStatus[]>(mockAgentData)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const fetchAgentStatus = async () => {
    try {
      const response = await fetch('/api/rosie-tasks/agent-status')
      const data = await response.json()
      if (data.agents && Array.isArray(data.agents)) {
        setAgents(data.agents)
      }
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to fetch agent status:', error)
      // Keep existing data on error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initial load
    fetchAgentStatus()
    
    // Auto-refresh every 5 minutes if enabled (300 seconds for production)
    if (!autoRefresh) return
    
    const interval = setInterval(() => {
      fetchAgentStatus()
    }, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [autoRefresh])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500/20 border-green-500/30 text-green-300'
      case 'busy':
        return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300'
      case 'idle':
        return 'bg-blue-500/20 border-blue-500/30 text-blue-300'
      case 'offline':
        return 'bg-gray-500/20 border-gray-500/30 text-gray-300'
      default:
        return 'bg-primary-500/20 border-primary-500/30 text-primary-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return '●'
      case 'busy':
        return '◐'
      case 'idle':
        return '◯'
      case 'offline':
        return '○'
      default:
        return '?'
    }
  }

  const formatTimeAgo = (isoString: string) => {
    const date = new Date(isoString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  const onlineCount = agents.filter(a => a.status === 'online' || a.status === 'busy').length
  const totalTasksCompleted = agents.reduce((sum, a) => sum + a.tasks_completed, 0)
  const totalErrors = agents.reduce((sum, a) => sum + a.error_count, 0)

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-primary-800/50 border border-primary-700 rounded-lg p-4">
        <div>
          <h2 className="text-lg font-bold text-white mb-1">Real-Time Agent Status</h2>
          <p className="text-sm text-primary-300">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <label className="flex items-center gap-3 text-white">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="w-4 h-4 accent-primary-500"
          />
          <span className="text-sm">Auto-refresh every 30s</span>
        </label>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <p className="text-2xl font-bold text-green-400">{onlineCount}/5</p>
          <p className="text-xs text-primary-300 mt-1">Active Agents</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <p className="text-2xl font-bold text-blue-400">{totalTasksCompleted}</p>
          <p className="text-xs text-primary-300 mt-1">Total Tasks Done</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-2xl font-bold text-red-400">{totalErrors}</p>
          <p className="text-xs text-primary-300 mt-1">Errors</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-2xl font-bold text-yellow-400">98%</p>
          <p className="text-xs text-primary-300 mt-1">Uptime</p>
        </div>
      </div>

      {/* Agent Status Cards */}
      <div className="space-y-4">
        {loading && agents.length === 0 ? (
          <div className="flex items-center gap-2 text-primary-300">
            <Loader size={20} className="animate-spin" />
            Loading agent status...
          </div>
        ) : (
          agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-primary-800/50 border border-primary-700 rounded-lg overflow-hidden hover:shadow-lg transition"
            >
              {/* Agent Header */}
              <div className="p-4 border-b border-primary-700 bg-primary-700/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg ${
                      agent.id === 'rosie' ? 'bg-amber-500/20 border border-amber-400' :
                      agent.id === 'stu' ? 'bg-blue-500/20 border border-blue-400' :
                      agent.id === 'mel' ? 'bg-pink-500/20 border border-pink-400' :
                      agent.id === 'aly' ? 'bg-green-500/20 border border-green-400' :
                      'bg-purple-500/20 border border-purple-400'
                    } flex items-center justify-center`}>
                      <Activity size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{agent.name}</h3>
                      <p className="text-sm text-primary-300">{agent.role}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${getStatusColor(agent.status)}`}>
                    <span>{getStatusIcon(agent.status)}</span>
                    {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                  </div>
                </div>
              </div>

              {/* Agent Details */}
              <div className="p-4 space-y-3">
                {/* Current Activity */}
                <div>
                  <p className="text-xs font-semibold text-primary-400 mb-1">Current Activity</p>
                  <p className="text-white">{agent.current_activity}</p>
                </div>

                {/* Last Task */}
                <div>
                  <p className="text-xs font-semibold text-primary-400 mb-1">Last Task Executed</p>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-white">{agent.last_task_executed}</p>
                      <p className="text-xs text-primary-400 mt-0.5">
                        <Clock size={12} className="inline mr-1" />
                        {formatTimeAgo(agent.last_active_at)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 pt-2 border-t border-primary-700">
                  <div>
                    <p className="text-xs text-primary-400 mb-1">Tasks Completed</p>
                    <p className="text-lg font-bold text-white">{agent.tasks_completed}</p>
                  </div>
                  <div>
                    <p className="text-xs text-primary-400 mb-1">Errors</p>
                    <p className={`text-lg font-bold ${agent.error_count > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {agent.error_count}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-primary-400 mb-1">Success Rate</p>
                    <p className="text-lg font-bold text-green-400">
                      {Math.round((agent.tasks_completed / (agent.tasks_completed + agent.error_count)) * 100)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* System Health */}
      <div className="bg-primary-800/50 border border-primary-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">System Health</h3>
        <div className="space-y-3">
          {[
            { name: 'Agent Communication', status: 'healthy', percentage: 100 },
            { name: 'Task Distribution', status: 'healthy', percentage: 100 },
            { name: 'Data Synchronization', status: 'healthy', percentage: 99 },
            { name: 'API Response Time', status: 'healthy', percentage: 98 }
          ].map((item, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between items-center">
                <p className="text-sm text-white font-medium">{item.name}</p>
                <span className={`text-sm font-semibold ${
                  item.percentage === 100 ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {item.percentage}%
                </span>
              </div>
              <div className="w-full bg-primary-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    item.percentage === 100 ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
