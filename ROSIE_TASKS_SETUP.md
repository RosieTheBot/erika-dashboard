# Rosie Tasks Setup Instructions

## Database Setup (Supabase)

The Rosie Tasks expansion requires a new `project_history` table in your Supabase database. Follow these steps to create it:

### Step 1: Navigate to Supabase SQL Editor
Go to: https://supabase.com/dashboard/project/qkdhcwwdldkimytghozu/sql

### Step 2: Create the project_history Table
Copy and paste the following SQL into the SQL editor and execute it:

```sql
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

-- Create indexes for faster queries
CREATE INDEX idx_project_history_project_id ON public.project_history(project_id);
CREATE INDEX idx_project_history_status ON public.project_history(status);
CREATE INDEX idx_project_history_created_at ON public.project_history(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.project_history ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
DROP POLICY IF EXISTS "Allow all operations on project_history" ON public.project_history;
CREATE POLICY "Allow all operations on project_history" ON public.project_history 
FOR ALL USING (true) WITH CHECK (true);
```

### Step 3: Verify the Table
After running the SQL, you should see the `project_history` table in the Supabase dashboard's Table Editor.

## Features

Once the database is set up, the following features are available:

### 1. Current Projects Page
- **URL**: `/rosie-tasks/current-projects`
- **Features**:
  - View all projects with their current status
  - Filter by status (all, success, failed, running, complete)
  - Click to expand and see detailed information
  - Real-time status updates (polls every 5 minutes)
  - View error messages for failed projects

### 2. Cron Jobs Page
- **URL**: `/rosie-tasks/cron-jobs`
- **Features**:
  - View all cron jobs in a table format
  - Real-time countdown timer for next scheduled run
  - Color-coded status (green=success, red=failed, yellow=due soon)
  - Last run time and next run time
  - Live countdown that updates every second

### 3. Ideas Page
- **URL**: `/rosie-tasks/ideas`
- **Features**:
  - Create new ideas with title, description, and category
  - Organize ideas by status (new, completed, dismissed)
  - Drag-and-drop support for converting ideas to projects
  - Mark ideas as completed or dismissed
  - Categorize ideas (general, automation, notifications, features, performance)

## API Endpoints

All endpoints return JSON responses:

### Projects
- `GET /api/projects` - List all projects
- `GET /api/projects/[id]` - Get project history
- `POST /api/projects` - Create new project record
- `PUT /api/projects/[id]` - Update project status

### Cron Jobs
- `GET /api/cron-jobs` - List all cron jobs

### Ideas
- `GET /api/ideas` - List all ideas
- `POST /api/ideas` - Create new idea

## Testing

To verify everything is working:

1. Visit `/rosie-tasks` in your dashboard
2. You should see three tabs: Current Projects, Cron Jobs, and Ideas
3. The pages may show "No projects found" initially, which is expected
4. Create some test data by POSTing to the APIs

## Sample API Calls

### Create a test project:
```bash
curl -X POST https://homebase-seven-chi.vercel.app/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "test_project_1",
    "project_name": "Test Project",
    "project_type": "manual",
    "status": "success",
    "error_message": null
  }'
```

### Fetch all projects:
```bash
curl https://homebase-seven-chi.vercel.app/api/projects
```

### Create a test cron job:
```bash
curl -X POST https://homebase-seven-chi.vercel.app/api/cron-jobs \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "cron_test_1",
    "project_name": "Test Cron Job",
    "schedule": "0 */6 * * *",
    "status": "success",
    "next_run_at": "2026-03-09T00:00:00Z"
  }'
```

## Notes

- Real-time updates happen every 5 minutes for projects
- Countdown timers update every second for cron jobs
- All data is stored in Supabase PostgreSQL
- Row-level security is enabled for the project_history table
