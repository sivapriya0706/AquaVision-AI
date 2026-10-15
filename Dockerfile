# Multi-stage build for AquaVision AI (Node.js + Python ML + React SPA)
FROM node:20-slim AS frontend-builder

WORKDIR /app
COPY client/package*.json ./client/
RUN npm --prefix client install
COPY client/ ./client/
RUN npm --prefix client run build

# Production image
FROM node:20-slim

# Install CA certificates, curl, and Python for ML models
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Setup Python virtual environment with ML packages
RUN python3 -m venv /app/ai/.venv && \
    /app/ai/.venv/bin/pip install --no-cache-dir joblib pandas scikit-learn numpy

# Install Node dependencies
COPY package*.json ./
COPY server/package*.json ./server/
RUN npm install && npm --prefix server install --omit=dev

# Copy application files
COPY server/ ./server/
COPY ai/ ./ai/
COPY --from=frontend-builder /app/client/dist ./client/dist

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

CMD ["node", "server/server.js"]
