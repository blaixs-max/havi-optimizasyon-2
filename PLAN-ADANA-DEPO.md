# ADANA DEPO KURULUM PLANI

## Hedef
Adana Depo'yu İzmir Depo gibi tam çalışır duruma getirmek ve optimizasyon başlatabilmek.

---

## ADIM 1: ADANA DEPO OLUŞTUR
**Durum:** ❌ Yapılmadı

### Gereksinimler:
- **Konum:** Adana Büyükşehir Belediyesi
- **Adres:** Reşatbey, Atatürk cad. No:1, 01120 Seyhan/Adana
- **Koordinatlar:** 
  - Latitude: 36.9932508
  - Longitude: 35.3256885
  - ✅ ONAYLANDI (Plus Code: X8VG+67)

### SQL İşlemi:
```sql
INSERT INTO depots (name, city, address, lat, lng, capacity_pallets, status)
VALUES (
  'Adana Merkez Depo',
  'Adana',
  'Adana Büyükşehir Belediyesi, Reşatbey, Atatürk cad. No:1, 01120 Seyhan/Adana',
  36.9932508,
  35.3256885,
  1200,
  'active'
);
```

**HAZIR:** Koordinatlar onaylandı, SQL hazır.

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

### İzmir Depo (depot-3) Araç Profili - GENİŞLETİLMİŞ FILO:
✅ **Tespit Edildi:**

**Toplam: 9 Araç (206 palet kapasitesi)**

#### TIR Araçları (4 adet):
- **Plaka:** 35 MNO 101, 102, 103, 104
- **Kapasite:** 32 palet / 25,000 kg
- **Yakıt Tüketimi:** 35.0 L/100km
- **Maliyet:** 8.50 TL/km
- **Durum:** available

#### Kamyon-2 Araçları (1 adet):
- **Plaka:** 35 PQR 201
- **Kapasite:** 18 palet / 10,000 kg
- **Yakıt Tüketimi:** 25.0 L/100km
- **Maliyet:** 6.00 TL/km
- **Durum:** available

#### Kamyon (Standart - 4 adet, eski seed'den):
- **Plaka:** 35 VRP 001-009
- **Kapasite:** 12 palet / 8,000 kg
- **Yakıt Tüketimi:** 18.0 L/100km
- **Maliyet:** 2.20 TL/km
- **Durum:** available

### Adana Depo İçin Oluşturulacak Araçlar:
Aynı profilde **9 araç** oluşturulacak:
- 4 TIR (32 palet)
- 1 Kamyon-2 (18 palet)
- 4 Kamyon (12 palet)
- **Toplam Kapasite:** 206 palet

**HAZIR:** SQL scripti hazırlanacak.

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

1. ✅ **Plus Code → Koordinat Dönüşümü** (36.9932508, 35.3256885)
2. ✅ **İzmir Depo Araç Profilini İncele** (9 araç: 4 TIR + 1 Kamyon-2 + 4 Kamyon)
3. ⏳ **SQL Scripti Hazırla** (Adana Depo + Araçlar + Müşteri Güncellemesi)
4. ⏳ **SQL Scriptini Çalıştır** (Onay sonrası)
5. ⏳ **Test ve Doğrulama** (23 sipariş + 9 araç kontrolü)

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
