# ADANA DEPO KURULUM PLANI

## Hedef
Adana Depo'yu İzmir Depo gibi tam çalışır duruma getirmek ve optimizasyon başlatabilmek.

---

## ADIM 1: ADANA DEPO OLUŞTUR
**Durum:** ❌ Yapılmadı

### Gereksinimler:
- **Konum:** X8VG+67 Seyhan, Adana (Adana Büyükşehir Belediyesi)
- **Koordinatlar:** 
  - Plus Code: X8VG+67
  - Tam koordinatları Google Maps'ten alınacak
  - Yaklaşık: 37.0032°N, 35.3257°E (doğrulanmalı)

### SQL İşlemi:
```sql
INSERT INTO depots (id, name, city, address, lat, lng, max_vehicles, is_active)
VALUES (
  'depot-3',
  'Adana Depo',
  'Adana',
  'Adana Büyükşehir Belediyesi, Seyhan, Adana',
  '37.0032',  -- DOĞRULANACAK
  '35.3257',  -- DOĞRULANACAK
  20,
  true
);
```

**ONAY GEREKLİ:** Plus code'dan tam koordinatlara çevirelim mi?

---

## ADIM 2: SİPARİŞLERİ ADANA DEPO'YA TAŞI
**Durum:** ❌ Yapılmadı

### Mevcut Durum:
- Toplam sipariş: 23 adet
- Pending sipariş: 18 adet
- Şu an atanan depo: depot-2 (Ankara Depo)

### Hedef:
- 23 siparişin tamamını Adana Depo'ya (depot-3) atamak

### SQL İşlemi:
```sql
-- Önce müşterilerin hangi depoyu kullandığını değiştireceğiz (Adım 4'te)
-- Siparişler müşteri bazlı çalışıyor, bu yüzden müşterileri değiştirince siparişler otomatik takip edecek
```

**NOT:** Siparişler customers tablosu üzerinden depoya bağlı (customers.assigned_depot_id)

---

## ADIM 3: ARAÇLARI ADANA DEPO İÇİN OLUŞTUR
**Durum:** ❌ Yapılmadı

### İzmir Depo (depot-1) Araç Profili İncelenecek:
- Araç tipleri (kamyon_1, kamyon_2, vb.)
- Her tipten kaç adet
- Kapasite bilgileri
- Çalışma saatleri
- Maliyet parametreleri

### Gerekli İşlem:
1. İzmir Depo araçlarını sorgula
2. Aynı araç profilini Adana Depo için oluştur
3. Tüm araçları `is_available = true` yap

**ONAY GEREKLİ:** İzmir Depo araçlarını önce inceleyip gösterelim mi?

---

## ADIM 4: MÜŞTERİLERİ ADANA DEPO'YA BAĞLA
**Durum:** ❌ Yapılmadı

### Mevcut Durum:
- Toplam müşteri: 23 adet
- Çoğu Adana bölgesinde (Çukurova, Seyhan, Sarıçam vb.)
- Şu an atanan depo: depot-2 (Ankara Depo)

### SQL İşlemi:
```sql
UPDATE customers
SET assigned_depot_id = 'depot-3',
    updated_at = NOW()
WHERE assigned_depot_id = 'depot-2';
```

**Etki:** Bu işlem yapıldığında, müşterilerin siparişleri otomatik olarak Adana Depo'yu kullanacak.

---

## ADIM 5: OPTİMİZASYON TESTİ
**Durum:** ❌ Yapılmadı

### Test Senaryosu:
1. /optimize sayfasını aç
2. Adana Depo'yu seç
3. Pending siparişlerin göründüğünü doğrula (18-23 adet)
4. Araçların listelendiğini doğrula
5. "Optimize Et" butonuna bas
6. Railway OR-Tools servisinin çalıştığını doğrula
7. Sonuçları kontrol et

---

## ÖNCELİK SIRASI

1. ✅ **Plus Code → Koordinat Dönüşümü** (X8VG+67 → Lat/Lng)
2. ✅ **İzmir Depo Araç Profilini İncele**
3. ⏳ **Adana Depo Oluştur** (SQL)
4. ⏳ **Araçları Oluştur** (SQL)
5. ⏳ **Müşterileri Taşı** (SQL)
6. ⏳ **Test ve Doğrulama**

---

## SORULAR VE ONAYLAR

1. **Plus Code Dönüşümü:** X8VG+67 koordinatlarını Google Maps API veya manuel olarak bulalım mı?
2. **İzmir Depo Araçları:** Önce mevcut araçları görmek ister misin?
3. **Toplu İşlem:** Tüm SQL scriptlerini tek bir dosyada mı hazırlayalım, adım adım mı ilerleyelim?
4. **Backup:** İşlemlerden önce mevcut verilerin yedeğini almalı mıyız?

---

## NOTLAR

- Tüm işlemler geri alınabilir (UPDATE/DELETE ile)
- İzmir Depo (depot-1) ve Ankara Depo (depot-2) etkilenmeyecek
- Railway OR-Tools servisi zaten çalışıyor (URL doğru)
- Database bağlantısı aktif ve sağlıklı
