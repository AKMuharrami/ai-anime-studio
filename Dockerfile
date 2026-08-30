# Multi-stage build for a lightweight production image
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency configuration files
COPY package*.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Copy project files and build the production bundle
COPY . .
RUN npm run build

# Production runner stage
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package configurations and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled production artifacts and assets from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the internal container port
EXPOSE 3000

# Run the bundled full-stack production server
CMD ["node", "dist/server.cjs"]
