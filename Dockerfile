# ------------------------------
# Stage 1: Build
# ------------------------------
FROM node:22-bookworm-slim AS builder

# Disable husky during install
ENV HUSKY=0

# Set working directory
WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy only package.json and pnpm-lock.yaml first (for better Docker cache)
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the project
COPY . .

# Build the application
RUN pnpm build

# "🧹 Pruning dev dependencies..."
RUN pnpm prune --prod --ignore-scripts

# ------------------------------
# Stage 2: Runtime
# ------------------------------
FROM node:22-bookworm-slim AS runner

# Set working directory
WORKDIR /app

# Copy package.json and node_modules from builder stage
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Create non-root user and prepare writable directories
RUN groupadd --system app && useradd --system --gid app app \
  && mkdir -p /app/logs \
  && chown -R app:app /app
USER app

# Default application port
EXPOSE 3002

CMD ["node", "dist/src/main"]