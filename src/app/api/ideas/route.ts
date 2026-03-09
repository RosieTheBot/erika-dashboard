import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qkdhcwwdldkimytghozu.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function GET(request: Request) {
  try {
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json({ 
      ideas: data || []
    })
  } catch (error) {
    console.error('Error fetching ideas:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch ideas' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, description, category, status = 'new' } = body

    const { data, error } = await supabase
      .from('ideas')
      .insert([
        {
          title,
          description: description || '',
          category: category || 'general',
          status,
          created_at: new Date().toISOString()
        }
      ])
      .select()

    if (error) throw error

    return NextResponse.json({ idea: data?.[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating idea:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create idea' },
      { status: 500 }
    )
  }
}
