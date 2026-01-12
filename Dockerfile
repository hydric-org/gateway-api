# ==========================================
# STAGE 1: Dependency & Build
# ==========================================
FROM node:20-alpine AS builder

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec9ee063c5aaafaf3#nodealpine 
# to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat python3 make g++ git
RUN corepack enable && corepack prepare yarn@4.12.0 --activate

WORKDIR /app

# Copy configuration files first (Optimizes layer caching)
COPY .yarnrc.yml package.json yarn.lock ./
COPY .yarn ./.yarn

# Install ALL dependencies (including devDeps for the build)
RUN yarn install --immutable

ARG INDEXER_URL
ENV INDEXER_URL=$INDEXER_URL

# Copy source and build
COPY . .
RUN yarn gen
RUN yarn build

# Create a separate directory for production-only dependencies
RUN mkdir /prod_node_modules
WORKDIR /prod_node_modules
COPY .yarnrc.yml package.json yarn.lock ./
COPY .yarn ./.yarn
RUN corepack enable && corepack prepare yarn@4.12.0 --activate && \
    yarn workspaces focus --all --production


# ==========================================
# STAGE 2: Final Production Image
# ==========================================
FROM node:20-alpine AS production

WORKDIR /app

# Set production environment
ENV ENVIRONMENT=production

# Running as 'node' (pre-existing in alpine) is a security best practice
USER node

# We omit the source code, TS files, and devDependencies
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /prod_node_modules/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/static ./static

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Use 'node' directly instead of 'yarn' to save memory and handle OS signals correctly
CMD ["node", "dist/main.js"]

