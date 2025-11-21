-- Create prep_schedules table for persisting production schedules
CREATE TABLE IF NOT EXISTS prep_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chef_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  prep_list_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  schedule_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  time_window_start TEXT NOT NULL DEFAULT '06:00',
  time_window_end TEXT NOT NULL DEFAULT '17:00',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on chef_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_prep_schedules_chef_id ON prep_schedules(chef_id);

-- Enable Row Level Security
ALTER TABLE prep_schedules ENABLE ROW LEVEL SECURITY;

-- Policy: Chefs can view their own schedules
CREATE POLICY "Chefs can view their own schedules"
  ON prep_schedules
  FOR SELECT
  USING (chef_id = auth.uid());

-- Policy: Chefs can insert their own schedules
CREATE POLICY "Chefs can insert their own schedules"
  ON prep_schedules
  FOR INSERT
  WITH CHECK (chef_id = auth.uid());

-- Policy: Chefs can update their own schedules
CREATE POLICY "Chefs can update their own schedules"
  ON prep_schedules
  FOR UPDATE
  USING (chef_id = auth.uid())
  WITH CHECK (chef_id = auth.uid());

-- Policy: Chefs can delete their own schedules
CREATE POLICY "Chefs can delete their own schedules"
  ON prep_schedules
  FOR DELETE
  USING (chef_id = auth.uid());

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_prep_schedules_updated_at
  BEFORE UPDATE ON prep_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
