# Build context must be the monorepo root (bun workspaces + nx need the whole tree).
# e.g. docker build -f packages/api/Dockerfile .

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
COPY . .
# api runs straight from TypeScript source at runtime (bun executes .ts
# natively and resolves the tsconfig baseUrl-relative "src/..." imports used
# throughout the app) - only the workspace libraries need a compile step,
# since their package.json "exports" point at ./dist
RUN bunx nx run-many -t build --projects=@pikslots/domain,@pikslots/datetime,@pikslots/shared

FROM base AS runtime
ENV NODE_ENV=production
COPY package.json bun.lock ./
COPY packages/api/package.json packages/api/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/domain/package.json packages/domain/package.json
COPY packages/datetime/package.json packages/datetime/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN bun install --frozen-lockfile --production

COPY --from=build /app/packages/domain/dist packages/domain/dist
COPY --from=build /app/packages/datetime/dist packages/datetime/dist
COPY --from=build /app/packages/shared/dist packages/shared/dist
COPY packages/api/tsconfig.json packages/api/tsconfig.json
COPY packages/api/src packages/api/src

WORKDIR /app/packages/api
EXPOSE 3000
CMD ["bun", "src/main.ts"]
