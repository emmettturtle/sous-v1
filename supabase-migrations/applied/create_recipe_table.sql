-- Create recipe table with one-to-one relationship to menu_items
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID NOT NULL UNIQUE REFERENCES menu_items(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  procedure TEXT NOT NULL,
  prep_time_minutes INTEGER NOT NULL DEFAULT 0,
  cook_time_minutes INTEGER NOT NULL DEFAULT 0,
  cooking_methods TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on menu_item_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_recipes_menu_item_id ON recipes(menu_item_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Policy: Chefs can view their own recipes (through menu_items relationship)
CREATE POLICY "Chefs can view their own recipes"
  ON recipes
  FOR SELECT
  USING (
    menu_item_id IN (
      SELECT id FROM menu_items WHERE chef_id = auth.uid()
    )
  );

-- Policy: Chefs can insert recipes for their own menu items
CREATE POLICY "Chefs can insert recipes for their own menu items"
  ON recipes
  FOR INSERT
  WITH CHECK (
    menu_item_id IN (
      SELECT id FROM menu_items WHERE chef_id = auth.uid()
    )
  );

-- Policy: Chefs can update their own recipes
CREATE POLICY "Chefs can update their own recipes"
  ON recipes
  FOR UPDATE
  USING (
    menu_item_id IN (
      SELECT id FROM menu_items WHERE chef_id = auth.uid()
    )
  )
  WITH CHECK (
    menu_item_id IN (
      SELECT id FROM menu_items WHERE chef_id = auth.uid()
    )
  );

-- Policy: Chefs can delete their own recipes
CREATE POLICY "Chefs can delete their own recipes"
  ON recipes
  FOR DELETE
  USING (
    menu_item_id IN (
      SELECT id FROM menu_items WHERE chef_id = auth.uid()
    )
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
