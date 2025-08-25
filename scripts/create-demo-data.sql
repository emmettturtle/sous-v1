-- Demo Data Script for Sous Agent
-- This script creates a demo chef account with sample clients, preferences, and menu items
-- Run this in your Supabase SQL Editor

-- =============================================
-- STEP 1: Create Demo Chef Account
-- =============================================
-- Note: You'll need to create the auth user through Supabase Auth first
-- Email: demo@sousagent.com
-- Password: DemoChef2024!
-- After creating the auth user, get the UUID and replace 'DEMO_CHEF_UUID' below

-- Replace this UUID with the actual UUID from the auth.users table after creating the demo account
-- You can find it by running: SELECT id FROM auth.users WHERE email = 'demo@sousagent.com';
-- For now, using a placeholder - REPLACE THIS!
DO $$
DECLARE
    demo_chef_id uuid := '865a9368-a76d-4093-842a-2fa60361a866'; -- REPLACE WITH ACTUAL UUID
    client_ids uuid[] := ARRAY[]::uuid[];
    client_id uuid;
BEGIN
    -- Verify chef exists (will error if not found)
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = demo_chef_id) THEN
        RAISE EXCEPTION 'Demo chef not found. Please create auth user first with email: demo@sousagent.com';
    END IF;

    -- =============================================
    -- STEP 2: Create Sample Clients
    -- =============================================

    -- Client 1: Sarah Martinez (Health-conscious vegetarian)
    INSERT INTO clients (chef_id, name, email, phone, household_size, address) VALUES 
    (demo_chef_id, 'Sarah Martinez', 'sarah.martinez@email.com', '+1-555-0101', 2, 
     '{"street": "123 Garden Ave", "city": "San Francisco", "state": "CA", "zip": "94102"}'::jsonb)
    RETURNING id INTO client_id;
    client_ids := array_append(client_ids, client_id);

    INSERT INTO client_preferences (client_id, dietary_restrictions, allergies, cuisine_preferences, 
    disliked_ingredients, preferred_ingredients, spice_tolerance, meal_prep_preferences, budget_per_meal) VALUES
    (client_id, 
     ARRAY['vegetarian', 'gluten-free'], 
     ARRAY['nuts', 'dairy'], 
     ARRAY['mediterranean', 'asian', 'mexican'],
     ARRAY['mushrooms', 'brussels-sprouts'], 
     ARRAY['quinoa', 'chickpeas', 'avocado', 'spinach'], 
     'medium',
     '{"batch_cooking": true, "individual_portions": false}'::jsonb,
     25.00);

    -- Client 2: Michael Chen (Busy professional, loves Asian cuisine)
    INSERT INTO clients (chef_id, name, email, phone, household_size, address) VALUES 
    (demo_chef_id, 'Michael Chen', 'michael.chen@email.com', '+1-555-0102', 1, 
     '{"street": "456 Tech Blvd", "city": "Palo Alto", "state": "CA", "zip": "94301"}'::jsonb)
    RETURNING id INTO client_id;
    client_ids := array_append(client_ids, client_id);

    INSERT INTO client_preferences (client_id, dietary_restrictions, allergies, cuisine_preferences, 
    disliked_ingredients, preferred_ingredients, spice_tolerance, meal_prep_preferences, budget_per_meal) VALUES
    (client_id, 
     ARRAY[]::text[], 
     ARRAY['shellfish'], 
     ARRAY['asian', 'fusion', 'american'],
     ARRAY['cilantro', 'olives'], 
     ARRAY['chicken', 'rice', 'ginger', 'garlic'], 
     'hot',
     '{"batch_cooking": false, "individual_portions": true}'::jsonb,
     35.00);

    -- Client 3: The Johnson Family (Family with kids, comfort food)
    INSERT INTO clients (chef_id, name, email, phone, household_size, address) VALUES 
    (demo_chef_id, 'Emily & David Johnson', 'johnson.family@email.com', '+1-555-0103', 4, 
     '{"street": "789 Oak Street", "city": "Berkeley", "state": "CA", "zip": "94705"}'::jsonb)
    RETURNING id INTO client_id;
    client_ids := array_append(client_ids, client_id);

    INSERT INTO client_preferences (client_id, dietary_restrictions, allergies, cuisine_preferences, 
    disliked_ingredients, preferred_ingredients, spice_tolerance, meal_prep_preferences, budget_per_meal) VALUES
    (client_id, 
     ARRAY[]::text[], 
     ARRAY['peanuts'], 
     ARRAY['american', 'italian', 'comfort'],
     ARRAY['spicy-peppers', 'blue-cheese'], 
     ARRAY['chicken', 'pasta', 'cheese', 'ground-beef'], 
     'mild',
     '{"batch_cooking": true, "individual_portions": false}'::jsonb,
     20.00);

    -- Client 4: Alexandra Thompson (Keto enthusiast, sophisticated palate)
    INSERT INTO clients (chef_id, name, email, phone, household_size, address) VALUES 
    (demo_chef_id, 'Alexandra Thompson', 'alex.thompson@email.com', '+1-555-0104', 1, 
     '{"street": "321 Wine Country Rd", "city": "Napa", "state": "CA", "zip": "94558"}'::jsonb)
    RETURNING id INTO client_id;
    client_ids := array_append(client_ids, client_id);

    INSERT INTO client_preferences (client_id, dietary_restrictions, allergies, cuisine_preferences, 
    disliked_ingredients, preferred_ingredients, spice_tolerance, meal_prep_preferences, budget_per_meal) VALUES
    (client_id, 
     ARRAY['keto', 'low-carb'], 
     ARRAY[]::text[], 
     ARRAY['french', 'italian', 'mediterranean'],
     ARRAY['bread', 'potatoes', 'rice'], 
     ARRAY['salmon', 'avocado', 'olive-oil', 'herbs'], 
     'medium',
     '{"batch_cooking": false, "individual_portions": true}'::jsonb,
     50.00);

    -- Client 5: Roberto & Maria Gonzalez (Latino couple, traditional + healthy)
    INSERT INTO clients (chef_id, name, email, phone, household_size, address) VALUES 
    (demo_chef_id, 'Roberto & Maria Gonzalez', 'gonzalez.couple@email.com', '+1-555-0105', 2, 
     '{"street": "654 Mission Street", "city": "San Jose", "state": "CA", "zip": "95112"}'::jsonb)
    RETURNING id INTO client_id;
    client_ids := array_append(client_ids, client_id);

    INSERT INTO client_preferences (client_id, dietary_restrictions, allergies, cuisine_preferences, 
    disliked_ingredients, preferred_ingredients, spice_tolerance, meal_prep_preferences, budget_per_meal) VALUES
    (client_id, 
     ARRAY['heart-healthy'], 
     ARRAY[]::text[], 
     ARRAY['mexican', 'latin-american', 'mediterranean'],
     ARRAY['liver', 'kidneys'], 
     ARRAY['beans', 'lean-beef', 'tomatoes', 'peppers'], 
     'medium',
     '{"batch_cooking": true, "individual_portions": false}'::jsonb,
     30.00);

    -- =============================================
    -- STEP 3: Create Sample Menu Items (15 recipes)
    -- =============================================

    -- Mediterranean Cuisine (5 items)
    INSERT INTO menu_items (chef_id, name, description, ingredients, allergens, tags, 
    meal_type, cuisine_type, prep_time_minutes, difficulty_level, price, is_available, seasonal_availability) VALUES
    
    (demo_chef_id, 'Mediterranean Quinoa Bowl', 
     'Healthy quinoa bowl with roasted vegetables, chickpeas, and tahini dressing',
     ARRAY['quinoa', 'chickpeas', 'bell-peppers', 'zucchini', 'red-onion', 'tahini', 'lemon-juice', 'olive-oil', 'parsley'],
     ARRAY['sesame'], 
     ARRAY['healthy', 'vegetarian', 'gluten-free', 'high-protein'],
     'lunch', 'mediterranean', 45, 'medium', 18.00, true,
     ARRAY['spring', 'summer', 'fall']),

    (demo_chef_id, 'Greek-Style Lemon Chicken', 
     'Tender chicken thighs marinated in lemon, oregano, and olive oil, served with roasted potatoes',
     ARRAY['chicken-thighs', 'lemon', 'oregano', 'olive-oil', 'garlic', 'potatoes', 'onion'],
     ARRAY[]::text[], 
     ARRAY['protein-rich', 'gluten-free', 'comfort-food'],
     'dinner', 'mediterranean', 60, 'easy', 22.00, true,
     ARRAY['spring', 'summer', 'fall', 'winter']),

    (demo_chef_id, 'Stuffed Bell Peppers', 
     'Colorful bell peppers stuffed with ground turkey, rice, and Mediterranean herbs',
     ARRAY['bell-peppers', 'ground-turkey', 'brown-rice', 'tomatoes', 'onion', 'feta-cheese', 'pine-nuts', 'mint'],
     ARRAY['dairy', 'nuts'], 
     ARRAY['high-protein', 'comfort-food'],
     'dinner', 'mediterranean', 75, 'medium', 20.00, true,
     ARRAY['summer', 'fall']),

    (demo_chef_id, 'Pan-Seared Salmon with Herb Crust', 
     'Atlantic salmon with a Mediterranean herb crust, served with lemon quinoa',
     ARRAY['salmon-fillet', 'parsley', 'dill', 'capers', 'lemon-zest', 'quinoa', 'olive-oil'],
     ARRAY['fish'], 
     ARRAY['high-protein', 'omega-3', 'gluten-free', 'keto-friendly'],
     'dinner', 'mediterranean', 30, 'medium', 28.00, true,
     ARRAY['spring', 'summer', 'fall', 'winter']),

    (demo_chef_id, 'Moroccan-Spiced Chickpea Stew', 
     'Hearty stew with chickpeas, sweet potatoes, and warming Moroccan spices',
     ARRAY['chickpeas', 'sweet-potatoes', 'tomatoes', 'onion', 'cumin', 'paprika', 'cinnamon', 'vegetable-broth'],
     ARRAY[]::text[], 
     ARRAY['vegan', 'high-fiber', 'warming', 'comfort-food'],
     'dinner', 'mediterranean', 50, 'easy', 16.00, true,
     ARRAY['fall', 'winter']),

    -- Asian Cuisine (4 items)
    (demo_chef_id, 'Korean-Style Beef Bowl', 
     'Tender marinated beef served over steamed rice with pickled vegetables',
     ARRAY['beef-sirloin', 'soy-sauce', 'sesame-oil', 'brown-sugar', 'garlic', 'ginger', 'jasmine-rice', 'carrots', 'cucumber'],
     ARRAY['soy', 'sesame'], 
     ARRAY['high-protein', 'comfort-food', 'umami-rich'],
     'dinner', 'asian', 40, 'medium', 24.00, true,
     ARRAY['spring', 'summer', 'fall', 'winter']),

    (demo_chef_id, 'Thai Coconut Curry Chicken', 
     'Creamy coconut curry with chicken, vegetables, and fragrant Thai basil',
     ARRAY['chicken-breast', 'coconut-milk', 'red-curry-paste', 'bell-peppers', 'bamboo-shoots', 'thai-basil', 'jasmine-rice'],
     ARRAY[]::text[], 
     ARRAY['creamy', 'spicy', 'comfort-food'],
     'dinner', 'asian', 35, 'easy', 21.00, true,
     ARRAY['spring', 'summer', 'fall', 'winter']),

    (demo_chef_id, 'Miso-Glazed Cod with Bok Choy', 
     'Delicate cod glazed with sweet miso, served with sautéed bok choy',
     ARRAY['cod-fillet', 'white-miso', 'mirin', 'sake', 'brown-sugar', 'bok-choy', 'sesame-seeds'],
     ARRAY['fish', 'soy', 'sesame'], 
     ARRAY['high-protein', 'low-carb', 'umami-rich'],
     'dinner', 'asian', 25, 'medium', 26.00, true,
     ARRAY['spring', 'summer', 'fall', 'winter']),

    (demo_chef_id, 'Vietnamese Pho-Inspired Chicken Soup', 
     'Aromatic chicken broth with rice noodles, herbs, and tender chicken',
     ARRAY['chicken-thighs', 'rice-noodles', 'star-anise', 'ginger', 'onion', 'cilantro', 'bean-sprouts', 'lime'],
     ARRAY[]::text[], 
     ARRAY['comfort-food', 'warming', 'light'],
     'lunch', 'asian', 120, 'hard', 19.00, true,
     ARRAY['fall', 'winter']),

    -- American/Comfort Food (3 items)
    (demo_chef_id, 'Truffle Mac and Cheese', 
     'Elevated comfort food with artisanal cheeses and truffle oil',
     ARRAY['pasta', 'cheddar-cheese', 'gruyere-cheese', 'truffle-oil', 'heavy-cream', 'butter', 'panko-breadcrumbs'],
     ARRAY['gluten', 'dairy'], 
     ARRAY['comfort-food', 'indulgent', 'vegetarian'],
     'dinner', 'american', 30, 'easy', 17.00, true,
     ARRAY['fall', 'winter']),

    (demo_chef_id, 'Herb-Crusted Rack of Lamb', 
     'Premium rack of lamb with rosemary and thyme crust, served with roasted vegetables',
     ARRAY['rack-of-lamb', 'rosemary', 'thyme', 'garlic', 'breadcrumbs', 'dijon-mustard', 'asparagus', 'carrots'],
     ARRAY['gluten'], 
     ARRAY['high-protein', 'elegant', 'special-occasion'],
     'dinner', 'american', 45, 'hard', 42.00, true,
     ARRAY['spring', 'fall', 'winter']),

    (demo_chef_id, 'BBQ Pulled Pork Sliders', 
     'Slow-cooked pork shoulder with house-made BBQ sauce, served on brioche buns',
     ARRAY['pork-shoulder', 'brown-sugar', 'paprika', 'cumin', 'tomato-sauce', 'apple-cider-vinegar', 'brioche-buns', 'coleslaw'],
     ARRAY['gluten', 'eggs'], 
     ARRAY['comfort-food', 'crowd-pleaser', 'smoky'],
     'lunch', 'american', 240, 'medium', 16.00, true,
     ARRAY['spring', 'summer', 'fall']),

    -- Mexican/Latin American (2 items)
    (demo_chef_id, 'Carne Asada Tacos', 
     'Grilled marinated steak tacos with fresh pico de gallo and avocado',
     ARRAY['flank-steak', 'lime-juice', 'cumin', 'chili-powder', 'corn-tortillas', 'tomatoes', 'onion', 'cilantro', 'avocado'],
     ARRAY[]::text[], 
     ARRAY['high-protein', 'fresh', 'traditional'],
     'dinner', 'mexican', 90, 'medium', 23.00, true,
     ARRAY['spring', 'summer', 'fall']),

    (demo_chef_id, 'Chile Relleno Casserole', 
     'Baked casserole with roasted poblano peppers, cheese, and fluffy egg custard',
     ARRAY['poblano-peppers', 'monterey-jack-cheese', 'eggs', 'milk', 'flour', 'tomato-sauce', 'cumin'],
     ARRAY['eggs', 'dairy', 'gluten'], 
     ARRAY['comfort-food', 'vegetarian', 'traditional'],
     'dinner', 'mexican', 60, 'medium', 19.00, true,
     ARRAY['fall', 'winter']),

    -- French (1 item)
    (demo_chef_id, 'Coq au Vin', 
     'Classic French braised chicken in red wine with pearl onions and mushrooms',
     ARRAY['chicken-thighs', 'red-wine', 'bacon', 'pearl-onions', 'mushrooms', 'carrots', 'thyme', 'bay-leaves'],
     ARRAY[]::text[], 
     ARRAY['elegant', 'comfort-food', 'wine-braised', 'traditional'],
     'dinner', 'french', 150, 'hard', 32.00, true,
     ARRAY['fall', 'winter']);

    -- =============================================
    -- STEP 4: Create Sample Feedback History
    -- =============================================

    -- Add some sample feedback to make the demo more realistic
    -- Sarah Martinez feedback
    INSERT INTO client_feedback_history (client_id, menu_item_id, feedback_type, rating, feedback_text, context) 
    SELECT client_ids[1], mi.id, 'rating', 5, 
           'Absolutely loved this dish! The tahini dressing was perfect and the vegetables were perfectly roasted. Will definitely order again!',
           '{"occasion": "family dinner", "portion_size": "perfect", "would_order_again": true}'::jsonb
    FROM menu_items mi WHERE mi.name = 'Mediterranean Quinoa Bowl' AND mi.chef_id = demo_chef_id;

    INSERT INTO client_feedback_history (client_id, menu_item_id, feedback_type, rating, feedback_text, context) 
    SELECT client_ids[1], mi.id, 'rating', 4, 
           'Great flavors, but could use a bit less salt. The salmon was cooked perfectly though.',
           '{"occasion": "date night", "portion_size": "good", "would_order_again": true}'::jsonb
    FROM menu_items mi WHERE mi.name = 'Pan-Seared Salmon with Herb Crust' AND mi.chef_id = demo_chef_id;

    -- Michael Chen feedback  
    INSERT INTO client_feedback_history (client_id, menu_item_id, feedback_type, rating, feedback_text, context) 
    SELECT client_ids[2], mi.id, 'rating', 5, 
           'Perfect level of spice! The beef was tender and the pickled vegetables added great crunch.',
           '{"occasion": "work lunch", "portion_size": "perfect", "would_order_again": true}'::jsonb
    FROM menu_items mi WHERE mi.name = 'Korean-Style Beef Bowl' AND mi.chef_id = demo_chef_id;

    INSERT INTO client_feedback_history (client_id, menu_item_id, feedback_type, rating, feedback_text, context) 
    SELECT client_ids[2], mi.id, 'rating', 4, 
           'Really enjoyed the coconut curry. Maybe add some extra vegetables next time?',
           '{"occasion": "dinner party", "portion_size": "good", "would_order_again": true}'::jsonb
    FROM menu_items mi WHERE mi.name = 'Thai Coconut Curry Chicken' AND mi.chef_id = demo_chef_id;

    -- Johnson Family feedback
    INSERT INTO client_feedback_history (client_id, menu_item_id, feedback_type, rating, feedback_text, context) 
    SELECT client_ids[3], mi.id, 'rating', 5, 
           'The kids absolutely loved this! Finally a meal everyone in the family enjoyed. The truffle flavor wasn''t too strong.',
           '{"occasion": "family dinner", "portion_size": "generous", "would_order_again": true, "kids_approved": true}'::jsonb
    FROM menu_items mi WHERE mi.name = 'Truffle Mac and Cheese' AND mi.chef_id = demo_chef_id;

    -- Alexandra Thompson feedback
    INSERT INTO client_feedback_history (client_id, menu_item_id, feedback_type, rating, feedback_text, context) 
    SELECT client_ids[4], mi.id, 'rating', 5, 
           'Exceptional! The miso glaze was perfectly balanced and the cod was flaky and delicious. Very keto-friendly.',
           '{"occasion": "solo dining", "portion_size": "perfect", "would_order_again": true, "keto_compliant": true}'::jsonb
    FROM menu_items mi WHERE mi.name = 'Miso-Glazed Cod with Bok Choy' AND mi.chef_id = demo_chef_id;

    -- Gonzalez couple feedback
    INSERT INTO client_feedback_history (client_id, menu_item_id, feedback_type, rating, feedback_text, context) 
    SELECT client_ids[5], mi.id, 'rating', 4, 
           'Reminded us of Maria''s grandmother''s cooking! The meat was tender and the flavors were authentic.',
           '{"occasion": "anniversary dinner", "portion_size": "generous", "would_order_again": true, "authentic_flavors": true}'::jsonb
    FROM menu_items mi WHERE mi.name = 'Carne Asada Tacos' AND mi.chef_id = demo_chef_id;

    RAISE NOTICE 'Demo data created successfully!';
    RAISE NOTICE 'Created 5 clients with preferences and 15 menu items for chef ID: %', demo_chef_id;
    RAISE NOTICE 'Added 6 sample feedback entries';
    RAISE NOTICE '';
    RAISE NOTICE 'Demo login credentials:';
    RAISE NOTICE 'Email: demo@sousagent.com';
    RAISE NOTICE 'Password: DemoChef2024!';
    
END $$;