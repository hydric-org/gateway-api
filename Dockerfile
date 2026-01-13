# ==========================================
# STAGE 1: Dependency & Build
# ==========================================
FROM node:20-alpine AS builder

# Install system dependencies
RUN apk add --no-cache libc6-compat python3 make g++ git
RUN corepack enable && corepack prepare yarn@4.12.0 --activate

WORKDIR /app

# Copy configuration files first
COPY .yarnrc.yml package.json yarn.lock ./

# Install ALL dependencies WITHOUT running scripts (caching layer)
RUN YARN_ENABLE_SCRIPTS=false yarn install --immutable

# Set build-time variables
ARG INDEXER_URL
ENV INDEXER_URL=$INDEXER_URL

# Copy source
COPY . .

# Run full install to trigger postinstall (codegen) and build native modules
RUN yarn install --immutable
RUN yarn build

# Create production-only dependencies in a clean step
RUN mkdir /prod_node_modules
WORKDIR /prod_node_modules
COPY .yarnrc.yml package.json yarn.lock ./
# Note: We do NOT COPY .yarn here. Corepack uses the global cache or fetches the binary.
RUN corepack enable && corepack prepare yarn@4.12.0 --activate && \
    YARN_ENABLE_SCRIPTS=false yarn workspaces focus --all --production


# ==========================================
# STAGE 2: Final Production Image
# ==========================================
FROM node:20-alpine AS production

WORKDIR /app

ARG ENVIRONMENT
ENV ENVIRONMENT=$ENVIRONMENT

# Security: Use the non-root node user
USER node

# Copy only what is strictly necessary for runtime
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /prod_node_modules/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/static ./static

EXPOSE 3000

# Healthcheck using 127.0.0.1 (Fixed for Alpine/Docker networking)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/health || exit 1

# Start the application
CMD ["node", "dist/main.js"]