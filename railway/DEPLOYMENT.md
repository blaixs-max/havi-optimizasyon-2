# Railway Deployment Guide - OR-Tools VRP API

Bu döküman OR-Tools optimizer API'sini Railway'e deploy etme adımlarını içerir.

## 🚀 Quick Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

## 📋 Ön Gereksinimler

- Railway hesabı (ücretsiz tier yeterli başlangıç için)
- GitHub repo bağlantısı
- Python 3.11+ runtime

## 🔧 Railway Configuration

### 1. Service Settings

**Build Settings:**
- Builder: Dockerfile
- Dockerfile Path: `Dockerfile` (root level)
- Build Context: `/` (root)

**Deploy Settings:**
- Start Command: Auto (CMD from Dockerfile)
- Port: `$PORT` (Railway otomatik ayarlar)
- Health Check Path: `/health`

### 2. Environment Variables

Railway dashboard'da şu environment variables'ı ayarlayın:

```bash
# Port (Railway otomatik set eder, override gerekmez)
PORT=8080

# Optional: Log level
LOG_LEVEL=info

# Optional: Workers (default: 1, more = more memory)
WORKERS=1
```

### 3. Resource Settings

**Önerilen Railway Plan:**

**Starter Plan (Ücretsiz):**
- 512 MB RAM
- Shared CPU
- ✅ 10-25 customer optimize
- ⚠️ 50+ customer için yavaş olabilir

**Developer Plan ($5/month):**
- 8 GB RAM
- 8 vCPU
- ✅ 100+ customer optimize
- ✅ Production-ready

## 📦 Files Included in Build

Dockerfile kopyalanan dosyalar:
```
railway/
├── main.py                    # FastAPI app (v2 optimizer kullanır)
├── ortools_optimizer.py       # v1 optimizer (fallback)
└── ortools_optimizer_v2.py    # v2 optimizer (optimized)
```

## 🔍 Deployment Verification

Deploy sonrası test:

### 1. Health Check
```bash
curl https://your-app.railway.app/health
# Expected: {"status": "healthy"}
```

### 2. API Info
```bash
curl https://your-app.railway.app/
# Expected: {"service": "VRP Optimizer", "status": "running", "version": "1.0.0"}
```

### 3. Config Endpoint
```bash
curl https://your-app.railway.app/config
# Expected: Config options including strategies and defaults
```

### 4. Test Optimization
```bash
curl -X POST https://your-app.railway.app/optimize \
  -H "Content-Type: application/json" \
  -d @test_payload.json
```

Example `test_payload.json`:
```json
{
  "depots": [
    {
      "id": "depot-1",
      "name": "Ana Depo",
      "location": {"lat": 41.0082, "lng": 28.9784}
    }
  ],
  "customers": [
    {
      "id": "c1",
      "name": "Müşteri 1",
      "location": {"lat": 41.0182, "lng": 28.9884},
      "demand_pallets": 5,
      "business_type": "restaurant",
      "service_duration": 30,
      "has_time_constraint": false
    }
  ],
  "vehicles": [
    {
      "id": "v1",
      "type": 2,
      "capacity_pallets": 12,
      "fuel_consumption": 25.0
    }
  ],
  "fuel_price": 47.5,
  "time_limit_seconds": 30,
  "search_strategy": "SAVINGS"
}
```

## 🔄 CI/CD Setup

Railway otomatik olarak GitHub push'lardan sonra deploy yapar.

**Auto-Deploy Branches:**
- `main` → Production deploy
- `develop` → Staging deploy (ayrı Railway service oluşturun)

**Deploy Triggers:**
- Push to main/develop
- Manual trigger from Railway dashboard
- PR preview deployments (opsiyonel)

## 🐛 Troubleshooting

### Build Fails

**Error: `ModuleNotFoundError: ortools`**
```bash
# Solution: Ensure requirements-railway.txt exists and includes ortools==9.8.3296
```

**Error: `gcc: command not found`**
```bash
# Solution: Dockerfile already includes gcc/g++ installation
# Ensure Dockerfile.build RUN command is not removed
```

### Runtime Errors

**Error: `404 /optimize`**
```bash
# Check: main.py route definitions
# Ensure: ortools_optimizer_v2.py is copied to container
```

**Error: `422 Validation Error`**
```bash
# Issue: Request body validation failed
# Solution: Check payload matches Pydantic models in main.py
```

**Error: `500 Insufficient capacity`**
```bash
# Issue: Total demand > total vehicle capacity
# Solution: Add more vehicles or reduce customer demands in payload
```

### Performance Issues

**Slow optimization (>60s)**
```bash
# Check: Number of customers (50+ = slower)
# Solution 1: Reduce time_limit_seconds to 30
# Solution 2: Use fewer customers per batch
# Solution 3: Upgrade Railway plan for more CPU
```

**Memory errors (OOM)**
```bash
# Issue: 100+ customers on Starter plan
# Solution 1: Upgrade to Developer plan (8GB RAM)
# Solution 2: Reduce problem size (fewer customers)
# Solution 3: Set time_limit_seconds lower (20-30s)
```

## 📊 Monitoring

### Railway Built-in Monitoring

Railway dashboard provides:
- CPU usage
- Memory usage
- Request logs
- Deploy logs
- Crash logs

### Custom Logging

main.py includes console logging:
```python
console.log("[OR-Tools] Optimization complete in 4.8s")
console.log("[OR-Tools] Generated 5 routes")
```

View logs in Railway dashboard → Logs tab.

### Metrics

Add custom metrics endpoint (optional):
```python
@app.get("/metrics")
def metrics():
    return {
        "requests_total": request_counter,
        "avg_optimization_time": avg_time,
        "cache_hit_rate": cache_stats
    }
```

## 🔐 Security

### CORS Configuration

main.py has CORS enabled for all origins (development):
```python
allow_origins=["*"]  # ⚠️ Change in production
```

**Production recommendation:**
```python
allow_origins=[
    "https://your-frontend.vercel.app",
    "https://your-domain.com"
]
```

### API Authentication

Currently NO authentication. Add JWT/API keys for production:
```python
from fastapi.security import HTTPBearer

security = HTTPBearer()

@app.post("/optimize")
def optimize(request: Request, credentials: HTTPAuthorizationCredentials = Depends(security)):
    # Verify token
    verify_token(credentials.credentials)
    # ... optimization logic
```

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [OR-Tools Documentation](https://developers.google.com/optimization)
- [OPTIMIZATION_REPORT.md](./OPTIMIZATION_REPORT.md) - v2 optimizer details
- [BENCHMARK.md](./BENCHMARK.md) - Performance benchmarks

## 🆘 Support

Railway issues:
- Railway Discord: https://discord.gg/railway
- Railway Docs: https://docs.railway.app/

OR-Tools optimizer issues:
- Check logs in Railway dashboard
- Review OPTIMIZATION_REPORT.md
- Run local benchmarks with benchmark.py
