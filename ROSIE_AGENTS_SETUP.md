# Rosie Tasks - Agent Organization Setup

## Overview

The Homebase dashboard has been expanded with three new pages for managing the Rosie Task Orchestration System:

1. **Org Chart** (`/rosie-tasks/org-chart`) - Visual hierarchy of agents
2. **Agent Status** (`/rosie-tasks/agent-status`) - Real-time agent activity and status
3. **Task Assignments** (`/rosie-tasks/task-assignments`) - Task management and tracking

## Deployment Status

✅ **All pages are LIVE at https://homebase-seven-chi.vercel.app**

### Pages Deployed
- ✅ `/rosie-tasks/org-chart` - Agent organizational structure
- ✅ `/rosie-tasks/agent-status` - Real-time status dashboard
- ✅ `/rosie-tasks/task-assignments` - Task tracking and assignment

### API Routes Deployed
- ✅ `GET /api/rosie-tasks/agent-status` - Fetch agent status data
- ✅ `GET /api/rosie-tasks/task-assignments` - Fetch task assignments
- ✅ `GET /api/admin/setup-rosie-tasks` - Check database setup status

## Current Status

The pages are fully functional with **mock data**. To use real data from Supabase, you need to create two tables.

## Database Setup Instructions

### Step 1: Create the `agent_sessions` Table

Go to your Supabase dashboard:
1. Navigate to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Paste the following SQL:

```sql
-- Create agent_sessions table
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

-- Enable Row Level Security
ALTER TABLE agent_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow all operations
DROP POLICY IF EXISTS "Allow all operations on agent_sessions" ON agent_sessions;
CREATE POLICY "Allow all operations on agent_sessions" ON agent_sessions
FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_sessions_status ON agent_sessions(status);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_last_active ON agent_sessions(last_active_at DESC);
```

4. Click **Run** button

### Step 2: Create the `task_assignments` Table

In the same SQL Editor:
1. Click **New Query**
2. Paste the following SQL:

```sql
-- Create task_assignments table
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

-- Enable Row Level Security
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow all operations
DROP POLICY IF EXISTS "Allow all operations on task_assignments" ON task_assignments;
CREATE POLICY "Allow all operations on task_assignments" ON task_assignments
FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_assignments_agent ON task_assignments(assigned_agent);
CREATE INDEX IF NOT EXISTS idx_task_assignments_status ON task_assignments(status);
CREATE INDEX IF NOT EXISTS idx_task_assignments_priority ON task_assignments(priority DESC);
CREATE INDEX IF NOT EXISTS idx_task_assignments_created ON task_assignments(created_at DESC);
```

3. Click **Run** button

### Step 3: Verify Tables Were Created

Run this query to verify:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('agent_sessions', 'task_assignments');
```

You should see both tables listed.

## Populating Initial Data

Once the tables are created, you can populate them with initial data:

### Add Agent Sessions

```sql
INSERT INTO agent_sessions (id, name, role, status, current_activity, last_task_executed, tasks_completed, error_count) VALUES
('rosie', 'Rosie', 'Orchestrator', 'online', 'Coordinating system', 'Distributed tasks to 4 agents', 1247, 3),
('stu', 'Stu', 'STR Analyst', 'busy', 'Analyzing Austin properties', 'AirDNA market analysis', 342, 1),
('mel', 'Mel', 'Marketing Manager', 'online', 'Analyzing campaigns', 'Generated buyer email campaign', 189, 0),
('aly', 'Aly', 'Admin Assistant', 'idle', 'Waiting for assignments', 'Scheduled daily sync tasks', 523, 2),
('cody', 'Cody', 'Coding Agent', 'busy', 'Building API endpoints', 'Deployed dashboard updates', 267, 0)
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  current_activity = EXCLUDED.current_activity,
  tasks_completed = EXCLUDED.tasks_completed,
  error_count = EXCLUDED.error_count,
  updated_at = NOW();
```

## Usage

Once the database is set up:

1. **Agent Status Page** will display real-time agent data from Supabase
2. **Task Assignments** will show tasks from the database
3. **Data updates** will be reflected in the dashboard in real-time (or on next page load)

## API Response Format

### Agent Status API

```json
{
  "success": true,
  "agents": [
    {
      "id": "rosie",
      "name": "Rosie",
      "role": "Orchestrator",
      "status": "online",
      "last_task_executed": "Distributed tasks to 4 agents",
      "current_activity": "Monitoring task status",
      "last_active_at": "2026-03-08T21:56:15.566Z",
      "tasks_completed": 1247,
      "error_count": 3
    }
  ],
  "timestamp": "2026-03-08T21:56:16.566Z",
  "source": "supabase"
}
```

### Task Assignments API

```json
{
  "success": true,
  "tasks": [
    {
      "id": "task-001",
      "task_name": "AirDNA Market Analysis",
      "assigned_agent": "Stu",
      "status": "in_progress",
      "priority": "high",
      "created_at": "2026-03-08T10:30:00Z",
      "description": "Analyze properties...",
      "estimated_time": "2h",
      "actual_time": null
    }
  ],
  "total": 1,
  "timestamp": "2026-03-08T21:56:18.515Z",
  "source": "supabase"
}
```

## Features

### Org Chart Page
- Visual hierarchy with Rosie as orchestrator at top
- 4 specialized agents below (Stu, Mel, Aly, Cody)
- Agent domains and focus areas displayed
- Color-coded by agent type
- System stats (5 agents, 100% operational)

### Agent Status Page
- Real-time status for each agent (online/offline/idle/busy)
- Last task executed with timestamp
- Current activity display
- Task completion counts and error tracking
- System health metrics
- Auto-refresh option (every 30 seconds)

### Task Assignments Page
- Complete task list with filtering by:
  - Agent assignment
  - Status (pending/in_progress/blocked/complete)
  - Priority (low/medium/high/critical)
- Expandable task details including:
  - Task description
  - Created/completed timestamps
  - Estimated vs actual time
  - Blocked reason (if applicable)
- Agent workload summary
- Task statistics

## Architecture

### Frontend Components
- React Client Components (Next.js 15)
- Tailwind CSS styling
- Lucide React icons
- Responsive grid layouts

### Backend APIs
- Next.js API Routes
- Supabase integration for data persistence
- Mock data fallback when tables don't exist
- Error handling and graceful degradation

### Database Schema
- Two main tables: `agent_sessions` and `task_assignments`
- Row Level Security (RLS) enabled
- Indexed for performance
- Timestamps for audit trail

## Troubleshooting

### Tables Show as "needs_creation"
- Check that SQL executed without errors in Supabase
- Refresh the page
- Verify using the verification query above

### Mock Data Showing Instead of Real Data
- This is expected until the Supabase tables are created
- Once tables are created, the API will automatically use Supabase data
- No code changes needed

### API Returns Error
- Check browser console for error messages
- Verify Supabase credentials in `.env.production`
- Confirm RLS policies are permissive

## Next Steps

1. **Set up the database** using the SQL instructions above
2. **Populate initial data** with your agent information
3. **Update data** as needed through the Supabase dashboard or API
4. **Monitor** agent activity and task progress through the new dashboard pages

## Files Modified/Created

- ✅ `src/app/rosie-tasks/org-chart/page.tsx` - Org chart page
- ✅ `src/app/rosie-tasks/agent-status/page.tsx` - Agent status page
- ✅ `src/app/rosie-tasks/task-assignments/page.tsx` - Task assignments page
- ✅ `src/app/api/rosie-tasks/agent-status/route.ts` - Agent status API
- ✅ `src/app/api/rosie-tasks/task-assignments/route.ts` - Task assignments API
- ✅ `src/app/api/admin/setup-rosie-tasks/route.ts` - Setup/status API
- ✅ `src/app/rosie-tasks/layout.tsx` - Updated with new tabs

## Deployment Info

- **Project**: homebase
- **URL**: https://homebase-seven-chi.vercel.app
- **Environment**: Production
- **Last Deployed**: 2026-03-08 21:56 UTC
- **Build Status**: ✅ Successful

---

**Created**: 2026-03-08
**Status**: Deployed and Verified ✅
