# Build stage
FROM node:20-alpine AS builder

WORKDIR /workspace

COPY package*.json ./
COPY tsconfig*.json ./

RUN npm ci --only=production=false

COPY src ./src

RUN npm run build

# Production stage
FROM node:20-alpine AS production

RUN apk add --no-cache dumb-init

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci --only=production && npm cache clean --force

COPY --from=builder /workspace/dist ./dist

COPY --from=builder /workspace/src/common/templates ./dist/common/templates

RUN mkdir -p uploads && chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3000


CMD ["node", "dist/main.js"]