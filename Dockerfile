# Stage 1: Build stage
FROM node:20-alpine AS builder

# Enable Yarn 4
RUN corepack enable && corepack prepare yarn@4 --activate

WORKDIR /app

ARG INDEXER_URL
ENV INDEXER_URL=$INDEXER_URL

# Copy package files
COPY package.json .
COPY yarn.lock .

# Install all dependencies (including dev dependencies)
RUN yarn install --frozen-lockfile

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

# Copy built app
COPY --from=builder /app/dist ./dist

# Copy package files
COPY --from=builder /app/package.json .
COPY --from=builder /app/yarn.lock .

# Copy node_modules and Yarn install state
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.yarn ./.yarn
COPY --from=builder /app/.yarn-state.yml ./.yarn-state.yml

# Copy sources needed for runtime
COPY --from=builder /app/src ./src
COPY --from=builder /app/graphql-codegen.config.ts ./graphql-codegen.config.ts
COPY --from=builder /app/static ./static

EXPOSE 3000
CMD ["yarn", "start:prod"]