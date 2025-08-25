-- Verification Script for Sous Agent Demo Data
-- This script verifies that the demo data was created correctly
-- Run this after executing the create-demo-data.sql script

-- =============================================
-- DEMO DATA VERIFICATION SCRIPT
-- =============================================

DO $$
DECLARE
    demo_chef_id uuid := 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'; -- REPLACE WITH ACTUAL UUID
    client_count int;
    menu_count int;
    feedback_count int;
    preference_count int;
    chef_email text;
BEGIN
    -- Verify chef exists and get email
    SELECT email INTO chef_email FROM auth.users WHERE id = demo_chef_id;
    
    IF chef_email IS NULL THEN
        RAISE EXCEPTION 'Demo chef not found with ID: %', demo_chef_id;
    END IF;

    RAISE NOTICE '🔍 VERIFYING DEMO DATA FOR SOUS AGENT';
    RAISE NOTICE '=====================================';
    RAISE NOTICE '';
    RAISE NOTICE '👨‍🍳 Chef Information:';
    RAISE NOTICE '   Chef ID: %', demo_chef_id;
    RAISE NOTICE '   Email: %', chef_email;
    RAISE NOTICE '';

    -- Count clients
    SELECT COUNT(*) INTO client_count FROM clients WHERE chef_id = demo_chef_id;
    RAISE NOTICE '👥 Clients: % found', client_count;
    
    IF client_count = 5 THEN
        RAISE NOTICE '   ✅ Expected 5 clients - PASS';
    ELSE
        RAISE NOTICE '   ❌ Expected 5 clients, found % - FAIL', client_count;
    END IF;

    -- List clients
    FOR rec IN 
        SELECT name, household_size, email FROM clients 
        WHERE chef_id = demo_chef_id 
        ORDER BY name
    LOOP
        RAISE NOTICE '   - %: % people (email: %)', rec.name, rec.household_size, COALESCE(rec.email, 'none');
    END LOOP;
    RAISE NOTICE '';

    -- Count client preferences
    SELECT COUNT(*) INTO preference_count 
    FROM client_preferences cp
    JOIN clients c ON cp.client_id = c.id
    WHERE c.chef_id = demo_chef_id;
    
    RAISE NOTICE '⚙️ Client Preferences: % found', preference_count;
    IF preference_count = 5 THEN
        RAISE NOTICE '   ✅ Expected 5 preference records - PASS';
    ELSE
        RAISE NOTICE '   ❌ Expected 5 preference records, found % - FAIL', preference_count;
    END IF;

    -- Show sample preferences
    FOR rec IN
        SELECT c.name, 
               cp.dietary_restrictions,
               cp.cuisine_preferences,
               cp.spice_tolerance,
               cp.budget_per_meal
        FROM client_preferences cp
        JOIN clients c ON cp.client_id = c.id
        WHERE c.chef_id = demo_chef_id
        ORDER BY c.name
        LIMIT 3
    LOOP
        RAISE NOTICE '   - %: Diet=%, Cuisine=%, Spice=%, Budget=$%', 
            rec.name, 
            COALESCE(array_to_string(rec.dietary_restrictions, ', '), 'none'),
            COALESCE(array_to_string(rec.cuisine_preferences, ', '), 'none'),
            COALESCE(rec.spice_tolerance, 'none'),
            COALESCE(rec.budget_per_meal::text, 'none');
    END LOOP;
    RAISE NOTICE '';

    -- Count menu items
    SELECT COUNT(*) INTO menu_count FROM menu_items WHERE chef_id = demo_chef_id;
    RAISE NOTICE '🍽️ Menu Items: % found', menu_count;
    
    IF menu_count = 15 THEN
        RAISE NOTICE '   ✅ Expected 15 menu items - PASS';
    ELSE
        RAISE NOTICE '   ❌ Expected 15 menu items, found % - FAIL', menu_count;
    END IF;

    -- Show menu items by cuisine
    FOR rec IN
        SELECT cuisine_type, COUNT(*) as count
        FROM menu_items 
        WHERE chef_id = demo_chef_id 
        GROUP BY cuisine_type
        ORDER BY count DESC
    LOOP
        RAISE NOTICE '   - % cuisine: % items', COALESCE(rec.cuisine_type, 'unspecified'), rec.count;
    END LOOP;

    -- List some menu items
    RAISE NOTICE '   Sample menu items:';
    FOR rec IN
        SELECT name, cuisine_type, price, difficulty_level
        FROM menu_items 
        WHERE chef_id = demo_chef_id 
        ORDER BY cuisine_type, name
        LIMIT 8
    LOOP
        RAISE NOTICE '     * % (% - $% - %)', rec.name, 
            COALESCE(rec.cuisine_type, 'unspecified'), 
            COALESCE(rec.price::text, '?'),
            COALESCE(rec.difficulty_level, 'unspecified');
    END LOOP;
    RAISE NOTICE '';

    -- Count feedback history
    SELECT COUNT(*) INTO feedback_count 
    FROM client_feedback_history cfh
    JOIN clients c ON cfh.client_id = c.id
    WHERE c.chef_id = demo_chef_id;
    
    RAISE NOTICE '💬 Feedback History: % entries found', feedback_count;
    IF feedback_count >= 6 THEN
        RAISE NOTICE '   ✅ Expected at least 6 feedback entries - PASS';
    ELSE
        RAISE NOTICE '   ⚠️ Expected at least 6 feedback entries, found % - CHECK', feedback_count;
    END IF;

    -- Show sample feedback
    FOR rec IN
        SELECT c.name as client_name,
               mi.name as menu_item,
               cfh.rating,
               LEFT(cfh.feedback_text, 50) || '...' as feedback_preview
        FROM client_feedback_history cfh
        JOIN clients c ON cfh.client_id = c.id
        JOIN menu_items mi ON cfh.menu_item_id = mi.id
        WHERE c.chef_id = demo_chef_id
        ORDER BY cfh.created_at DESC
        LIMIT 3
    LOOP
        RAISE NOTICE '   - %: % stars on "%" - "%"', 
            rec.client_name, 
            rec.rating, 
            rec.menu_item,
            rec.feedback_preview;
    END LOOP;
    RAISE NOTICE '';

    -- Verification Summary
    RAISE NOTICE '📊 VERIFICATION SUMMARY:';
    RAISE NOTICE '========================';
    IF client_count = 5 AND menu_count = 15 AND preference_count = 5 AND feedback_count >= 6 THEN
        RAISE NOTICE '✅ ALL CHECKS PASSED - Demo data is ready!';
        RAISE NOTICE '';
        RAISE NOTICE '🎯 Ready for testing with:';
        RAISE NOTICE '   Email: demo@sousagent.com';
        RAISE NOTICE '   Password: DemoChef2024!';
        RAISE NOTICE '';
        RAISE NOTICE '🤖 Try these AI Assistant queries:';
        RAISE NOTICE '   "What vegetarian options would work for Sarah?"';
        RAISE NOTICE '   "What spicy Asian dishes do you recommend for Michael?"';
        RAISE NOTICE '   "What family-friendly meals work for the Johnson family?"';
    ELSE
        RAISE NOTICE '❌ SOME CHECKS FAILED - Review the output above';
        RAISE NOTICE '   Expected: 5 clients, 15 menu items, 5 preferences, 6+ feedback';
        RAISE NOTICE '   Found: % clients, % menu items, % preferences, % feedback', 
            client_count, menu_count, preference_count, feedback_count;
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error during verification: %', SQLERRM;
END $$;