# B2B Sales Intelligence Platform - Production Container
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p logs uploads && chown -R nodeuser:nodejs logs uploads

# Switch to non-root user
USER nodeuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "start"]

# Multi-stage build for smaller production image
FROM node:18-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001

# Copy only production files from base stage
COPY --from=base --chown=nodeuser:nodejs /app/node_modules ./node_modules
COPY --from=base --chown=nodeuser:nodejs /app/package*.json ./
COPY --chown=nodeuser:nodejs server.js ./
COPY --chown=nodeuser:nodejs public ./public/
COPY --chown=nodeuser:nodejs .env.example ./

# Create runtime directories
RUN mkdir -p logs uploads && chown -R nodeuser:nodejs logs uploads

# Switch to non-root user
USER nodeuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Labels for metadata
LABEL maintainer="vm799@example.com"
LABEL description="B2B Sales Intelligence Platform"
LABEL version="1.0.0"

# Start the application
CMD ["npm", "start"]