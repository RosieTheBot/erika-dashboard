import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export async function GET(request: Request) {
  try {
    // Get all projects with their latest status
    const { data: projectHistory, error } = await supabase
      .from('project_history')
      .select('*')
      .order('last_run_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Group by project_id to get the latest status for each project
    const projectMap = new Map()
    projectHistory?.forEach((item: any) => {
      if (!projectMap.has(item.project_id) || 
          new Date(item.last_run_at || 0) > new Date(projectMap.get(item.project_id).last_run_at || 0)) {
        projectMap.set(item.project_id, item)
      }
    })

    const projects = Array.from(projectMap.values())
    
    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { project_id, project_name, project_type, status, error_message, next_run_at } = body

    const { data, error } = await supabase
      .from('project_history')
      .insert([{
        project_id,
        project_name,
        project_type,
        status,
        error_message,
        last_run_at: new Date().toISOString(),
        next_run_at,
        created_at: new Date().toISOString()
      }])
      .select()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ project: data?.[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create project' },
      { status: 500 }
    )
  }
}
