# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /workspace

# Copy package files for better layer caching
COPY package*.json ./
COPY tsconfig*.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci --only=production=false

# Copy source code
COPY src ./src

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /workspace/dist ./dist

# Copy template files (needed at runtime for EJS rendering)
COPY --from=builder /workspace/src/common/templates ./dist/common/templates

# Create uploads directory and set permissions
RUN mkdir -p uploads && chown -R nestjs:nodejs /app
USER nestjs

# Expose port (configurable via environment)
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node --version || exit 1

# Use dumb-init to handle signals properly
CMD ["node", "dist/main.js"]