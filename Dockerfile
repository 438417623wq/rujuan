FROM python:3.12-slim

WORKDIR /app
COPY . .

ENV AIRP_DATA_DIR=/app/data
ENV PORT=8080
EXPOSE 8080

CMD ["python3", "server.py"]
