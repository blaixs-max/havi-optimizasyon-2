-- Adana müşterilerini Adana deposuna ata

-- İlk olarak Adana deposunun ID'sini bul ve müşterilere ata
UPDATE customers c
SET assigned_depot_id = (
  SELECT d.id 
  FROM depots d 
  WHERE d.city = 'Adana'
  LIMIT 1
)
WHERE c.city = 'Adana' AND c.assigned_depot_id IS NULL;

-- Genel kontrol: Tüm depot'suz müşterileri şehirlerine göre ata
UPDATE customers c
SET assigned_depot_id = (
  SELECT d.id 
  FROM depots d 
  WHERE d.city = c.city
  LIMIT 1
)
WHERE assigned_depot_id IS NULL;

-- Eğer hala depot'suz müşteri varsa, en yakın depoya ata (coğrafi mesafe)
UPDATE customers c
SET assigned_depot_id = (
  SELECT d.id 
  FROM depots d 
  ORDER BY 
    SQRT(POW(d.lat - c.lat, 2) + POW(d.lng - c.lng, 2))
  LIMIT 1
)
WHERE assigned_depot_id IS NULL;

-- Kontrol: Kaç müşteri hangi depoya atandı
SELECT 
  d.name as depot_name,
  d.city as depot_city,
  COUNT(c.id) as customer_count
FROM depots d
LEFT JOIN customers c ON c.assigned_depot_id = d.id
GROUP BY d.id, d.name, d.city
ORDER BY d.city, d.name;
