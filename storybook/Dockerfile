FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Build stage
FROM base AS build
WORKDIR /app

# Copy root workspace config
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./

# Copy all packages and apps (simpler for monorepo build context)
# In a refined production setup, we might copy only necessary packages using turbo prune
COPY . .

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build Storybook
# We filter to storybook and its dependencies
RUN pnpm build --filter @repo/storybook...

# Runner stage
FROM nginx:alpine AS runner

# Copy static assets from build stage
COPY --from=build /app/apps/storybook/storybook-static /usr/share/nginx/html

# Copy custom nginx config
COPY apps/storybook/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
