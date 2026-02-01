# Drizzle + Neon Error Handling Guide

## Overview

Your codebase now has comprehensive error handling for Drizzle ORM with Neon Postgres. Here's how it works:

## Error Flow

```
Database Operation → Postgres Error → Neon → Drizzle → Your catch block → handleError()
```

## Common Postgres Error Codes

| Code            | Type                  | Handled By               | Response                            |
| --------------- | --------------------- | ------------------------ | ----------------------------------- |
| `23505`         | Unique Violation      | ✅ Auto-detected         | 409 "Username/Email already exists" |
| `23503`         | Foreign Key Violation | ✅ Auto-detected         | 404 "Related resource not found"    |
| `23502`         | Not Null Violation    | ✅ Auto-detected         | 400 "Required field missing"        |
| `08000`/`08006` | Connection Error      | ✅ Auto-detected + Retry | 503 "Database connection failed"    |

## How Errors Are Caught

### 1. Database Constraint Violation (Recommended Approach)

**✅ Best Practice:** Let the database constraint handle validation

```typescript
// ❌ DON'T: Manual check before insert/update
const existing = await db.select().from(users).where(eq(users.username, username));
if (existing.length > 0) {
 throw new AppError("Username taken", 409);
}
await db.update(users).set({ username }).where(eq(users.id, userId));

// ✅ DO: Let database constraint + error handler work
try {
 await db.update(users).set({ username }).where(eq(users.id, userId));
} catch (error) {
 return handleError(error); // Automatically returns 409 for duplicates
}
```

**Why this is better:**

- Prevents race conditions (two requests checking simultaneously)
- Single database query instead of two (SELECT + UPDATE)
- More efficient in serverless environments
- Database constraints are the source of truth

### 2. Error Structure from Drizzle/Neon

When a database error occurs, you'll receive an object like:

```typescript
{
  code: "23505",           // Postgres error code
  detail: "Key (username)=(john) already exists.",
  constraint: "user_username_unique",
  table: "user",
  column: "username"
}
```

### 3. How `handleError()` Processes This

```typescript
// In error-handler.ts
case PG_ERROR_CODES.UNIQUE_VIOLATION: {
  const constraint = dbError.constraint?.toLowerCase() || "";

  if (constraint.includes("username")) {
    return NextResponse.json(
      { error: "This username is already taken", field: "username" },
      { status: 409 }
    );
  }
}
```

## Usage Patterns

### Pattern 1: Basic Usage (Most Common)

```typescript
import { handleError } from "@/lib/error-handler";

export async function POST(request: Request) {
 try {
  await db.update(users).set({ username }).where(eq(users.id, userId));
  return NextResponse.json({ success: true });
 } catch (error) {
  return handleError(error); // Handles all errors automatically
 }
}
```

### Pattern 2: Custom Logic Before Error Handler

```typescript
import { handleError, isUniqueViolation } from "@/lib/db-utils";

export async function POST(request: Request) {
 try {
  await db.insert(users).values({ username, email });
  return NextResponse.json({ success: true });
 } catch (error) {
  // Add custom logging or side effects
  if (isUniqueViolation(error)) {
   logger.info("User attempted duplicate username", { username });
  }

  return handleError(error); // Still use global handler
 }
}
```

### Pattern 3: With Retry Logic (Connection Errors)

```typescript
import { withRetry } from "@/lib/db-utils";

export async function POST(request: Request) {
 try {
  await withRetry(() => db.update(users).set({ username }).where(eq(users.id, userId)), {
   maxRetries: 2,
   context: { userId },
  });
  return NextResponse.json({ success: true });
 } catch (error) {
  return handleError(error);
 }
}
```

### Pattern 4: Transactions

```typescript
import { executeTransaction } from "@/lib/db-utils";

export async function POST(request: Request) {
 try {
  await executeTransaction(async (tx) => {
   await tx.update(users).set({ username }).where(eq(users.id, userId));
   await tx.insert(auditLog).values({ userId, action: "username_change" });
  });
  return NextResponse.json({ success: true });
 } catch (error) {
  // If ANY operation fails, entire transaction rolls back
  return handleError(error);
 }
}
```

## Client-Side Error Handling

When the server returns these errors, handle them on the client:

```typescript
// Frontend code
const response = await fetch("/api/user/me/username", {
 method: "POST",
 body: JSON.stringify({ username }),
});

const data = await response.json();

if (!response.ok) {
 // Error response structure from handleError:
 // { error: "This username is already taken", field: "username" }

 if (response.status === 409) {
  setError("username", { message: data.error });
 } else if (response.status === 503) {
  toast.error("Service temporarily unavailable. Please try again.");
 }
}
```

## Testing Error Handling

```typescript
// Test unique constraint
test("should reject duplicate username", async () => {
 await db.insert(users).values({ username: "john", email: "john@test.com" });

 // This should throw 23505 error
 const result = await updateUsername(userId, "john");
 expect(result.status).toBe(409);
 expect(result.json()).toEqual({ error: "This username is already taken", field: "username" });
});
```

## Best Practices

1. **✅ Always wrap database operations in try-catch**
2. **✅ Use `handleError()` as your catch handler**
3. **✅ Let database constraints validate uniqueness** (don't manually check)
4. **✅ Use transactions for multi-step operations**
5. **✅ Add retry logic only for connection errors**
6. **❌ Don't swallow errors** - always pass to handleError or log
7. **❌ Don't return raw database errors to clients** - use handleError

## Error Response Format

All errors from `handleError()` follow this structure:

```typescript
// Validation error (Zod)
{ error: "Validation failed", details: { username: ["Too short"] } }

// Unique constraint
{ error: "This username is already taken", field: "username" }

// Generic error
{ error: "Internal Server Error" }

// With context (development only)
{ error: "Internal Server Error", details: "Connection timeout" }
```
