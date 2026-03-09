-- Create seller_golive_dates table
CREATE TABLE IF NOT EXISTS public.seller_golive_dates (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  seller_id TEXT NOT NULL UNIQUE,
  golive_date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.seller_golive_dates ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
DROP POLICY IF EXISTS "Allow all operations on seller_golive_dates" ON public.seller_golive_dates;
CREATE POLICY "Allow all operations on seller_golive_dates" ON public.seller_golive_dates 
FOR ALL USING (true) WITH CHECK (true);
