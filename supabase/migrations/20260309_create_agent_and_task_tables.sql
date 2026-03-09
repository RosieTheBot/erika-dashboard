-- Create agent_sessions table for Rosie Tasks agent tracking
CREATE TABLE IF NOT EXISTS public.agent_sessions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('online', 'offline', 'idle', 'busy')),
  last_task_executed TEXT,
  current_activity TEXT,
  last_active_at TIMESTAMP WITH TIME ZONE,
  tasks_completed INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for agent_sessions
ALTER TABLE public.agent_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on agent_sessions"
ON public.agent_sessions FOR ALL
USING (true) WITH CHECK (true);

-- Create task_assignments table
CREATE TABLE IF NOT EXISTS public.task_assignments (
  id TEXT PRIMARY KEY,
  task_name TEXT NOT NULL,
  assigned_agent TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'blocked', 'complete')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  description TEXT,
  blocked_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  estimated_time TEXT,
  actual_time TEXT
);

-- Create RLS policies for task_assignments
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on task_assignments"
ON public.task_assignments FOR ALL
USING (true) WITH CHECK (true);

-- Create indexes for faster queries
CREATE INDEX idx_agent_sessions_status ON public.agent_sessions(status);
CREATE INDEX idx_agent_sessions_last_active ON public.agent_sessions(last_active_at DESC);
CREATE INDEX idx_task_assignments_agent ON public.task_assignments(assigned_agent);
CREATE INDEX idx_task_assignments_status ON public.task_assignments(status);
CREATE INDEX idx_task_assignments_created ON public.task_assignments(created_at DESC);
