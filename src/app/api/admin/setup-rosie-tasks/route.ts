import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST() {
  try {
    // Note: This would ideally be done via the Supabase dashboard directly
    // or using a service account with elevated permissions
    // For now, we'll return instructions
    
    const setupInstructions = {
      success: true,
      message: 'Please create the following tables in your Supabase dashboard',
      tables: [
        {
          name: 'agent_sessions',
          sql: `
CREATE TABLE IF NOT EXISTS agent_sessions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'idle', 'busy')),
  last_task_executed TEXT,
  current_activity TEXT,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tasks_completed INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE agent_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on agent_sessions" ON agent_sessions;
CREATE POLICY "Allow all operations on agent_sessions" ON agent_sessions
FOR ALL USING (true) WITH CHECK (true);
          `
        },
        {
          name: 'task_assignments',
          sql: `
CREATE TABLE IF NOT EXISTS task_assignments (
  id TEXT PRIMARY KEY,
  task_name TEXT NOT NULL,
  assigned_agent TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'blocked', 'complete')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  description TEXT,
  blocked_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  estimated_time TEXT,
  actual_time TEXT
);

ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on task_assignments" ON task_assignments;
CREATE POLICY "Allow all operations on task_assignments" ON task_assignments
FOR ALL USING (true) WITH CHECK (true);
          `
        }
      ],
      instructions: [
        '1. Go to your Supabase dashboard: https://app.supabase.com',
        '2. Select your project',
        '3. Click on SQL Editor in the left sidebar',
        '4. Click "New Query"',
        '5. Copy and paste each SQL statement above',
        '6. Click "Run" to execute',
        '7. Verify the tables were created by checking the Table list'
      ]
    }

    return NextResponse.json(setupInstructions)
  } catch (error) {
    console.error('Error in setup route:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to initialize setup',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Check if tables exist
    let agentSessionsExists = false
    let taskAssignmentsExists = false

    try {
      const { data, error } = await supabase
        .from('agent_sessions')
        .select('count', { count: 'exact' })
        .limit(0)
      
      if (!error) {
        agentSessionsExists = true
      }
    } catch (e) {
      // Table doesn't exist
    }

    try {
      const { data, error } = await supabase
        .from('task_assignments')
        .select('count', { count: 'exact' })
        .limit(0)
      
      if (!error) {
        taskAssignmentsExists = true
      }
    } catch (e) {
      // Table doesn't exist
    }

    return NextResponse.json({
      success: true,
      status: {
        agent_sessions: agentSessionsExists ? 'exists' : 'needs_creation',
        task_assignments: taskAssignmentsExists ? 'exists' : 'needs_creation'
      },
      message: agentSessionsExists && taskAssignmentsExists 
        ? 'All tables exist' 
        : 'Some tables need to be created'
    })
  } catch (error) {
    console.error('Error checking setup:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to check setup status',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
