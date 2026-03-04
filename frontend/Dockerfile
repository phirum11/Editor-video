FROM node:20-alpine AS build

WORKDIR /app

# Install deps first (layer cache)
COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline

# Copy source & build
COPY . .
RUN npm run build

# ─── Production stage: Nginx ──────────────────────────────────────────────────
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
    CMD curl -sf http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
