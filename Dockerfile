# Stage 1: Build stage
FROM node:20-alpine AS builder

# Enable Yarn 4
RUN corepack enable && corepack prepare yarn@4 --activate

WORKDIR /app

# Native build deps for packages like @swc/core
RUN apk add --no-cache python3 make g++ git

# Copy Yarn config first so install uses node_modules
COPY .yarnrc.yml ./

ARG INDEXER_URL
ENV INDEXER_URL=$INDEXER_URL

# Copy package files
COPY package.json .
COPY yarn.lock .

# Yarn 4 immutable install (replacement for --frozen-lockfile)
RUN yarn install --immutable

# Copy the rest of the source code
COPY . .

# Run code generation
RUN yarn gen

# Build the application
RUN yarn build

# Stage 2
FROM node:20-alpine AS production

RUN corepack enable && corepack prepare yarn@4 --activate

WORKDIR /app

# If native modules need runtime tools, keep minimal
RUN apk add --no-cache git

# Copy built app
COPY --from=builder /app/dist ./dist

# Copy package files and config
COPY --from=builder /app/package.json .
COPY --from=builder /app/yarn.lock .
COPY --from=builder /app/.yarnrc.yml ./.yarnrc.yml

# Copy node_modules produced by nodeLinker=node-modules
COPY --from=builder /app/node_modules ./node_modules

# Copy sources needed for runtime (if your app requires them at runtime)
COPY --from=builder /app/src ./src
COPY --from=builder /app/graphql-codegen.config.ts ./graphql-codegen.config.ts
COPY --from=builder /app/static ./static

EXPOSE 3000
CMD ["yarn", "start:prod"]
