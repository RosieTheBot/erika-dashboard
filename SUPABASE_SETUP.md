# Supabase Setup Instructions

## Creating the seller_golive_dates Table

The homebase dashboard now uses Supabase to persist go-live dates and task statuses.

### Step 1: Create the seller_golive_dates Table

Go to your Supabase dashboard:
1. Navigate to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Paste the SQL below:

```sql
-- Create seller_golive_dates table
CREATE TABLE IF NOT EXISTS seller_golive_dates (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  seller_id TEXT NOT NULL UNIQUE,
  golive_date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE seller_golive_dates ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow all operations
DROP POLICY IF EXISTS "Allow all operations on seller_golive_dates" ON seller_golive_dates;
CREATE POLICY "Allow all operations on seller_golive_dates" ON seller_golive_dates 
FOR ALL USING (true) WITH CHECK (true);
```

4. Click **Run** button
5. You should see: "Query executed successfully"

### Step 2: Verify Table Creation

Run this query to verify the table exists:

```sql
SELECT * FROM seller_golive_dates LIMIT 1;
```

You should see an empty result set (no error).

## What These Tables Do

### task_statuses
- Stores the status of individual tasks (Not Started, In Progress, Complete)
- Referenced by: `/api/sellers/[sellerId]/tasks`

### seller_golive_dates
- Stores the go-live date for each seller
- Referenced by: `/api/sellers/[sellerId]/golive-date`

## Notes

- Both tables use **Row Level Security (RLS)** with permissive policies
- Go-live dates are now persisted to Supabase instead of localStorage
- Task statuses are also persisted to Supabase for mobile/cross-browser compatibility
- The component has fallbacks to localStorage if the API calls fail

## Troubleshooting

If you see errors like "relation 'seller_golive_dates' does not exist":
1. Check that the SQL executed without errors
2. Refresh the page
3. Check the browser console for API errors

If RLS policies are blocking requests:
1. Navigate to **Authentication** → **Policies** in Supabase
2. Verify the policies are set to "Allow all" for testing
3. For production, implement stricter policies based on user roles
