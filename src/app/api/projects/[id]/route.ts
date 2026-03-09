import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params

    // Get all history for this project
    const { data: history, error } = await supabase
      .from('project_history')
      .select('*')
      .eq('project_id', projectId)
      .order('last_run_at', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ history })
  } catch (error) {
    console.error('Error fetching project history:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch project history' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params
    const body = await request.json()
    const { status, error_message, next_run_at } = body

    const { data, error } = await supabase
      .from('project_history')
      .insert([{
        project_id: projectId,
        project_name: body.project_name || 'Unknown Project',
        project_type: body.project_type || 'manual',
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

    return NextResponse.json({ project: data?.[0] })
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update project' },
      { status: 500 }
    )
  }
}
