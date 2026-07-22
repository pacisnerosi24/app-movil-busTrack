FROM python:3.11-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY servicio/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY bustrack_model_int8.tflite .
COPY servicio/main.py .

EXPOSE 8500

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8500"]
