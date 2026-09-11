FROM python:3.11-slim

# Установка системных зависимостей для сборки psycopg2 и сетевых утилит
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Создание рабочей директории
WORKDIR /app

# Установка зависимостей Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копирование исходного кода приложения
COPY . .

# Открытие порта для Flask
EXPOSE 5000

# Запуск приложения через Gunicorn или напрямую Flask
CMD ["python", "app.py"]
