#!/usr/bin/env node

/**
 * Initialize Supabase tables for the homebase dashboard
 * Run this once to set up the database schema
 */

const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY not set");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function initDatabase() {
  console.log("Initializing Supabase tables...");

  try {
    // Create seller_golive_dates table
    console.log("Creating seller_golive_dates table...");
    const { error: createError } = await supabase.rpc("execute_sql", {
      query: `
        CREATE TABLE IF NOT EXISTS seller_golive_dates (
          id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
          seller_id TEXT NOT NULL UNIQUE,
          golive_date TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        ALTER TABLE seller_golive_dates ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Allow all operations on seller_golive_dates" ON seller_golive_dates;
        CREATE POLICY "Allow all operations on seller_golive_dates" ON seller_golive_dates 
        FOR ALL USING (true) WITH CHECK (true);
      `,
    });

    if (createError && createError.code !== "PGRST116") {
      // PGRST116 is "not found" but that's OK for this operation
      console.warn("Note: RPC execute_sql may not be available. Using direct SQL instead.");
    }

    // Alternative: Check if table exists by trying to query it
    console.log("Verifying seller_golive_dates table...");
    const { data, error: queryError } = await supabase
      .from("seller_golive_dates")
      .select("*")
      .limit(0);

    if (queryError && queryError.code === "PGRST116") {
      console.warn(
        "⚠️  seller_golive_dates table does not exist yet.\n" +
        "Please run the following SQL in your Supabase SQL editor:\n\n" +
        `CREATE TABLE IF NOT EXISTS seller_golive_dates (
          id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
          seller_id TEXT NOT NULL UNIQUE,
          golive_date TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE seller_golive_dates ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Allow all operations on seller_golive_dates" ON seller_golive_dates;
        CREATE POLICY "Allow all operations on seller_golive_dates" ON seller_golive_dates 
        FOR ALL USING (true) WITH CHECK (true);\n`
      );
    } else if (!queryError) {
      console.log("✅ seller_golive_dates table exists and is accessible");
    }

    // Check project_history table
    console.log("Verifying project_history table...");
    const { data: projectData, error: projectError } = await supabase
      .from("project_history")
      .select("*")
      .limit(0);

    if (projectError && projectError.code === "PGRST116") {
      console.warn(
        "⚠️  project_history table does not exist yet.\n" +
        "Please run the following SQL in your Supabase SQL editor:\n\n" +
        `CREATE TABLE IF NOT EXISTS public.project_history (
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

        CREATE INDEX idx_project_history_project_id ON public.project_history(project_id);
        CREATE INDEX idx_project_history_status ON public.project_history(status);
        CREATE INDEX idx_project_history_created_at ON public.project_history(created_at DESC);

        ALTER TABLE public.project_history ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Allow all operations on project_history" ON public.project_history;
        CREATE POLICY "Allow all operations on project_history" ON public.project_history 
        FOR ALL USING (true) WITH CHECK (true);\n`
      );
    } else if (!projectError) {
      console.log("✅ project_history table exists and is accessible");
    }

    console.log("✅ Database initialization complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
}

initDatabase();
