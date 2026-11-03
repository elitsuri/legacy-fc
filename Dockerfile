# ---------- 1) build the game page + React shell ----------
FROM node:22-alpine AS web
WORKDIR /src
RUN apk add --no-cache python3
COPY game ./game
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm ci --no-audit --no-fund
COPY frontend ./frontend
RUN python3 game/build.py && cd frontend && npm run build

# ---------- 2) Python API serving the built site ----------
FROM python:3.13-slim AS app
# DATABASE_URL is deliberately NOT defaulted: production needs a hosted PostgreSQL (the app refuses to start without one).
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 APP_ENV=production STATIC_DIR=/app/static
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/alembic.ini ./alembic.ini
COPY backend/migrations ./migrations
COPY backend/app ./app
COPY --from=web /src/frontend/dist ./static
RUN useradd --create-home --uid 10001 lfc
USER lfc
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=4s --retries=3 CMD python -c "import os,urllib.request;urllib.request.urlopen('http://127.0.0.1:%s/api/health'%os.getenv('PORT','8000'),timeout=3)"
# the schema is migrated (Alembic, advisory-locked) when the app starts; run ONE process per database unless a shared rate limiter is added
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --proxy-headers --forwarded-allow-ips='*' --workers ${WORKERS:-1}"]
