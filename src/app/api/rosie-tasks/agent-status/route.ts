import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function GET() {
  try {
    // Fetch agent sessions from Supabase
    const { data: agentSessions, error } = await supabase
      .from('agent_sessions')
      .select('*')
      .order('last_active_at', { ascending: false })

    if (error && error.code !== 'PGRST116') {
      // PGRST116 means table doesn't exist, which is fine on first run
      throw error
    }

    // Mock data if table doesn't exist
    const mockAgentData = [
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

    // Use Supabase data if available, otherwise use mock data
    const agents = agentSessions && agentSessions.length > 0 ? agentSessions : mockAgentData

    return NextResponse.json({
      success: true,
      agents: agents,
      timestamp: new Date().toISOString(),
      source: agentSessions && agentSessions.length > 0 ? 'supabase' : 'mock'
    })
  } catch (error) {
    console.error('Error fetching agent status:', error)
    // Return mock data on error
    const mockData = [
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
      }
    ]

    return NextResponse.json({
      success: true,
      agents: mockData,
      timestamp: new Date().toISOString(),
      source: 'mock',
      warning: 'Using mock data due to database connection'
    }, { status: 200 })
  }
}
