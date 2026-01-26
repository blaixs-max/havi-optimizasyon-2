-- FIX: Adana müşterilerinin depot ataması
-- Problem: Tüm Adana müşterilerinin assigned_depot_id NULL olduğu için optimizasyon başarısız oluyor

-- 1. Adana müşterilerini Adana deposuna ata
UPDATE customers c
SET assigned_depot_id = (
  SELECT d.id 
  FROM depots d 
  WHERE d.city = 'Adana'
  LIMIT 1
)
WHERE c.city = 'Adana' AND (c.assigned_depot_id IS NULL OR c.assigned_depot_id = '');

-- 2. İstanbul müşterilerini İstanbul deposuna ata  
UPDATE customers c
SET assigned_depot_id = (
  SELECT d.id 
  FROM depots d 
  WHERE d.city = 'İstanbul'
  LIMIT 1
)
WHERE c.city = 'İstanbul' AND (c.assigned_depot_id IS NULL OR c.assigned_depot_id = '');

-- 3. Ankara müşterilerini Ankara deposuna ata
UPDATE customers c
SET assigned_depot_id = (
  SELECT d.id 
  FROM depots d 
  WHERE d.city = 'Ankara'
  LIMIT 1
)
WHERE c.city = 'Ankara' AND (c.assigned_depot_id IS NULL OR c.assigned_depot_id = '');

-- 4. İzmir müşterilerini İzmir deposuna ata
UPDATE customers c
SET assigned_depot_id = (
  SELECT d.id 
  FROM depots d 
  WHERE d.city = 'İzmir'
  LIMIT 1
)
WHERE c.city = 'İzmir' AND (c.assigned_depot_id IS NULL OR c.assigned_depot_id = '');

-- 5. Genel: Tüm depot'suz müşterileri şehirlerine göre ata
UPDATE customers c
SET assigned_depot_id = (
  SELECT d.id 
  FROM depots d 
  WHERE d.city = c.city
  LIMIT 1
)
WHERE assigned_depot_id IS NULL;

-- 6. Eğer hala depot'suz müşteri varsa, en yakın depoya ata (coğrafi mesafe)
UPDATE customers c
SET assigned_depot_id = (
  SELECT d.id 
  FROM depots d 
  ORDER BY 
    SQRT(POW(d.lat - c.lat, 2) + POW(d.lng - c.lng, 2))
  LIMIT 1
)
WHERE assigned_depot_id IS NULL OR assigned_depot_id = '';

-- Kontrol: Depot ataması sonuçları
SELECT 
  d.name as depot_name,
  d.city as depot_city,
  COUNT(c.id) as customer_count,
  ARRAY_AGG(c.name ORDER BY c.name) as customers
FROM depots d
LEFT JOIN customers c ON c.assigned_depot_id = d.id
GROUP BY d.id, d.name, d.city
ORDER BY d.city, d.name;

-- Kontrol 2: Hala depot'suz müşteri var mı?
SELECT 
  id, 
  name, 
  city, 
  assigned_depot_id
FROM customers
WHERE assigned_depot_id IS NULL OR assigned_depot_id = ''
ORDER BY city, name;
