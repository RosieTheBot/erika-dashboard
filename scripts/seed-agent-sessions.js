#!/usr/bin/env node
/**
 * Seed agent_sessions table with initial Rosie team data
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const agentData = [
  {
    id: 'rosie',
    name: 'Rosie',
    role: 'Orchestrator',
    status: 'online',
    last_task_executed: 'Distributed tasks to 4 agents',
    current_activity: 'Monitoring task status and coordinating workflows',
    last_active_at: new Date(Date.now() - 1000).toISOString(),
    tasks_completed: 1247,
    error_count: 3
  },
  {
    id: 'stu',
    name: 'Stu',
    role: 'STR Analyst',
    status: 'busy',
    last_task_executed: 'AirDNA market analysis for Austin properties',
    current_activity: 'Processing revenue data for 12 properties',
    last_active_at: new Date(Date.now() - 5000).toISOString(),
    tasks_completed: 342,
    error_count: 1
  },
  {
    id: 'mel',
    name: 'Mel',
    role: 'Marketing Manager',
    status: 'online',
    last_task_executed: 'Generated buyer engagement email campaign',
    current_activity: 'Analyzing campaign performance metrics',
    last_active_at: new Date(Date.now() - 30000).toISOString(),
    tasks_completed: 189,
    error_count: 0
  },
  {
    id: 'aly',
    name: 'Aly',
    role: 'Admin Assistant',
    status: 'idle',
    last_task_executed: 'Scheduled daily sync tasks',
    current_activity: 'Waiting for new assignments',
    last_active_at: new Date(Date.now() - 180000).toISOString(),
    tasks_completed: 523,
    error_count: 2
  },
  {
    id: 'cody',
    name: 'Cody',
    role: 'Coding Agent',
    status: 'busy',
    last_task_executed: 'Deployed dashboard updates to Vercel',
    current_activity: 'Building new API endpoints for data sync',
    last_active_at: new Date(Date.now() - 3000).toISOString(),
    tasks_completed: 267,
    error_count: 0
  }
];

const taskData = [
  {
    id: 'task-001',
    task_name: 'AirDNA Market Analysis - Austin STR Portfolio',
    assigned_agent: 'Stu',
    status: 'in_progress',
    priority: 'high',
    created_at: new Date('2026-03-08T10:30:00Z').toISOString(),
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
    created_at: new Date('2026-03-08T09:15:00Z').toISOString(),
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
    created_at: new Date('2026-03-08T08:00:00Z').toISOString(),
    completed_at: new Date('2026-03-08T11:30:00Z').toISOString(),
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
    created_at: new Date('2026-03-08T07:00:00Z').toISOString(),
    completed_at: null,
    estimated_time: '3h',
    actual_time: null,
    description: 'Add agent_sessions and task_assignments tables to Supabase',
    blocked_reason: 'Waiting for database access confirmation'
  },
  {
    id: 'task-005',
    task_name: 'Organize Property Photos & Docs',
    assigned_agent: 'Aly',
    status: 'pending',
    priority: 'medium',
    created_at: new Date('2026-03-08T14:00:00Z').toISOString(),
    completed_at: null,
    estimated_time: '1h',
    actual_time: null,
    description: 'Organize and categorize property documents for 3 listings',
    blocked_reason: null
  }
];

async function seedData() {
  try {
    console.log('🌱 Seeding agent_sessions table...');
    
    // First, clear existing data
    const { error: deleteError } = await supabase
      .from('agent_sessions')
      .delete()
      .neq('id', '');
    
    if (deleteError && deleteError.code !== 'PGRST116') {
      console.warn('Warning clearing existing data:', deleteError);
    }

    // Insert agent data
    const { data: agents, error: agentError } = await supabase
      .from('agent_sessions')
      .insert(agentData)
      .select();

    if (agentError) {
      console.error('Error inserting agent data:', agentError);
      process.exit(1);
    }

    console.log(`✅ Inserted ${agents?.length || 0} agents`);

    // Seed task_assignments
    console.log('🌱 Seeding task_assignments table...');
    
    const { error: deleteTaskError } = await supabase
      .from('task_assignments')
      .delete()
      .neq('id', '');
    
    if (deleteTaskError && deleteTaskError.code !== 'PGRST116') {
      console.warn('Warning clearing existing tasks:', deleteTaskError);
    }

    const { data: tasks, error: taskError } = await supabase
      .from('task_assignments')
      .insert(taskData)
      .select();

    if (taskError) {
      console.error('Error inserting task data:', taskError);
      process.exit(1);
    }

    console.log(`✅ Inserted ${tasks?.length || 0} tasks`);
    console.log('');
    console.log('✅ Database seeding complete!');
    console.log('Agents:', agents?.map(a => `${a.name} (${a.status})`).join(', '));
    console.log('Tasks:', tasks?.map(t => `${t.task_name} (${t.status})`).join(', '));
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

seedData();
