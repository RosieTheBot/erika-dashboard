'use client'

import { Users, Brain, Zap, FileText, Megaphone } from 'lucide-react'

interface Agent {
  id: string
  name: string
  role: string
  icon: React.ReactNode
  domains: string[]
  color: string
  borderColor: string
}

const agents: Agent[] = [
  {
    id: 'rosie',
    name: 'Rosie',
    role: 'Orchestrator',
    icon: <Users className="w-8 h-8" />,
    domains: ['System Coordination', 'Task Distribution', 'Cross-Agent Communication'],
    color: 'bg-gradient-to-br from-amber-500 to-orange-600',
    borderColor: 'border-amber-400'
  },
  {
    id: 'stu',
    name: 'Stu',
    role: 'STR Analyst',
    icon: <Brain className="w-6 h-6" />,
    domains: ['STR Revenue Analysis', 'Market Research', 'Property Evaluation', 'AirDNA Integration'],
    color: 'bg-gradient-to-br from-blue-500 to-blue-600',
    borderColor: 'border-blue-400'
  },
  {
    id: 'mel',
    name: 'Mel',
    role: 'Marketing Manager',
    icon: <Megaphone className="w-6 h-6" />,
    domains: ['Campaign Strategy', 'Social Media', 'Content Creation', 'Buyer Engagement'],
    color: 'bg-gradient-to-br from-pink-500 to-rose-600',
    borderColor: 'border-pink-400'
  },
  {
    id: 'aly',
    name: 'Aly',
    role: 'Admin Assistant',
    icon: <FileText className="w-6 h-6" />,
    domains: ['Task Management', 'Scheduling', 'Documentation', 'Process Automation'],
    color: 'bg-gradient-to-br from-green-500 to-emerald-600',
    borderColor: 'border-green-400'
  },
  {
    id: 'cody',
    name: 'Cody',
    role: 'Coding Agent',
    icon: <Zap className="w-6 h-6" />,
    domains: ['Development', 'API Integration', 'Dashboard Updates', 'System Maintenance'],
    color: 'bg-gradient-to-br from-purple-500 to-indigo-600',
    borderColor: 'border-purple-400'
  }
]

export default function OrgChartPage() {
  const rosie = agents.find(a => a.id === 'rosie')!
  const subAgents = agents.filter(a => a.id !== 'rosie')

  return (
    <div className="space-y-8">
      {/* Introduction */}
      <div className="bg-primary-800/50 border border-primary-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-2">Agent Organizational Structure</h2>
        <p className="text-primary-300">
          Meet the Rosie Task Orchestration System: a coordinated team of specialized AI agents working together to manage tasks, analysis, marketing, administration, and development across the entire system.
        </p>
      </div>

      {/* Org Chart */}
      <div className="space-y-12">
        {/* Rosie - Orchestrator (Top) */}
        <div className="flex justify-center">
          <div className={`${rosie.color} border-2 ${rosie.borderColor} rounded-xl p-8 w-full max-w-xs shadow-lg hover:shadow-xl transition`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-white">
                {rosie.icon}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{rosie.name}</h3>
                <p className="text-sm font-semibold text-white/80">{rosie.role}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs font-semibold text-white/70 uppercase">Focus Areas</p>
              <div className="flex flex-wrap gap-2">
                {rosie.domains.map((domain, i) => (
                  <span key={i} className="bg-white/20 text-white text-xs px-2 py-1 rounded">
                    {domain}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Connecting Line */}
        <div className="flex justify-center">
          <div className="w-1 h-12 bg-gradient-to-b from-amber-400 to-primary-700"></div>
        </div>

        {/* Sub-Agents (Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {subAgents.map((agent) => (
            <div
              key={agent.id}
              className={`${agent.color} border-2 ${agent.borderColor} rounded-lg p-6 shadow-md hover:shadow-lg transition transform hover:-translate-y-1`}
            >
              {/* Agent Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="text-white/90">
                  {agent.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{agent.name}</h3>
                  <p className="text-xs font-semibold text-white/70">{agent.role}</p>
                </div>
              </div>

              {/* Domains */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-white/70 uppercase">Focus Areas</p>
                <div className="space-y-1">
                  {agent.domains.map((domain, i) => (
                    <p key={i} className="text-xs text-white/90 flex items-start gap-2">
                      <span className="text-white/60 mt-1">•</span>
                      <span>{domain}</span>
                    </p>
                  ))}
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <p className="text-xs text-white/80">Active & Operational</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-primary-800/50 border border-primary-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">Agent Responsibilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              agent: 'Stu',
              desc: 'Analyzes short-term rental markets, evaluates properties using AirDNA data, and provides revenue insights for investment decisions.'
            },
            {
              agent: 'Mel',
              desc: 'Manages buyer/seller marketing campaigns, creates engaging content, and handles social media presence and buyer engagement.'
            },
            {
              agent: 'Aly',
              desc: 'Organizes tasks, manages schedules, handles documentation, and automates administrative workflows across the system.'
            },
            {
              agent: 'Cody',
              desc: 'Develops features, integrates APIs, maintains the dashboard infrastructure, and deploys updates to production systems.'
            }
          ].map((item, i) => (
            <div key={i} className="bg-primary-700/30 rounded-lg p-4 border border-primary-600">
              <p className="font-semibold text-white mb-2">{item.agent}</p>
              <p className="text-sm text-primary-300">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-primary-800/50 border border-primary-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-white">5</p>
          <p className="text-xs text-primary-300">Total Agents</p>
        </div>
        <div className="bg-primary-800/50 border border-primary-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-white">1</p>
          <p className="text-xs text-primary-300">Orchestrator</p>
        </div>
        <div className="bg-primary-800/50 border border-primary-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-white">4</p>
          <p className="text-xs text-primary-300">Specialists</p>
        </div>
        <div className="bg-primary-800/50 border border-primary-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-400">100%</p>
          <p className="text-xs text-primary-300">Operational</p>
        </div>
      </div>
    </div>
  )
}
