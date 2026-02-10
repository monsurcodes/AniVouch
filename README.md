# AniVouch

**AniVouch** is a full-stack anime community platform that integrates with the AniList API, providing users with authentication, anime browsing, and social features. Built as a modern monorepo, it includes a Next.js web application, a Next.js API server with database integration, and a React Native mobile app powered by Expo.

---

## 📋 Table of Contents

- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Development](#-development)
- [Deployment](#-deployment)
- [Development Features](#-development-features)
- [License](#-license)

---

## 📁 Project Structure

This is a monorepo managed with **pnpm workspaces** and **Turborepo** for efficient task orchestration.

```
anivouch-monorepo/
├── apps/
│   ├── mobile/          # React Native (Expo) mobile application
│   ├── server/          # Next.js API server with authentication & database
│   └── web/             # Next.js web application
├── packages/
│   ├── eslint-config/   # Shared ESLint configurations
│   ├── types/           # Shared TypeScript types and Zod schemas
│   └── typescript-config/ # Shared TypeScript configurations
```

### Apps

- **`@anivouch/mobile`** - React Native mobile app powered by Expo Router
- **`@anivouch/server`** - Next.js API server with Better Auth, Drizzle ORM, and Neon Database
- **`@anivouch/web`** - Next.js web application with React Query and Tailwind CSS

### Packages

- **`@repo/types`** - Shared TypeScript interfaces and Zod validation schemas
- **`@repo/eslint-config`** - Shared ESLint configurations
- **`@repo/typescript-config`** - Shared TypeScript configurations

---

## 🛠 Tech Stack

### Frontend (Web)

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **State Management**: Jotai, TanStack React Query
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Ky
- **UI Components**: Custom components with class-variance-authority

### Frontend (Mobile)

- **Framework**: Expo 54 with Expo Router
- **Runtime**: React Native 0.81
- **UI**: React Native Reanimated, Expo Symbols
- **Navigation**: Expo Router (file-based routing)

### Backend (Server)

- **Framework**: Next.js 16 (API Routes)
- **Authentication**: Better Auth (with Google OAuth)
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Email**: Nodemailer with Handlebars templates
- **Validation**: Zod
- **Password Hashing**: Bcrypt

### Developer Experience

- **Monorepo**: Turborepo + pnpm workspaces
- **Language**: TypeScript 5.9
- **Linting**: ESLint 9
- **Formatting**: Prettier with Tailwind plugin
- **Type Checking**: TypeScript strict mode

### External APIs

- **AniList GraphQL API** - Anime and manga data

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18
- **pnpm** 9.0.0 (specified in `packageManager` field)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/monsurcodes/AniVouch.git
cd AniVouch
```

2. **Install pnpm** (if not already installed)

```bash
npm install -g pnpm@9.0.0
```

3. **Install all dependencies**

Install dependencies for all apps and packages:

```bash
pnpm install
```

4. **Environment Setup**

Create `.env` files for the required apps:

**For `apps/server/.env`:**

```env
# Database
DATABASE_URL="postgresql://..."

# Better Auth
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3001"

# OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Frontend URLs
WEB_FRONTEND_URL="http://localhost:3000"
EXPO_FRONTEND_URL="exp://localhost:8081"

# Email (SMTP)
SMTP_MAIL_USERNAME="your-smtp-username"
SMTP_MAIL_PASS="your-smtp-password"
SMTP_SENDER_EMAIL="noreply@example.com"

# AniList API
ANILIST_GRAPHQL_API="https://graphql.anilist.co"
```

**For `apps/web/.env`:**

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

**For `apps/mobile/.env`:**

```env
EXPO_PUBLIC_API_URL="http://localhost:3001"
```

5. **Database Setup**

Run database migrations:

```bash
cd apps/server
pnpm drizzle-kit push
```

---

## 💻 Development

### Start All Apps

To run all applications concurrently:

```bash
pnpm dev
```

This will start:

- Web app at `http://localhost:3000`
- Server API at `http://localhost:3001`
- Mobile app with Expo (scan QR code with Expo Go)

### Start Specific Apps

Use Turbo filters to run specific apps:

```bash
# Web app only
pnpm dev --filter=@anivouch/web

# Server only
pnpm dev --filter=@anivouch/server

# Mobile app only
pnpm dev --filter=@anivouch/mobile
```

### Install Packages

**Install globally (for all workspaces):**

```bash
pnpm add <package-name> -w
```

**Install for a specific app:**

```bash
# Using filter
pnpm add <package-name> --filter=@anivouch/web

# Or navigate to the app directory
cd apps/web
pnpm add <package-name>
```

**Install for a specific package:**

```bash
pnpm add <package-name> --filter=@repo/types
```

**Install as dev dependency:**

```bash
pnpm add -D <package-name> --filter=@anivouch/server
```

### Other Commands

```bash
# Build all apps
pnpm build

# Lint all apps
pnpm lint

# Type check all apps
pnpm check-types

# Format code
pnpm format
```

---

## 🚢 Deployment

### Deploying Server and Web Apps

When deploying the `server` and `web` apps, you need to ensure internal packages are properly bundled to avoid module resolution errors.

#### Option 1: Using Vercel (Recommended)

Vercel automatically handles monorepo deployments with proper internal package resolution.

1. **Connect your repository** to Vercel
2. **Configure build settings** for each app:

**For `@anivouch/server`:**

- Root Directory: `apps/server`
- Build Command: `cd ../.. && pnpm install && pnpm build --filter=@anivouch/server`
- Output Directory: `apps/server/.next`
- Install Command: `pnpm install`

**For `@anivouch/web`:**

- Root Directory: `apps/web`
- Build Command: `cd ../.. && pnpm install && pnpm build --filter=@anivouch/web`
- Output Directory: `apps/web/.next`
- Install Command: `pnpm install`

3. **Add environment variables** in Vercel dashboard

#### Option 2: Manual Deployment (Docker, VPS, etc.)

To avoid errors locating internal packages (`@repo/types`, `@repo/eslint-config`, `@repo/typescript-config`):

**Method A: Build from Monorepo Root**

```bash
# Build all dependencies first
pnpm build

# Then build the specific app
pnpm build --filter=@anivouch/web
pnpm build --filter=@anivouch/server
```

**Method B: Use Turbo Prune**

This creates a pruned workspace with only the necessary dependencies:

```bash
# Prune workspace for web app
npx turbo prune @anivouch/web --docker

# Prune workspace for server app
npx turbo prune @anivouch/server --docker
```

The pruned output in `./out` directory contains:

- `./out/json/` - Package.json files
- `./out/pnpm-lock.yaml` - Lockfile
- `./out/full/` - Full source code with dependencies

**Dockerfile Example:**

```dockerfile
FROM node:18-alpine AS base
RUN corepack enable

FROM base AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune @anivouch/web --docker

FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .
RUN pnpm build --filter=@anivouch/web

FROM base AS runner
WORKDIR /app
COPY --from=installer /app/apps/web/.next/standalone ./
COPY --from=installer /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer /app/apps/web/public ./apps/web/public

CMD node apps/web/server.js
```

**Key Points:**

1. Always install from the **monorepo root** to ensure pnpm workspace links are created
2. Build packages before building apps using `pnpm build` (Turbo handles dependency order)
3. Use `--filter` flag to build specific apps while including their dependencies
4. Internal packages are symlinked by pnpm workspaces, so they must be built before the apps that depend on them

---

## ✨ Development Features

- **🔄 Monorepo Architecture** - Shared code across web, mobile, and server with pnpm workspaces
- **⚡ Turborepo** - Fast, incremental builds with intelligent caching
- **🔐 Authentication** - Complete auth system with Better Auth (email verification, password reset, Google OAuth)
- **📧 Email Templates** - Handlebars-based email templates for auth flows
- **🗄️ Database Migrations** - Type-safe database schema with Drizzle ORM
- **📱 Mobile Ready** - React Native app with Expo for iOS and Android
- **🎨 Shared Types** - Centralized TypeScript types and Zod schemas in `@repo/types`
- **🧹 Code Quality** - ESLint, Prettier, and TypeScript strict mode across all apps
- **🔧 Developer Experience** - Hot reload, fast refresh, and TUI for development
- **🌐 API Integration** - Integration with AniList GraphQL API for anime data

---

## 📄 License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

Copyright (C) 2026 Monsur Mazumder (monsurcodes)

For more details, see the [LICENSE](LICENSE) file.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📞 Contact

For questions or support, please contact: monsurcodes@gmail.com
