FROM python:3.11-slim

WORKDIR /app

# Bağımlılıkları kur
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Uygulama kodunu kopyala
COPY . .

# Port
EXPOSE 8000

# Uygulamayı başlat
CMD ["python", "main.py"]
