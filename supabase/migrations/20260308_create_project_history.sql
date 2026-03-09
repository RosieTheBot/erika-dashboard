-- Create project_history table
CREATE TABLE IF NOT EXISTS public.project_history (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  project_id TEXT NOT NULL,
  project_name TEXT NOT NULL,
  project_type TEXT NOT NULL CHECK (project_type IN ('cron_job', 'memory_item', 'manual')),
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'running', 'complete')),
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on project_id for faster queries
CREATE INDEX idx_project_history_project_id ON public.project_history(project_id);
CREATE INDEX idx_project_history_status ON public.project_history(status);
CREATE INDEX idx_project_history_created_at ON public.project_history(created_at DESC);

-- Enable RLS
ALTER TABLE public.project_history ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
DROP POLICY IF EXISTS "Allow all operations on project_history" ON public.project_history;
CREATE POLICY "Allow all operations on project_history" ON public.project_history 
FOR ALL USING (true) WITH CHECK (true);
