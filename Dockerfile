# Multi-stage Dockerfile for Call Break Arena
# Stage 1: Build Frontend Client
FROM node:20-alpine AS client-builder
WORKDIR /app

# Copy shared constants & client package
COPY shared/ ./shared/
COPY client/package*.json ./client/
RUN cd client && npm ci

# Copy client source & build production bundle
COPY client/ ./client/
RUN cd client && npm run build

# Stage 2: Production Server Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

# Copy shared constants & server package
COPY shared/ ./shared/
COPY server/package*.json ./server/
RUN cd server && npm ci --only=production

# Copy server code
COPY server/ ./server/

# Copy compiled frontend dist from Stage 1
COPY --from=client-builder /app/client/dist ./client/dist

# Expose backend port
EXPOSE 3001

# Start Call Break server (serves both Socket.IO and Frontend static app)
CMD ["node", "server/src/server.js"]
