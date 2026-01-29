-- Reset all orders to pending status for re-optimization
-- This script resets all orders back to their initial state

BEGIN;

-- Update all orders to pending status
UPDATE orders 
SET status = 'pending',
    updated_at = CURRENT_TIMESTAMP
WHERE status != 'pending';

-- Clear route assignments from route_stops
UPDATE route_stops 
SET order_id = NULL
WHERE order_id IS NOT NULL;

-- Optional: Show summary of changes
SELECT 
  'Orders reset to pending' as action,
  COUNT(*) as total_orders,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders
FROM orders;

COMMIT;

-- Verify the reset
SELECT status, COUNT(*) as count
FROM orders
GROUP BY status
ORDER BY status;
