FROM python:3.11-slim

WORKDIR /app

# Sistem bağımlılıkları
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Python bağımlılıkları
COPY requirements-railway.txt .
RUN pip install --no-cache-dir -r requirements-railway.txt

# Uygulama dosyaları
COPY railway/main.py .
COPY railway/ortools_optimizer.py .

# Port
EXPOSE 8080

# Çalıştır
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}
