-- ========================================
-- ADANA DEPO KURULUM SCRİPTİ
-- ========================================
-- Bu script şunları yapar:
-- 1. Adana Depo oluşturur
-- 2. İzmir Depo ile aynı araç filosunu oluşturur (9 araç)
-- 3. Tüm müşterileri Adana Depo'ya atar
-- 4. Sonuç: 23 sipariş + 9 araç ile optimizasyon hazır
-- ========================================

-- ADIM 1: ADANA DEPO OLUŞTUR
-- Koordinat: 36.9932508, 35.3256885
-- Adres: Adana Büyükşehir Belediyesi, Reşatbey, Atatürk cad. No:1, 01120 Seyhan/Adana

INSERT INTO depots (name, city, address, lat, lng, capacity_pallets, status)
VALUES (
  'Adana Merkez Depo',
  'Adana',
  'Adana Büyükşehir Belediyesi, Reşatbey, Atatürk cad. No:1, 01120 Seyhan/Adana',
  36.9932508,
  35.3256885,
  1200,
  'active'
)
ON CONFLICT DO NOTHING;

-- Depo ID'sini al (sonraki adımlarda kullanmak için)
DO $$
DECLARE
  v_depot_id TEXT;
BEGIN
  -- Adana Depo ID'sini bul
  SELECT id INTO v_depot_id FROM depots WHERE city = 'Adana' AND name = 'Adana Merkez Depo';
  
  IF v_depot_id IS NULL THEN
    RAISE EXCEPTION 'Adana Depo oluşturulamadı!';
  END IF;

  RAISE NOTICE 'Adana Depo ID: %', v_depot_id;

  -- ADIM 2: TIR ARAÇLARI OLUŞTUR (4 adet)
  -- Kapasite: 32 palet, 25,000 kg
  INSERT INTO vehicles (depot_id, plate, vehicle_type, capacity_pallets, capacity_kg, fuel_consumption_per_100km, cost_per_km, status)
  VALUES
    (v_depot_id, '01 MNO 101', 'tir', 32, 25000, 35.0, 8.50, 'available'),
    (v_depot_id, '01 MNO 102', 'tir', 32, 25000, 35.0, 8.50, 'available'),
    (v_depot_id, '01 MNO 103', 'tir', 32, 25000, 35.0, 8.50, 'available'),
    (v_depot_id, '01 MNO 104', 'tir', 32, 25000, 35.0, 8.50, 'available')
  ON CONFLICT (plate) DO NOTHING;

  RAISE NOTICE '4 TIR aracı oluşturuldu (128 palet kapasitesi)';

  -- ADIM 3: KAMYON-2 ARACI OLUŞTUR (1 adet)
  -- Kapasite: 18 palet, 10,000 kg
  INSERT INTO vehicles (depot_id, plate, vehicle_type, capacity_pallets, capacity_kg, fuel_consumption_per_100km, cost_per_km, status)
  VALUES
    (v_depot_id, '01 PQR 201', 'kamyon_2', 18, 10000, 25.0, 6.00, 'available')
  ON CONFLICT (plate) DO NOTHING;

  RAISE NOTICE '1 Kamyon-2 aracı oluşturuldu (18 palet kapasitesi)';

  -- ADIM 4: KAMYON ARAÇLARI OLUŞTUR (4 adet)
  -- Kapasite: 12 palet, 8,000 kg
  INSERT INTO vehicles (depot_id, plate, vehicle_type, capacity_pallets, capacity_kg, fuel_consumption_per_100km, cost_per_km, status)
  VALUES
    (v_depot_id, '01 VRP 001', 'kamyon', 12, 8000, 18.0, 2.20, 'available'),
    (v_depot_id, '01 VRP 002', 'kamyon', 12, 8000, 18.0, 2.20, 'available'),
    (v_depot_id, '01 VRP 003', 'kamyon', 12, 8000, 18.0, 2.20, 'available'),
    (v_depot_id, '01 VRP 004', 'kamyon', 12, 8000, 18.0, 2.20, 'available')
  ON CONFLICT (plate) DO NOTHING;

  RAISE NOTICE '4 Kamyon aracı oluşturuldu (48 palet kapasitesi)';
  RAISE NOTICE 'TOPLAM: 9 araç, 194 palet kapasitesi';

  -- ADIM 5: TÜM MÜŞTERİLERİ ADANA DEPO'YA ATA
  UPDATE customers
  SET assigned_depot_id = v_depot_id
  WHERE assigned_depot_id IS NOT NULL;

  RAISE NOTICE 'Tüm müşteriler Adana Depo''ya atandı';

END $$;

-- ========================================
-- DOĞRULAMA SORULARI
-- ========================================

-- 1. Adana Depo oluşturuldu mu?
SELECT 
  'DEPO KONTROLÜ' as kontrol,
  id, name, city, lat, lng, capacity_pallets, status
FROM depots 
WHERE city = 'Adana';

-- 2. Adana Depo'nun araçları oluşturuldu mu?
SELECT 
  'ARAÇ KONTROLÜ' as kontrol,
  COUNT(*) as toplam_arac,
  SUM(capacity_pallets) as toplam_kapasite,
  vehicle_type,
  COUNT(*) as adet
FROM vehicles
WHERE depot_id = (SELECT id FROM depots WHERE city = 'Adana')
GROUP BY vehicle_type;

-- 3. Müşteriler Adana Depo'ya atandı mı?
SELECT 
  'MÜŞTERİ KONTROLÜ' as kontrol,
  COUNT(*) as toplam_musteri,
  d.name as depo_adi
FROM customers c
JOIN depots d ON c.assigned_depot_id = d.id
WHERE d.city = 'Adana'
GROUP BY d.name;

-- 4. Adana Depo için bekleyen siparişler var mı?
SELECT 
  'SİPARİŞ KONTROLÜ' as kontrol,
  COUNT(*) as bekleyen_siparis,
  SUM(pallet_count) as toplam_palet
FROM orders o
JOIN customers c ON o.customer_id = c.id
JOIN depots d ON c.assigned_depot_id = d.id
WHERE d.city = 'Adana' 
  AND o.status = 'pending';

-- ========================================
-- SONUÇ RAPORU
-- ========================================
SELECT 
  '✅ ADANA DEPO KURULUM TAMAMLANDI!' as durum,
  (SELECT COUNT(*) FROM depots WHERE city = 'Adana') as depo_sayisi,
  (SELECT COUNT(*) FROM vehicles WHERE depot_id = (SELECT id FROM depots WHERE city = 'Adana')) as arac_sayisi,
  (SELECT COUNT(*) FROM customers WHERE assigned_depot_id = (SELECT id FROM depots WHERE city = 'Adana')) as musteri_sayisi,
  (SELECT COUNT(*) FROM orders o JOIN customers c ON o.customer_id = c.id WHERE c.assigned_depot_id = (SELECT id FROM depots WHERE city = 'Adana') AND o.status = 'pending') as bekleyen_siparis;
