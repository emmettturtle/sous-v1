-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Chefs can view their own recipes" ON recipes;

-- Create a simpler SELECT policy that works with joins
CREATE POLICY "Chefs can view their own recipes"
  ON recipes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM menu_items
      WHERE menu_items.id = recipes.menu_item_id
      AND menu_items.chef_id = auth.uid()
    )
  );

-- Verify the policy
SELECT policyname, qual
FROM pg_policies
WHERE tablename = 'recipes' AND cmd = 'SELECT';
