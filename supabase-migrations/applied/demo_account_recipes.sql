-- Demo Account Sample Data
-- Chef UUID: 865a9368-a76d-4093-842a-2fa60361a866
-- This script creates sample menu items and recipes for testing the Prep Assistant

-- First, create sample menu items if they don't exist
INSERT INTO menu_items (
  id,
  chef_id,
  name,
  description,
  cuisine_type,
  ingredients,
  allergens,
  tags,
  meal_type,
  difficulty_level,
  prep_time_minutes,
  price,
  is_available
) VALUES
-- 1. Grilled Salmon
(
  'a1b2c3d4-e5f6-4a5b-8c9d-123456789001'::uuid,
  '865a9368-a76d-4093-842a-2fa60361a866'::uuid,
  'Grilled Salmon with Lemon Herb Butter',
  'Fresh Atlantic salmon grilled to perfection with a zesty lemon herb butter sauce',
  'American',
  ARRAY['salmon', 'lemon', 'butter', 'parsley', 'garlic'],
  ARRAY['fish', 'dairy'],
  ARRAY['seafood', 'healthy', 'gluten-free'],
  'dinner',
  'medium',
  15,
  28.00,
  true
),
-- 2. Chicken Parmesan
(
  'a1b2c3d4-e5f6-4a5b-8c9d-123456789002'::uuid,
  '865a9368-a76d-4093-842a-2fa60361a866'::uuid,
  'Classic Chicken Parmesan',
  'Breaded chicken breast topped with marinara sauce and melted mozzarella cheese',
  'Italian',
  ARRAY['chicken', 'breadcrumbs', 'mozzarella', 'parmesan', 'marinara sauce'],
  ARRAY['gluten', 'dairy', 'eggs'],
  ARRAY['italian', 'comfort food', 'family-friendly'],
  'dinner',
  'medium',
  20,
  24.00,
  true
),
-- 3. Vegetable Stir Fry
(
  'a1b2c3d4-e5f6-4a5b-8c9d-123456789003'::uuid,
  '865a9368-a76d-4093-842a-2fa60361a866'::uuid,
  'Asian Vegetable Stir Fry',
  'Colorful mix of fresh vegetables in a savory Asian-inspired sauce',
  'Asian',
  ARRAY['broccoli', 'bell peppers', 'snap peas', 'carrots', 'soy sauce', 'sesame oil'],
  ARRAY['soy'],
  ARRAY['vegetarian', 'vegan', 'healthy', 'quick'],
  'dinner',
  'easy',
  15,
  18.00,
  true
),
-- 4. Beef Tacos
(
  'a1b2c3d4-e5f6-4a5b-8c9d-123456789004'::uuid,
  '865a9368-a76d-4093-842a-2fa60361a866'::uuid,
  'Seasoned Beef Tacos',
  'Flavorful ground beef tacos with all your favorite toppings',
  'Mexican',
  ARRAY['ground beef', 'taco shells', 'lettuce', 'tomatoes', 'cheese', 'sour cream'],
  ARRAY['dairy', 'gluten'],
  ARRAY['mexican', 'family-friendly', 'quick'],
  'dinner',
  'easy',
  10,
  16.00,
  true
),
-- 5. Mushroom Risotto
(
  'a1b2c3d4-e5f6-4a5b-8c9d-123456789005'::uuid,
  '865a9368-a76d-4093-842a-2fa60361a866'::uuid,
  'Creamy Mushroom Risotto',
  'Rich and creamy Italian rice dish with wild mushrooms and parmesan',
  'Italian',
  ARRAY['arborio rice', 'mushrooms', 'white wine', 'parmesan', 'butter', 'chicken stock'],
  ARRAY['dairy', 'alcohol'],
  ARRAY['italian', 'vegetarian', 'comfort food'],
  'dinner',
  'hard',
  10,
  22.00,
  true
)
ON CONFLICT (id) DO NOTHING;

-- Now create recipes for these menu items
INSERT INTO recipes (
  menu_item_id,
  title,
  ingredients,
  procedure,
  prep_time_minutes,
  cook_time_minutes,
  cooking_methods
) VALUES
-- Recipe 1: Grilled Salmon
(
  'a1b2c3d4-e5f6-4a5b-8c9d-123456789001'::uuid,
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
),
-- Recipe 2: Chicken Parmesan
(
  'a1b2c3d4-e5f6-4a5b-8c9d-123456789002'::uuid,
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
),
-- Recipe 3: Vegetable Stir Fry
(
  'a1b2c3d4-e5f6-4a5b-8c9d-123456789003'::uuid,
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
),
-- Recipe 4: Beef Tacos
(
  'a1b2c3d4-e5f6-4a5b-8c9d-123456789004'::uuid,
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
),
-- Recipe 5: Mushroom Risotto
(
  'a1b2c3d4-e5f6-4a5b-8c9d-123456789005'::uuid,
  'Creamy Mushroom Risotto',
  '[
    {"name": "arborio rice", "amount": "2 cups"},
    {"name": "mixed mushrooms, sliced", "amount": "1 lb"},
    {"name": "chicken or vegetable stock", "amount": "6 cups"},
    {"name": "white wine", "amount": "1 cup"},
    {"name": "onion, finely diced", "amount": "1"},
    {"name": "garlic, minced", "amount": "3 cloves"},
    {"name": "parmesan cheese, grated", "amount": "1 cup"},
    {"name": "butter", "amount": "4 tbsp"},
    {"name": "olive oil", "amount": "2 tbsp"},
    {"name": "fresh thyme", "amount": "2 tsp"},
    {"name": "salt and pepper", "amount": "to taste"}
  ]'::jsonb,
  'Heat stock in a saucepan and keep warm over low heat.
In a large pan, heat olive oil and 2 tbsp butter over medium heat.
Add mushrooms and cook until golden brown, about 8 minutes. Remove and set aside.
In the same pan, add remaining butter and sauté onion until translucent, about 5 minutes.
Add garlic and rice, stirring for 2 minutes until rice is lightly toasted.
Pour in white wine and stir until absorbed.
Add warm stock one ladle at a time, stirring frequently and allowing each addition to be absorbed before adding more.
Continue for about 20-25 minutes until rice is creamy and al dente.
Stir in cooked mushrooms, parmesan, and thyme.
Season with salt and pepper to taste.
Serve immediately while hot and creamy.',
  10,
  35,
  ARRAY['stovetop']
)
ON CONFLICT (menu_item_id) DO NOTHING;

-- Verify the data
SELECT
  mi.name as menu_item,
  r.title as recipe_title,
  r.prep_time_minutes,
  r.cook_time_minutes,
  r.cooking_methods
FROM menu_items mi
LEFT JOIN recipes r ON r.menu_item_id = mi.id
WHERE mi.chef_id = '865a9368-a76d-4093-842a-2fa60361a866'
ORDER BY mi.name;
