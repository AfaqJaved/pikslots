# Build context must be the monorepo root (bun workspaces + nx need the whole tree).
# e.g. docker build -f packages/ui/Dockerfile --build-arg VITE_API_URL=... .

FROM oven/bun:1 AS base
WORKDIR /app
# no .git dir in the build context - skip husky's git-hook install
ENV HUSKY=0

FROM base AS deps
COPY package.json bun.lock ./
COPY packages/api/package.json packages/api/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/domain/package.json packages/domain/package.json
COPY packages/datetime/package.json packages/datetime/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN bun install --frozen-lockfile

FROM deps AS build
# VITE_* vars are baked into the static bundle at build time, not read at
# container start - they must be provided as build args, not runtime env.
ARG VITE_API_URL
ARG VITE_APP_ROOT_DOMAIN
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_ROOT_DOMAIN=$VITE_APP_ROOT_DOMAIN
COPY . .
RUN bunx nx build ui

FROM nginx:1.27-alpine AS runtime
COPY packages/ui/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/packages/ui/build /usr/share/nginx/html

EXPOSE 80
