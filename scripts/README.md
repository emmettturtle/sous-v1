# Demo Data Scripts

This directory contains scripts to create comprehensive demo data for Sous Agent.

## 🎭 Demo Account Overview

The demo data creates a fully functional chef account with:
- **5 Diverse Clients** with realistic preferences and dietary requirements
- **15 Sample Recipes** across multiple cuisines (Mediterranean, Asian, American, Mexican, French)
- **Sample Feedback History** to demonstrate AI learning capabilities

## 🚀 Quick Setup

### Step 1: Create Demo Authentication User

First, create the demo user through Supabase Auth dashboard or use the auth API:

1. **Via Supabase Dashboard:**
   - Go to Authentication → Users
   - Click "Add user"
   - Email: `demo@sousagent.com`
   - Password: `DemoChef2024!`
   - Confirm email: ✅ (check the box)

2. **Via SQL (Alternative):**
   ```sql
   -- This creates the auth user directly (use with caution)
   INSERT INTO auth.users (
     id, email, encrypted_password, email_confirmed_at, created_at, updated_at, 
     email_confirm_token, recovery_token, raw_app_meta_data, raw_user_meta_data
   ) VALUES (
     gen_random_uuid(),
     'demo@sousagent.com',
     crypt('DemoChef2024!', gen_salt('bf')),
     now(),
     now(), 
     now(),
     '',
     '',
     '{"provider":"email","providers":["email"]}',
     '{}'
   );
   ```

### Step 2: Get the User UUID

After creating the auth user, get their UUID:

```sql
SELECT id, email FROM auth.users WHERE email = 'demo@sousagent.com';
```

Copy the UUID (something like: `123e4567-e89b-12d3-a456-426614174000`)

### Step 3: Update the Demo Script

Edit `create-demo-data.sql` and replace the placeholder UUID on line 13:

```sql
-- Replace this line:
demo_chef_id uuid := 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'; -- REPLACE WITH ACTUAL UUID

-- With your actual UUID:
demo_chef_id uuid := '123e4567-e89b-12d3-a456-426614174000'; -- Your actual UUID
```

### Step 4: Run the Demo Script

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the entire contents of `create-demo-data.sql`
4. Click "RUN" to execute the script

## 👥 Demo Clients Created

### 1. **Sarah Martinez** - Health-conscious Vegetarian
- **Household:** 2 people
- **Dietary:** Vegetarian, Gluten-free
- **Allergies:** Nuts, Dairy
- **Preferences:** Mediterranean, Asian, Mexican
- **Budget:** $25/meal
- **Special:** Loves quinoa and chickpeas, dislikes mushrooms

### 2. **Michael Chen** - Busy Professional
- **Household:** 1 person
- **Dietary:** No restrictions
- **Allergies:** Shellfish
- **Preferences:** Asian, Fusion, American
- **Budget:** $35/meal
- **Special:** High spice tolerance, prefers individual portions

### 3. **Emily & David Johnson** - Family with Kids
- **Household:** 4 people (parents + kids)
- **Dietary:** No restrictions
- **Allergies:** Peanuts
- **Preferences:** American, Italian, Comfort food
- **Budget:** $20/meal
- **Special:** Mild spice tolerance, batch cooking preferred

### 4. **Alexandra Thompson** - Keto Enthusiast
- **Household:** 1 person
- **Dietary:** Keto, Low-carb
- **Allergies:** None
- **Preferences:** French, Italian, Mediterranean
- **Budget:** $50/meal
- **Special:** Sophisticated palate, avoids bread/potatoes/rice

### 5. **Roberto & Maria Gonzalez** - Latino Couple
- **Household:** 2 people
- **Dietary:** Heart-healthy
- **Allergies:** None
- **Preferences:** Mexican, Latin American, Mediterranean
- **Budget:** $30/meal
- **Special:** Traditional flavors, prefers lean proteins

## 🍽️ Sample Menu Items (15 Recipes)

### Mediterranean Cuisine (5 items)
1. **Mediterranean Quinoa Bowl** - $18 - Healthy, vegetarian, gluten-free
2. **Greek-Style Lemon Chicken** - $22 - Classic, protein-rich
3. **Stuffed Bell Peppers** - $20 - Comfort food with Mediterranean twist
4. **Pan-Seared Salmon with Herb Crust** - $28 - High-protein, omega-3 rich
5. **Moroccan-Spiced Chickpea Stew** - $16 - Vegan, warming spices

### Asian Cuisine (4 items)
6. **Korean-Style Beef Bowl** - $24 - Umami-rich, high-protein
7. **Thai Coconut Curry Chicken** - $21 - Creamy, spicy comfort food
8. **Miso-Glazed Cod with Bok Choy** - $26 - Delicate fish, low-carb
9. **Vietnamese Pho-Inspired Chicken Soup** - $19 - Aromatic, warming

### American/Comfort Food (3 items)
10. **Truffle Mac and Cheese** - $17 - Elevated comfort food
11. **Herb-Crusted Rack of Lamb** - $42 - Premium, special occasion
12. **BBQ Pulled Pork Sliders** - $16 - Crowd-pleaser, smoky

### Mexican/Latin American (2 items)
13. **Carne Asada Tacos** - $23 - Fresh, traditional, high-protein
14. **Chile Relleno Casserole** - $19 - Comfort food, vegetarian

### French Cuisine (1 item)
15. **Coq au Vin** - $32 - Elegant, wine-braised, traditional

## 💬 Sample Feedback Data

The script also creates realistic feedback entries:
- **Sarah Martinez**: Loved the quinoa bowl (5 stars), suggested less salt on salmon (4 stars)
- **Michael Chen**: Perfect spice level on beef bowl (5 stars), wants more veggies in curry (4 stars)
- **Johnson Family**: Kids loved the mac and cheese (5 stars)
- **Alexandra Thompson**: Exceptional miso cod, very keto-friendly (5 stars)
- **Gonzalez Couple**: Authentic carne asada reminded them of family recipes (4 stars)

## 🤖 Testing the AI Assistant

Once the demo data is loaded, you can test the AI assistant with these sample queries:

### For Sarah Martinez:
- "What vegetarian options would work well for Sarah this week?"
- "Sarah mentioned she loved the quinoa bowl. What similar dishes do you recommend?"
- "I need gluten-free options for Sarah's dinner party next weekend."

### For Michael Chen:
- "Michael wants something spicy and Asian-inspired for his work lunches."
- "What's a good high-protein meal for Michael that he can eat quickly?"

### For the Johnson Family:
- "The Johnson kids are picky eaters. What family-friendly options do we have?"
- "I need a crowd-pleasing dish for the Johnson family reunion."

### For Alexandra Thompson:
- "Alexandra is strictly keto. What are our best low-carb options?"
- "I want to impress Alexandra with something elegant and sophisticated."

### For the Gonzalez Couple:
- "Roberto and Maria want something heart-healthy but still traditional."
- "What Mexican dishes would work for the Gonzalez anniversary dinner?"

## 🔧 Customization

You can easily customize the demo data by:

1. **Adding More Clients**: Copy the client insertion pattern and modify details
2. **Adding More Recipes**: Follow the menu_items insertion format
3. **Adding More Feedback**: Create additional feedback entries for better AI training
4. **Modifying Preferences**: Update dietary restrictions, cuisine preferences, or budgets

## 🗑️ Cleanup Script

If you need to remove the demo data, use this cleanup script:

```sql
-- WARNING: This will delete ALL data for the demo chef
DO $$
DECLARE
    demo_chef_id uuid := 'YOUR_DEMO_CHEF_UUID_HERE'; -- Replace with actual UUID
BEGIN
    -- Delete feedback history (will cascade from clients)
    DELETE FROM client_feedback_history 
    WHERE client_id IN (SELECT id FROM clients WHERE chef_id = demo_chef_id);
    
    -- Delete client preferences (will cascade from clients)  
    DELETE FROM client_preferences 
    WHERE client_id IN (SELECT id FROM clients WHERE chef_id = demo_chef_id);
    
    -- Delete clients
    DELETE FROM clients WHERE chef_id = demo_chef_id;
    
    -- Delete menu items
    DELETE FROM menu_items WHERE chef_id = demo_chef_id;
    
    -- Optionally delete the auth user (be careful!)
    -- DELETE FROM auth.users WHERE id = demo_chef_id;
    
    RAISE NOTICE 'Demo data cleaned up successfully!';
END $$;
```

## 🎯 Demo Login Credentials

After setup, you can login with:
- **Email:** `demo@sousagent.com`
- **Password:** `DemoChef2024!`

The demo account will have all clients, recipes, and feedback data ready for testing and demonstrations.

## 🛡️ Security Notes

- The demo password is intentionally strong but publicly documented
- In production, ensure demo accounts have limited access
- Consider adding a cleanup job to reset demo data periodically
- Monitor usage to prevent abuse of the demo account