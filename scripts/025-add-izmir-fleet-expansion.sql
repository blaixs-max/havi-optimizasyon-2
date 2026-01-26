-- Add 10 new vehicles to İzmir Depot
-- 5x Kamyon Tip 2 (18 pallet capacity)
-- 5x Kamyonet (10 pallet capacity)

-- First, update vehicle_type constraint to include kamyon_2 and kamyonet
ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_vehicle_type_check;
ALTER TABLE vehicles ADD CONSTRAINT vehicles_vehicle_type_check 
  CHECK (vehicle_type IN ('kamyon', 'kamyon_1', 'kamyon_2', 'tir', 'kamyonet', 'romork'));

-- Add 5x Kamyon Tip 2 (18 pallet, 12000kg capacity)
-- Kamyon Tip 2: Medium trucks with 18 pallet capacity
-- Cost: 6.00 TL/km, Fuel: 22 L/100km, Speed: 60 km/h
INSERT INTO vehicles (depot_id, plate, vehicle_type, capacity_pallets, capacity_kg, cost_per_km, fuel_consumption_per_100km, fixed_daily_cost, avg_speed_kmh, status)
SELECT 
  d.id,
  '35 KMY ' || (500 + n),
  'kamyon_2',
  18,
  12000,
  6.00,
  22.0,
  500,
  60,
  'available'
FROM depots d, generate_series(1, 5) n
WHERE d.city = 'İzmir'
ON CONFLICT (plate) DO NOTHING;

-- Add 5x Kamyonet (10 pallet, 3500kg capacity)
-- Kamyonet: Small vans with 10 pallet capacity
-- Cost: 2.60 TL/km, Fuel: 12 L/100km, Speed: 65 km/h
INSERT INTO vehicles (depot_id, plate, vehicle_type, capacity_pallets, capacity_kg, cost_per_km, fuel_consumption_per_100km, fixed_daily_cost, avg_speed_kmh, status)
SELECT 
  d.id,
  '35 VAN ' || (600 + n),
  'kamyonet',
  10,
  3500,
  2.60,
  12.0,
  350,
  65,
  'available'
FROM depots d, generate_series(1, 5) n
WHERE d.city = 'İzmir'
ON CONFLICT (plate) DO NOTHING;

-- Verify the additions
SELECT 
  v.vehicle_type,
  COUNT(*) as count,
  SUM(v.capacity_pallets) as total_capacity
FROM vehicles v
JOIN depots d ON v.depot_id = d.id
WHERE d.city = 'İzmir'
GROUP BY v.vehicle_type
ORDER BY v.vehicle_type;
