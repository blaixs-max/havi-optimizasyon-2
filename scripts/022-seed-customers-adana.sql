-- Seed: Adana Müşterileri (İzmir Deposuna Atanmış)
-- 23 adet Adana bölgesi müşterisi

INSERT INTO customers (name, address, city, district, lat, lng, demand_pallets, demand_kg, priority, assigned_depot_id, status) 
SELECT 
  name, 
  address, 
  'Adana' as city, 
  district, 
  lat, 
  lng, 
  demand_pallets, 
  demand_kg, 
  priority, 
  d.id as assigned_depot_id, 
  'pending' as status
FROM (VALUES
  -- McDonald's Lokasyonları
  ('McD Adana Galleria', 'Galleria AVM', 'Seyhan', 36.991651, 35.330687, 4, 3200, 2),
  ('McD Adana Tepe', 'Tepe Mahallesi', 'Yüreğir', 37.016486, 35.243164, 4, 3200, 2),
  ('McD Adana Optimum', 'Optimum AVM', 'Seyhan', 36.990284, 35.339926, 4, 3200, 2),
  ('McD Adana Alparslan Türkeş', 'Alparslan Türkeş Bulvarı', 'Sarıçam', 37.042481, 35.284782, 4, 3200, 2),
  ('McD Adana Barajyolu', 'Barajyolu Caddesi', 'Yüreğir', 37.030528, 35.313914, 4, 3200, 2),
  ('McD Adana Türkmenbaşı', 'Türkmenbaşı Bulvarı', 'Sarıçam', 37.053778, 35.299746, 4, 3200, 2),
  ('McD Adana Bulvar Relo', 'Bulvar Relo', 'Sarıçam', 37.045480, 35.306791, 4, 3200, 2),
  
  -- IKEA Caffe Lokasyonları
  ('Ikea Adana Caffe Yerli', 'IKEA Mağazası', 'Yüreğir', 37.016486, 35.243164, 4, 3200, 2),
  ('Ikea Adana Caffe İthal', 'IKEA Mağazası', 'Yüreğir', 37.016486, 35.243164, 4, 3200, 2),
  
  -- OPET Petrol İstasyonları
  ('OPET ADANA SEYHAN - AYTIM PTRL', 'Seyhan Bölgesi', 'Seyhan', 36.992258, 35.316126, 4, 3200, 2),
  ('OPET ADANA - MERYEM YESIL', 'Merkez Bölge', 'Sarıçam', 37.046376, 35.282304, 4, 3200, 2),
  ('OPET ADANA SEYHAN - ERDOGANLAR', 'Seyhan Bölgesi', 'Seyhan', 36.996077, 35.261718, 4, 3200, 2),
  ('OPET ADANA SEYHAN - POLAT PTRL', 'Seyhan Bölgesi', 'Seyhan', 36.997154, 35.249282, 4, 3200, 2),
  ('Opet Adana Seyhan-Alsevin Petrol', 'Seyhan Bölgesi', 'Seyhan', 37.020958, 35.274092, 4, 3200, 2),
  ('OPET ADANA CEYHAN – OZT', 'Ceyhan İlçesi', 'Ceyhan', 37.051629, 35.809875, 4, 3200, 3),
  ('OPET ADANA SEYHAN – KARMA', 'Seyhan Bölgesi', 'Seyhan', 37.029853, 35.294098, 4, 3200, 2),
  ('OPET ADANA-ALISEROGLU PETROL', 'Merkez Bölge', 'Sarıçam', 37.048015, 35.262477, 4, 3200, 2),
  ('Opet Adana Yüreğir-İpekpt-Ozt', 'Yüreğir Bölgesi', 'Yüreğir', 36.979319, 35.434469, 4, 3200, 3),
  ('OPET ADANA-NF PETROL', 'Merkez Bölge', 'Yüreğir', 36.984537, 35.372871, 4, 3200, 2),
  ('OPETF ADANA KOZAN-YA-PET', 'Kozan İlçesi', 'Kozan', 37.370494, 35.825847, 4, 3200, 4),
  ('Opet Adana-Yalman Petrol', 'Merkez Bölge', 'Seyhan', 37.013812, 35.303297, 4, 3200, 2),
  
  -- Chocolabs Lokasyonları
  ('Chocolabs Seyhan Adana', 'Seyhan Merkez', 'Seyhan', 36.999230, 35.320715, 3, 2400, 2),
  ('Chocolabs Adana Çukurova', 'Çukurova Bölgesi', 'Sarıçam', 37.045574, 35.308803, 3, 2400, 2)
) AS v(name, address, district, lat, lng, demand_pallets, demand_kg, priority)
CROSS JOIN depots d
WHERE d.city = 'İzmir'
ON CONFLICT DO NOTHING;
