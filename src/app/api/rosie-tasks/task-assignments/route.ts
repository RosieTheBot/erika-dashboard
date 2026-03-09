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
    // Fetch task assignments from Supabase
    const { data: taskAssignments, error } = await supabase
      .from('task_assignments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error && error.code !== 'PGRST116') {
      // PGRST116 means table doesn't exist, which is fine on first run
      throw error
    }

    // Mock data if table doesn't exist
    const mockTaskData = [
      {
        id: 'task-001',
        task_name: 'AirDNA Market Analysis - Austin STR Portfolio',
        assigned_agent: 'Stu',
        status: 'in_progress',
        priority: 'high',
        created_at: '2026-03-08T10:30:00Z',
        completed_at: null,
        estimated_time: '2h',
        actual_time: null,
        description: 'Analyze 12 properties in Austin market for revenue potential and seasonal trends',
        blocked_reason: null
      },
      {
        id: 'task-002',
        task_name: 'Deploy Dashboard Updates to Vercel',
        assigned_agent: 'Cody',
        status: 'in_progress',
        priority: 'high',
        created_at: '2026-03-08T09:15:00Z',
        completed_at: null,
        estimated_time: '45m',
        actual_time: null,
        description: 'Deploy new org-chart and agent-status pages to production',
        blocked_reason: null
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
        description: 'Create personalized email campaign for active buyers',
        blocked_reason: null
      },
      {
        id: 'task-004',
        task_name: 'Update Task Tracking Database Schema',
        assigned_agent: 'Cody',
        status: 'blocked',
        priority: 'critical',
        created_at: '2026-03-08T07:00:00Z',
        completed_at: null,
        estimated_time: '3h',
        actual_time: null,
        description: 'Add agent_sessions and task_assignments tables to Supabase',
        blocked_reason: 'Waiting for database access confirmation'
      }
    ]

    // Use Supabase data if available, otherwise use mock data
    const tasks = taskAssignments && taskAssignments.length > 0 ? taskAssignments : mockTaskData

    return NextResponse.json({
      success: true,
      tasks: tasks,
      total: tasks.length,
      timestamp: new Date().toISOString(),
      source: taskAssignments && taskAssignments.length > 0 ? 'supabase' : 'mock'
    })
  } catch (error) {
    console.error('Error fetching task assignments:', error)
    // Return mock data on error
    const mockData = [
      {
        id: 'task-001',
        task_name: 'AirDNA Market Analysis - Austin STR Portfolio',
        assigned_agent: 'Stu',
        status: 'in_progress',
        priority: 'high',
        created_at: '2026-03-08T10:30:00Z',
        completed_at: null,
        estimated_time: '2h',
        actual_time: null,
        description: 'Analyze 12 properties in Austin market for revenue potential and seasonal trends',
        blocked_reason: null
      }
    ]

    return NextResponse.json({
      success: true,
      tasks: mockData,
      total: mockData.length,
      timestamp: new Date().toISOString(),
      source: 'mock',
      warning: 'Using mock data due to database connection'
    }, { status: 200 })
  }
}
