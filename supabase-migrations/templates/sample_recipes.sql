-- Sample Recipe Data
-- This script provides examples of how to insert recipes for your menu items.
-- Replace the menu_item_id values with actual IDs from your menu_items table.

-- Example 1: Grilled Salmon
-- First, find the menu_item_id for your salmon dish:
-- SELECT id FROM menu_items WHERE name LIKE '%salmon%';

/*
INSERT INTO recipes (
  menu_item_id,
  title,
  ingredients,
  procedure,
  prep_time_minutes,
  cook_time_minutes,
  cooking_methods
) VALUES (
  'your-menu-item-id-here',
  'Grilled Salmon with Lemon Herb Butter',
  '[
    {"name": "salmon fillets", "amount": "4 (6 oz)"},
    {"name": "olive oil", "amount": "2 tbsp"},
    {"name": "butter", "amount": "4 tbsp"},
    {"name": "fresh lemon juice", "amount": "3 tbsp"},
    {"name": "fresh parsley, chopped", "amount": "2 tbsp"},
    {"name": "garlic, minced", "amount": "2 cloves"},
    {"name": "salt", "amount": "to taste"},
    {"name": "black pepper", "amount": "to taste"}
  ]'::jsonb,
  'Preheat grill to medium-high heat.
Brush salmon fillets with olive oil and season with salt and pepper.
Place salmon on grill, skin-side down.
Grill for 4-5 minutes per side, or until fish flakes easily with a fork.
While salmon cooks, melt butter in a small saucepan.
Add garlic and cook for 1 minute until fragrant.
Remove from heat and stir in lemon juice and parsley.
Transfer grilled salmon to plates and drizzle with lemon herb butter.
Serve immediately with your choice of sides.',
  15,
  12,
  ARRAY['grill', 'stovetop']
);
*/

-- Example 2: Chicken Parmesan
/*
INSERT INTO recipes (
  menu_item_id,
  title,
  ingredients,
  procedure,
  prep_time_minutes,
  cook_time_minutes,
  cooking_methods
) VALUES (
  'your-menu-item-id-here',
  'Classic Chicken Parmesan',
  '[
    {"name": "chicken breasts, pounded thin", "amount": "4"},
    {"name": "all-purpose flour", "amount": "1 cup"},
    {"name": "eggs, beaten", "amount": "2"},
    {"name": "Italian breadcrumbs", "amount": "2 cups"},
    {"name": "parmesan cheese, grated", "amount": "1 cup"},
    {"name": "mozzarella cheese, shredded", "amount": "2 cups"},
    {"name": "marinara sauce", "amount": "2 cups"},
    {"name": "olive oil", "amount": "1/4 cup"},
    {"name": "fresh basil", "amount": "for garnish"},
    {"name": "salt and pepper", "amount": "to taste"}
  ]'::jsonb,
  'Preheat oven to 400°F (200°C).
Season chicken breasts with salt and pepper.
Set up breading station with three shallow dishes: flour in first, beaten eggs in second, and breadcrumbs mixed with 1/2 cup parmesan in third.
Dredge each chicken breast in flour, then egg, then breadcrumb mixture, pressing to adhere.
Heat olive oil in large oven-safe skillet over medium-high heat.
Cook breaded chicken for 3-4 minutes per side until golden brown.
Spoon marinara sauce over each chicken breast.
Top with remaining parmesan and mozzarella cheese.
Transfer skillet to oven and bake for 15-20 minutes until cheese is melted and bubbly.
Garnish with fresh basil and serve with pasta.',
  20,
  30,
  ARRAY['stovetop', 'oven']
);
*/

-- Example 3: Vegetable Stir Fry
/*
INSERT INTO recipes (
  menu_item_id,
  title,
  ingredients,
  procedure,
  prep_time_minutes,
  cook_time_minutes,
  cooking_methods
) VALUES (
  'your-menu-item-id-here',
  'Asian Vegetable Stir Fry',
  '[
    {"name": "broccoli florets", "amount": "2 cups"},
    {"name": "bell peppers, sliced", "amount": "2"},
    {"name": "snap peas", "amount": "1 cup"},
    {"name": "carrots, julienned", "amount": "2"},
    {"name": "garlic, minced", "amount": "3 cloves"},
    {"name": "ginger, grated", "amount": "1 tbsp"},
    {"name": "soy sauce", "amount": "3 tbsp"},
    {"name": "sesame oil", "amount": "2 tbsp"},
    {"name": "vegetable oil", "amount": "2 tbsp"},
    {"name": "cornstarch", "amount": "1 tbsp"},
    {"name": "water", "amount": "1/4 cup"},
    {"name": "sesame seeds", "amount": "for garnish"}
  ]'::jsonb,
  'Prepare all vegetables by washing and cutting as specified.
In a small bowl, whisk together soy sauce, sesame oil, cornstarch, and water to make sauce.
Heat vegetable oil in a large wok or skillet over high heat.
Add garlic and ginger, stir-fry for 30 seconds until fragrant.
Add carrots and broccoli, stir-fry for 3 minutes.
Add bell peppers and snap peas, stir-fry for 2 minutes.
Pour sauce over vegetables and toss to coat.
Cook for 1-2 minutes until sauce thickens and vegetables are crisp-tender.
Sprinkle with sesame seeds and serve over rice or noodles.',
  15,
  10,
  ARRAY['stovetop']
);
*/

-- Example 4: Beef Tacos
/*
INSERT INTO recipes (
  menu_item_id,
  title,
  ingredients,
  procedure,
  prep_time_minutes,
  cook_time_minutes,
  cooking_methods
) VALUES (
  'your-menu-item-id-here',
  'Seasoned Beef Tacos',
  '[
    {"name": "ground beef", "amount": "2 lbs"},
    {"name": "taco seasoning", "amount": "3 tbsp"},
    {"name": "water", "amount": "1/2 cup"},
    {"name": "taco shells", "amount": "12"},
    {"name": "lettuce, shredded", "amount": "2 cups"},
    {"name": "tomatoes, diced", "amount": "2"},
    {"name": "cheddar cheese, shredded", "amount": "2 cups"},
    {"name": "sour cream", "amount": "1 cup"},
    {"name": "salsa", "amount": "1 cup"},
    {"name": "onion, diced", "amount": "1"}
  ]'::jsonb,
  'Heat a large skillet over medium-high heat.
Add ground beef and cook, breaking up with a spoon, until browned (8-10 minutes).
Drain excess fat from the pan.
Add taco seasoning and water to the beef.
Stir well and simmer for 5 minutes until sauce thickens.
While beef simmers, prepare toppings: shred lettuce, dice tomatoes and onion, grate cheese.
Warm taco shells according to package directions.
Fill each taco shell with seasoned beef.
Top with lettuce, tomatoes, cheese, onion, sour cream, and salsa as desired.
Serve immediately.',
  10,
  15,
  ARRAY['stovetop']
);
*/

-- To use these examples:
-- 1. Find your menu item IDs: SELECT id, name FROM menu_items WHERE chef_id = auth.uid();
-- 2. Replace 'your-menu-item-id-here' with actual menu item IDs
-- 3. Uncomment the INSERT statement you want to use
-- 4. Run the SQL in your Supabase SQL editor
