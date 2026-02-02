-- ================================================
-- TESLİM EDİLDİ DURUMUNDAKI 5 SİPARİŞİ BEKLIYOR DURUMUNA DÖNDÜR
-- ================================================

-- Önce mevcut durumu göster
SELECT 
  'MEVCUT DURUM' as rapor,
  status,
  COUNT(*) as siparis_sayisi
FROM orders
GROUP BY status
ORDER BY status;

-- Delivered siparişleri listele
SELECT 
  'TESLİM EDİLMİŞ SİPARİŞLER' as rapor,
  o.id,
  c.name as musteri_adi,
  o.demand_pallet as palet,
  o.status
FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE o.status = 'delivered'
ORDER BY o.created_at DESC
LIMIT 5;

-- 5 delivered siparişi pending'e döndür
UPDATE orders
SET 
  status = 'pending',
  updated_at = CURRENT_TIMESTAMP
WHERE id IN (
  SELECT id 
  FROM orders 
  WHERE status = 'delivered'
  ORDER BY updated_at DESC
  LIMIT 5
);

-- Güncelleme sonucu
SELECT 
  'GÜNCELLEME SONRASI' as rapor,
  status,
  COUNT(*) as siparis_sayisi
FROM orders
GROUP BY status
ORDER BY status;

-- Pending siparişleri göster
SELECT 
  'BEKLEYEN SİPARİŞLER (ADANA DEPO)' as rapor,
  o.id,
  c.name as musteri_adi,
  c.city as sehir,
  o.demand_pallet as palet,
  o.status,
  d.name as depo_adi
FROM orders o
JOIN customers c ON o.customer_id = c.id
JOIN depots d ON c.assigned_depot_id = d.id
WHERE o.status = 'pending'
  AND d.city = 'Adana'
ORDER BY o.created_at;
