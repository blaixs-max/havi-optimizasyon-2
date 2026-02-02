-- Drop old key-value settings table and create new column-based structure
DROP TABLE IF EXISTS settings CASCADE;

-- Create new settings table with column-based structure
CREATE TABLE settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  fuel_price_per_liter DECIMAL(10,2) DEFAULT 35.0,
  driver_cost_per_hour DECIMAL(10,2) DEFAULT 150.0,
  vehicle_fixed_cost DECIMAL(10,2) DEFAULT 500.0,
  max_route_duration_hours DECIMAL(10,2) DEFAULT 20.0,
  max_distance_per_route_km DECIMAL(10,2) DEFAULT 300.0,
  service_duration_minutes INTEGER DEFAULT 45,
  routing_engine VARCHAR(50) DEFAULT 'ors',
  ors_api_url TEXT DEFAULT 'https://api.openrouteservice.org',
  osrm_api_url TEXT DEFAULT '',
  vroom_api_url TEXT DEFAULT '',
  n8n_webhook_url TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT settings_id_check CHECK (id = 1)
);

-- Insert default settings
INSERT INTO settings (
  id,
  fuel_price_per_liter,
  driver_cost_per_hour,
  vehicle_fixed_cost,
  max_route_duration_hours,
  max_distance_per_route_km,
  service_duration_minutes,
  routing_engine,
  ors_api_url,
  osrm_api_url,
  vroom_api_url,
  n8n_webhook_url
) VALUES (
  1,
  35.0,
  150.0,
  500.0,
  20.0,
  300.0,
  45,
  'ors',
  'https://api.openrouteservice.org',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Verify settings table
SELECT 'Settings table recreated' as status;
SELECT * FROM settings WHERE id = 1;
