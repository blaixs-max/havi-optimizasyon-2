-- =====================================================
-- Script: Assign Adana customers to İzmir depot
-- Purpose: Move 23 Adana customers and their orders to İzmir depot
-- =====================================================

-- Step 1: First check İzmir depot ID
SELECT 'İzmir Depot Info:' as info, id, name, city, latitude, longitude 
FROM depots 
WHERE city = 'İzmir';

-- Step 2: Check current Adana customers status
SELECT 'Current Adana Customers:' as info, 
       COUNT(*) as total_count,
       COUNT(CASE WHEN depot_id IS NULL THEN 1 END) as null_depot_count,
       COUNT(CASE WHEN depot_id IS NOT NULL THEN 1 END) as assigned_count
FROM customers 
WHERE city = 'Adana';

-- Step 3: List all Adana customers
SELECT 'Adana Customer Details:' as info, id, name, city, depot_id 
FROM customers 
WHERE city = 'Adana'
ORDER BY id;

-- Step 4: Update all Adana customers to İzmir depot (depot_id = 3)
UPDATE customers 
SET depot_id = 3
WHERE city = 'Adana';

-- Step 5: Verify the update
SELECT 'After Update - Adana Customers:' as info, 
       COUNT(*) as total_count,
       COUNT(CASE WHEN depot_id = 3 THEN 1 END) as izmir_depot_count
FROM customers 
WHERE city = 'Adana';

-- Step 6: Update orders for Adana customers
UPDATE orders o
SET depot_id = 3
FROM customers c
WHERE o.customer_id = c.id 
  AND c.city = 'Adana';

-- Step 7: Verify orders update
SELECT 'Adana Orders Updated:' as info,
       COUNT(*) as total_orders,
       COUNT(CASE WHEN o.depot_id = 3 THEN 1 END) as izmir_depot_orders
FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE c.city = 'Adana';

-- Step 8: Summary of all depot assignments
SELECT 'Final Depot Assignment Summary:' as info,
       d.name as depot_name,
       d.city as depot_city,
       COUNT(c.id) as customer_count
FROM depots d
LEFT JOIN customers c ON c.depot_id = d.id
GROUP BY d.id, d.name, d.city
ORDER BY d.city;

-- Step 9: Show İzmir depot capacity
SELECT 'İzmir Depot Capacity:' as info,
       d.name,
       d.city,
       COUNT(c.id) as total_customers,
       COUNT(v.id) as total_vehicles
FROM depots d
LEFT JOIN customers c ON c.depot_id = d.id
LEFT JOIN vehicles v ON v.depot_id = d.id
WHERE d.city = 'İzmir'
GROUP BY d.id, d.name, d.city;
