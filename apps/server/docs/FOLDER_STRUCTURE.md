# Server Folder Structure

## 📁 New Organized Structure

```
apps/server/src/
├── app/                    # Next.js app router
│   └── api/               # API routes
│
├── db/                     # Database layer
│   ├── index.ts           # Drizzle DB instance
│   ├── schemas/           # Database schemas
│   │   └── auth-schema.ts
│   └── utils/             # Database-specific utilities
│       ├── index.ts       # Barrel export
│       └── helpers.ts     # withRetry, executeTransaction, error guards
│
├── lib/                    # Shared libraries & utilities
│   ├── index.ts           # Barrel export (re-exports all)
│   │
│   ├── auth/              # Authentication
│   │   ├── index.ts       # Exports: auth, getCurrentUser
│   │   ├── config.ts      # BetterAuth configuration
│   │   └── helpers.ts     # getCurrentUser helper
│   │
│   ├── config/            # Application configuration
│   │   ├── index.ts       # Exports: env
│   │   └── env.ts         # Environment variables validation
│   │
│   └── utils/             # Shared utilities
│       ├── index.ts       # Exports: logger, handleError, AppError, rateLimit
│       ├── logger.ts      # Logger service
│       ├── error-handler.ts  # Global error handler
│       └── rate-limit.ts  # Rate limiting utility
│
├── services/              # External services & integrations
│   └── email/            # Email service
│       ├── index.ts      # Exports: sendVerificationEmail, transporter
│       ├── transporter.ts # Nodemailer configuration
│       └── templates.ts   # Email template handling
│
└── templates/             # Email templates
    └── verify-email.html
```

## 🎯 Import Patterns

### Clean Barrel Exports

```typescript
// ✅ From anywhere - use barrel exports
import { auth, getCurrentUser } from "@/lib/auth";
import { env } from "@/lib/config";
import { logger, handleError, AppError, rateLimit } from "@/lib/utils";
import { withRetry, executeTransaction, isUniqueViolation } from "@/db/utils";
import { sendVerificationEmail } from "@/services/email";

// ✅ Alternative - import from lib root (re-exports everything)
import { auth, getCurrentUser, env, logger, handleError } from "@/lib";

// ✅ Direct imports (when you need specific modules)
import { logger } from "@/lib/utils/logger";
import { env } from "@/lib/config/env";
```

## 📦 Module Responsibilities

### `/lib/auth/`

- **Purpose**: Authentication configuration & helpers
- **Files**:
    - `config.ts` - BetterAuth setup with Drizzle adapter
    - `helpers.ts` - `getCurrentUser()` for session management
- **Exports**: `auth`, `getCurrentUser`

### `/lib/config/`

- **Purpose**: Application-wide configuration
- **Files**:
    - `env.ts` - Zod-validated environment variables
- **Exports**: `env`

### `/lib/utils/`

- **Purpose**: Shared utilities used across the app
- **Files**:
    - `logger.ts` - Logging service with dev/prod modes
    - `error-handler.ts` - Global error handler with DB error mapping
    - `rate-limit.ts` - In-memory rate limiting
- **Exports**: `logger`, `handleError`, `AppError`, `rateLimit`

### `/db/utils/`

- **Purpose**: Database-specific utilities
- **Files**:
    - `helpers.ts` - Retry logic, transactions, error type guards
- **Exports**: `withRetry`, `executeTransaction`, `isDatabaseError`, `isUniqueViolation`, `isForeignKeyViolation`
- **Why separate?**: Database utilities depend on `@/db` instance

### `/services/email/`

- **Purpose**: Email service integration
- **Files**:
    - `transporter.ts` - Nodemailer SMTP configuration
    - `templates.ts` - Handlebars template compilation & sending
- **Exports**: `sendVerificationEmail`, `transporter`

## ✨ Benefits of This Structure

### 1. **Clear Separation of Concerns**

- Auth logic in one place
- Email service isolated
- Database utilities near database code
- Shared utilities grouped together

### 2. **No Clutter**

- No loose files in `/lib` root
- Each subfolder has a clear purpose
- Easy to find what you need

### 3. **Clean Imports**

```typescript
// Before (cluttered)
import { auth } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth-utils";
import { sendVerificationEmail } from "@/lib/nodemailer-utils";
import { withRetry } from "@/lib/db-utils";

// After (organized)
import { auth, getCurrentUser } from "@/lib/auth";
import { sendVerificationEmail } from "@/services/email";
import { withRetry } from "@/db/utils";
```

### 4. **Scalability**

Easy to add new features:

```typescript
// Add new service
services/
  └── sms/
      ├── index.ts
      ├── twilio.ts
      └── templates.ts

// Add new util
lib/utils/
  └── validation.ts

// Add new auth provider
lib/auth/
  └── providers/
      ├── github.ts
      └── discord.ts
```

## 🔄 Migration Summary

### Files Moved:

- `lib/auth.ts` → `lib/auth/config.ts`
- `lib/auth-utils.ts` → `lib/auth/helpers.ts`
- `lib/env.ts` → `lib/config/env.ts`
- `lib/logger.ts` → `lib/utils/logger.ts`
- `lib/error-handler.ts` → `lib/utils/error-handler.ts`
- `lib/rate-limit.ts` → `lib/utils/rate-limit.ts`
- `lib/db-utils.ts` → `db/utils/helpers.ts`
- `lib/nodemailer.ts` → `services/email/transporter.ts`
- `lib/nodemailer-utils.ts` → `services/email/templates.ts`

### Barrel Exports Added:

- `lib/index.ts` - Re-exports all lib modules
- `lib/auth/index.ts` - Auth module exports
- `lib/config/index.ts` - Config exports
- `lib/utils/index.ts` - Utility exports
- `db/utils/index.ts` - DB utility exports
- `services/email/index.ts` - Email service exports

### All Imports Updated:

✅ API routes updated
✅ Core services updated
✅ Database connection updated
✅ Proxy configuration updated

## 📝 Best Practices

1. **Use barrel exports** for cleaner imports
2. **Keep related code together** (auth code in auth folder)
3. **Separate services** from utilities (services = external integrations)
4. **Database utilities** stay with database code
5. **Configuration** separate from business logic

## 🚀 Next Steps

Your folder structure is now production-ready and follows industry best practices!
