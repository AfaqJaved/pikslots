# Pikslots — Project Overview

## What Is It?

**Pikslots** is a multi-tenant SaaS appointment booking and scheduling platform. Businesses (salons, health centers, fitness studios, medical practices, etc.) use it to offer online booking to their customers, manage their team's calendar, and control the full booking experience — from branding to cancellation policies.

The core concept: businesses own "slots" (availability windows) that customers can discover and book, with deep customization over how that process looks and behaves.

---

## Tech Stack

### Backend

| Layer | Technology |
|---|---|
| Framework | NestJS (Node.js) |
| Language | TypeScript |
| Database | PostgreSQL |
| Query Builder | Kysely (type-safe SQL) |
| Authentication | JWT (access + refresh tokens) |
| Password Hashing | bcrypt |
| Job Queue | BullMQ (backed by Redis) |
| Email | Nodemailer + SMTP (Mailpit in dev) |
| API Docs | Swagger / OpenAPI (Scalar UI) |
| Testing | Jest |

### Frontend

| Layer | Technology |
|---|---|
| Framework | SvelteKit (static adapter) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn-svelte, Bits UI |
| Data Fetching | TanStack Svelte Query |
| HTTP Client | Axios |
| Forms | sveltekit-superforms + Zod |
| Icons | Tabler Icons Svelte, Lucide Svelte |
| Charts | Layerchart (D3) |
| Drag & Drop | dnd-kit-svelte |
| Notifications | svelte-sonner |

### Infrastructure & Tooling

| Area | Technology |
|---|---|
| Monorepo | Nx v22 + npm workspaces |
| Package Manager | Bun |
| Containers | Docker Compose (Postgres, Redis, Mailpit) |
| Linting | ESLint |
| Formatting | Prettier |

---

## Project Structure

The project is an **Nx monorepo** with four packages:

```
pikslots/
├── packages/
│   ├── api/        # NestJS REST API (backend)
│   ├── ui/         # SvelteKit frontend (dashboard + booking UI)
│   ├── domain/     # Domain entities, use cases, repository interfaces
│   └── shared/     # Zod schemas and TypeScript types shared across packages
└── docker/         # Docker Compose service configs
```

### `packages/api`
NestJS application. Organized by feature modules (`user`, `business`). Cross-cutting concerns (auth guards, JWT, database, queue, email) live in `shared/`.

### `packages/ui`
SvelteKit app. Routes map to pages; feature logic sits in `modules/` alongside the routes. Communicates with the API via Axios + TanStack Query.

### `packages/domain`
Pure TypeScript. Contains entities (`UserEntity`, `BusinessEntity`), use case classes (`LoginUserUseCase`, `RegisterBusinessUseCase`, etc.), repository interfaces, and domain events. No framework dependencies.

### `packages/shared`
Zod schemas and TypeScript types for API request/response contracts. Consumed by both `api` and `ui` to keep them in sync.

---

## Key Features

### Authentication & Roles
- JWT-based login with access and refresh tokens
- 6 roles: Platform Owner, Business Owner, Admin, Enhanced, Standard, No Access
- Role-based guards on all API endpoints

### Business Management
- Business registration with a unique slug
- Industry categories (salon, health, fitness, medical, education, legal, etc.)
- Subscription tiers: free, starter, pro, enterprise (14-day trial)
- Status lifecycle: `pending_setup` → `active` → `inactive` / `suspended`

### Booking Configuration
- **Policies**: lead time, schedule window, cancellation rules
- **Setup**: team member selection mode, multi-service booking, customer login requirement, rescheduling controls
- **Contact Fields**: enable/require standard fields (name, email, phone, address) + custom fields
- **Customization**: language, 12/24h time, week start, label overrides, terms & conditions, post-booking redirect

### Branding
- Logo and banner upload
- Color theme, button shapes, light/dark/system mode
- Option to show or hide Pikslots branding

### Team Management
- Invite team members with role assignment
- Per-member notification and reminder preferences
- Sound preferences (chime, whistle)

### Dashboard
- Customers and contacts list
- Bookings management
- Services / classes management
- Payments and integrations

### Architecture Patterns
- **Clean Architecture**: domain layer is framework-agnostic
- **Repository Pattern**: data access abstracted behind interfaces
- **Use Case Pattern**: each business operation is an isolated use case class
- **DTOs + Zod**: validation at system boundaries, type safety throughout

---

## Database

Two primary tables:

**`users`** — core credentials, profile, role, notification preferences, audit fields

**`businesses`** — name, slug, industry, status, subscription, plus 8 JSONB columns for flexible settings (brand details, location, booking policies, customization, etc.)

Both tables use soft delete (`is_deleted`) and full audit fields (`created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`).

---

## Development

```bash
# Start all packages in dev mode
bun run dev

# Run database migrations (from packages/api)
npm run migration:run

# Docker services (Postgres, Redis, Mailpit)
docker compose -f docker/redis.yml up -d
```
