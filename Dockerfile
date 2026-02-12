FROM python:3.12-slim

WORKDIR /app
COPY . .

ENV AIRP_DATA_DIR=/app/data
EXPOSE 8080

CMD ["python3", "server.py"]
