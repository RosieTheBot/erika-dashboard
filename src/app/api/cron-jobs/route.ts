import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Parse cron expression to calculate next run
function calculateNextRun(cronExpression: string): Date {
  // Simple cron parser - handles basic patterns
  // Format: minute hour day month dayOfWeek
  const parts = cronExpression.split(' ')
  const now = new Date()
  
  // For simplicity, add 1 hour to the current time
  // In production, use a library like cron-parser
  const nextRun = new Date(now.getTime() + 60 * 60 * 1000)
  return nextRun
}

export async function GET(request: Request) {
  try {
    // Get all cron jobs from project_history where project_type is 'cron_job'
    const { data: cronJobs, error } = await supabase
      .from('project_history')
      .select('*')
      .eq('project_type', 'cron_job')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Group by project_id to get the latest status for each cron job
    const jobMap = new Map()
    cronJobs?.forEach((job: any) => {
      if (!jobMap.has(job.project_id)) {
        jobMap.set(job.project_id, {
          ...job,
          nextRunCountdown: job.next_run_at ? 
            Math.max(0, Math.floor((new Date(job.next_run_at).getTime() - new Date().getTime()) / 1000))
            : null
        })
      }
    })

    const jobs = Array.from(jobMap.values())
    
    return NextResponse.json({ jobs })
  } catch (error) {
    console.error('Error fetching cron jobs:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch cron jobs' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { project_id, project_name, schedule, status, next_run_at } = body

    const { data, error } = await supabase
      .from('project_history')
      .insert([{
        project_id,
        project_name,
        project_type: 'cron_job',
        status: status || 'running',
        last_run_at: new Date().toISOString(),
        next_run_at: next_run_at || calculateNextRun(schedule).toISOString(),
        created_at: new Date().toISOString()
      }])
      .select()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ job: data?.[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating cron job:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create cron job' },
      { status: 500 }
    )
  }
}
