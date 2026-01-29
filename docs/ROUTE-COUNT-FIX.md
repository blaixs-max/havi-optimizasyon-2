# 6 Rota Sorunu - Çözüm Dokümantasyonu

## Sorun Tespiti

Optimizasyon algoritması **2-3 yerine 6 rota** üretiyordu.

### Kök Sebep Analizi

#### 1. **Veritabanında 50 Araç Var**
```sql
-- scripts/003-seed-vehicles.sql
İstanbul: 20 araç
Ankara: 15 araç
İzmir: 15 araç
TOPLAM: 50 aktif araç
```

#### 2. **OR-Tools TÜM Araçları Kullanıyordu**
Önceki kod:
```python
num_vehicles = len(vehicles)  # 50 araç!
manager = pywrapcp.RoutingIndexManager(num_locations, num_vehicles, 0)
```

**Sorun**: OR-Tools'a 50 araç verildiğinde, algoritma bunların hepsini kullanabileceğini varsayar.

#### 3. **Sabit Maliyet Çok Düşüktü**
```python
routing.SetFixedCostOfAllVehicles(10000)  # Sadece ~10 km eşdeğeri
```

**Sorun**: 100-200 km'lik rotalarda, araç başına 10 km ek maliyet caydırıcı değil.

---

## Uygulanan Çözümler

### ✅ Çözüm 1: Akıllı Araç Sayısı Sınırlandırma

**Mantık**: Talebe göre minimum gereken araç sayısını hesapla, sadece o kadar aracı OR-Tools'a gönder.

```python
# CRITICAL FIX: Limit vehicles based on actual demand
total_demand = sum(demands)  # Örn: 60 palet
max_vehicle_capacity = max(v.get("capacity_pallets", 26) for v in vehicles)  # Örn: 33 palet

min_vehicles_needed = math.ceil(total_demand / max_vehicle_capacity)
# 60 / 33 = 1.82 → 2 araç minimum

# %20 güvenlik payı ekle, ama 6 araçtan fazla kullanma
optimal_vehicle_count = min(
    max(2, math.ceil(min_vehicles_needed * 1.2)),  # En az 2, +%20 buffer
    len(vehicles),  # Mevcut araç sayısını aşma
    6  # 6 araçtan fazla kullanma (hard cap)
)

vehicles = vehicles[:optimal_vehicle_count]
num_vehicles = len(vehicles)  # Artık 2-3 araç!
```

**Uygulama Yerleri**:
- `_optimize_single_depot()` - Line 255
- `optimize_routes()` (multi-depot) - Line 161
- `_optimize_multi_depot()` - Line 655

---

### ✅ Çözüm 2: Sabit Maliyeti 5x Artırma

**Mantık**: Araç kullanmayı daha pahalı yap, böylece algoritma daha az araç tercih eder.

```python
# Önceki: 10000 (çok düşük)
# Yeni: 50000 (5x artış)
routing.SetFixedCostOfAllVehicles(50000)
```

**Etki**: 
- Önceki: ~10 km ek maliyet (caydırıcı değil)
- Yeni: ~50 km ek maliyet (çok caydırıcı!)

**Uygulama Yerleri**:
- `_optimize_single_depot()` - Line 344
- `_optimize_multi_depot()` - Line 750

---

## Beklenen Sonuç

### Önceki Davranış
```
Talep: 60 palet
Mevcut araçlar: 50 araç (tümü OR-Tools'a gönderiliyordu)
Sabit maliyet: 10000 (düşük)
Sonuç: 6 rota ✗
```

### Yeni Davranış
```
Talep: 60 palet
Max araç kapasitesi: 33 palet
Min gereken: 60/33 = 2 araç
Buffer ile: 2 * 1.2 = 2.4 → 3 araç
Hard cap: min(3, 6) = 3 araç
Sabit maliyet: 50000 (yüksek)
Sonuç: 2-3 rota ✓
```

---

## Test Senaryoları

### Senaryo 1: Düşük Talep
```
Talep: 30 palet
Max kapasite: 33 palet
Min: 30/33 = 0.91 → 1 araç
Buffer: 1 * 1.2 = 1.2 → 2 araç (minimum)
Beklenen: 2 rota
```

### Senaryo 2: Orta Talep
```
Talep: 80 palet
Max kapasite: 33 palet
Min: 80/33 = 2.42 → 3 araç
Buffer: 3 * 1.2 = 3.6 → 4 araç
Beklenen: 3-4 rota
```

### Senaryo 3: Yüksek Talep
```
Talep: 200 palet
Max kapasite: 33 palet
Min: 200/33 = 6.06 → 7 araç
Buffer: 7 * 1.2 = 8.4 → 9 araç
Hard cap: min(9, 6) = 6 araç
Beklenen: 6 rota (maksimum)
```

---

## Önemli Notlar

1. **Hard Cap (6 Araç)**: Çok fazla rota üretmeyi engellemek için maksimum 6 araç sınırı kondu.
   
2. **%20 Buffer**: Rota verimsizlikleri (geometri, zaman kısıtları) için %20 güvenlik payı eklendi.

3. **Minimum 2 Araç**: Çok az taleple bile en az 2 araç kullanılır (yedeklilik için).

4. **Multi-Depot Desteği**: Tüm optimizasyon fonksiyonlarında uygulandı:
   - `_optimize_single_depot()`
   - `optimize_routes()`
   - `_optimize_multi_depot()`

---

## Kod Değişiklikleri Özeti

| Dosya | Fonksiyon | Değişiklik |
|-------|-----------|------------|
| `railway/ortools_optimizer.py` | `_optimize_single_depot()` | ✅ Araç limiti + sabit maliyet artışı (Line 255, 344) |
| `railway/ortools_optimizer.py` | `optimize_routes()` | ✅ Araç limiti (Line 161) |
| `railway/ortools_optimizer.py` | `_optimize_multi_depot()` | ✅ Araç limiti + sabit maliyet artışı (Line 655, 750) |

---

## Deployment

Bu değişiklikler **Railway** üzerinde deploy edilmeli:

```bash
cd railway
git pull
# Railway otomatik deploy edecek
```

Vercel tarafında değişiklik yok (sadece Railway Python servisinde).

---

## Doğrulama

Optimizasyon sonrası log'larda şunu göreceksiniz:

```
[OR-Tools] ===== VEHICLE OPTIMIZATION =====
[OR-Tools] Total demand: 60 pallets
[OR-Tools] Max vehicle capacity: 33 pallets
[OR-Tools] Min vehicles needed: 2
[OR-Tools] Optimal vehicle count (with buffer): 3
[OR-Tools] Available vehicles: 50
[OR-Tools] Vehicles to use: 3
```

✅ **Sonuç**: Artık 2-3 rota üretilecek!
