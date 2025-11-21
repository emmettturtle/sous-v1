# Supabase Migrations

This directory contains all database migration scripts for the Sous Agent application.

## Directory Structure

- **`applied/`** - Migration scripts that have been successfully applied to the database
  - `create_recipe_table.sql` - Creates recipes table with RLS policies
  - `create_prep_schedules_table.sql` - Creates prep_schedules table for production schedule persistence
  - `fix_recipe_rls.sql` - Fixes RLS policy for recipe joins with menu_items
  - `demo_account_recipes.sql` - Demo data for testing the prep assistant feature

- **`templates/`** - Example scripts and templates for reference
  - `sample_recipes.sql` - Template showing how to insert recipe data

## Running Migrations

Migrations should be run in the Supabase SQL Editor in the following order:

1. `create_recipe_table.sql` - First time setup for recipes
2. `fix_recipe_rls.sql` - If experiencing RLS issues with recipe joins
3. `create_prep_schedules_table.sql` - For prep assistant schedule persistence
4. `demo_account_recipes.sql` - Optional, for demo/testing purposes only

## Notes

- All migrations include Row Level Security (RLS) policies to ensure data isolation per chef
- Do not run demo data scripts in production environments
- Keep applied migrations in the `applied/` folder for reference
