-- Fix Adana customer depot assignments
-- Problem: All Adana customers have assigned_depot_id = NULL
-- This causes optimization to fail with ROUTING_FAIL_TIMEOUT

-- First, verify Adana depot exists
SELECT 'Checking Adana depot:' as status;
SELECT id, name, city, lat, lng FROM depots WHERE city = 'Adana';

-- Check current state of Adana customers
SELECT 'Adana customers before fix:' as status;
SELECT 
    id,
    name,
    city,
    assigned_depot_id,
    lat,
    lng
FROM customers 
WHERE city = 'Adana'
ORDER BY name;

-- Update all Adana customers to use Adana depot
UPDATE customers 
SET assigned_depot_id = (SELECT id FROM depots WHERE city = 'Adana' LIMIT 1)
WHERE city = 'Adana' 
AND assigned_depot_id IS NULL;

-- Verify the fix
SELECT 'Adana customers after fix:' as status;
SELECT 
    c.id,
    c.name as customer_name,
    c.city as customer_city,
    d.id as depot_id,
    d.name as depot_name,
    d.city as depot_city
FROM customers c
LEFT JOIN depots d ON c.assigned_depot_id = d.id
WHERE c.city = 'Adana'
ORDER BY c.name;

-- Final verification - check if any customers still have NULL depot
SELECT 'Customers without depot assignment:' as status;
SELECT 
    COUNT(*) as count_without_depot,
    STRING_AGG(name || ' (' || city || ')', ', ') as customer_list
FROM customers 
WHERE assigned_depot_id IS NULL;
