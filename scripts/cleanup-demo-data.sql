-- Cleanup Script for Sous Agent Demo Data
-- This script removes all demo data for the specified chef account
-- Use with caution - this will permanently delete all demo data!

-- =============================================
-- DEMO DATA CLEANUP SCRIPT
-- =============================================

DO $$
DECLARE
    demo_chef_id uuid := 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'; -- REPLACE WITH ACTUAL UUID
    client_count int;
    menu_count int;
    feedback_count int;
BEGIN
    -- Verify chef exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = demo_chef_id) THEN
        RAISE EXCEPTION 'Demo chef not found with ID: %', demo_chef_id;
    END IF;

    -- Get counts before deletion
    SELECT COUNT(*) INTO client_count FROM clients WHERE chef_id = demo_chef_id;
    SELECT COUNT(*) INTO menu_count FROM menu_items WHERE chef_id = demo_chef_id;
    SELECT COUNT(*) INTO feedback_count FROM client_feedback_history 
    WHERE client_id IN (SELECT id FROM clients WHERE chef_id = demo_chef_id);

    RAISE NOTICE 'Found data to delete:';
    RAISE NOTICE '- Clients: %', client_count;
    RAISE NOTICE '- Menu Items: %', menu_count;
    RAISE NOTICE '- Feedback Entries: %', feedback_count;
    RAISE NOTICE '';

    -- Delete feedback history (references clients)
    DELETE FROM client_feedback_history 
    WHERE client_id IN (SELECT id FROM clients WHERE chef_id = demo_chef_id);
    RAISE NOTICE 'Deleted % feedback entries', feedback_count;

    -- Delete client preferences (references clients)
    DELETE FROM client_preferences 
    WHERE client_id IN (SELECT id FROM clients WHERE chef_id = demo_chef_id);
    RAISE NOTICE 'Deleted client preferences';

    -- Delete clients
    DELETE FROM clients WHERE chef_id = demo_chef_id;
    RAISE NOTICE 'Deleted % clients', client_count;

    -- Delete menu items
    DELETE FROM menu_items WHERE chef_id = demo_chef_id;
    RAISE NOTICE 'Deleted % menu items', menu_count;

    -- Optional: Delete chef profile (if it exists)
    DELETE FROM chef_profiles WHERE id = demo_chef_id;
    RAISE NOTICE 'Deleted chef profile (if existed)';

    RAISE NOTICE '';
    RAISE NOTICE '✅ Demo data cleanup completed successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  NOTE: The auth user account still exists.';
    RAISE NOTICE '   To delete the auth user as well, run:';
    RAISE NOTICE '   DELETE FROM auth.users WHERE id = ''%'';', demo_chef_id;
    RAISE NOTICE '';
    RAISE NOTICE 'Demo chef ID: %', demo_chef_id;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error during cleanup: %', SQLERRM;
END $$;