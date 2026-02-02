# @repo/types

Shared TypeScript types and Zod validation schemas for the AniVouch monorepo. This package provides type-safe contracts that can be used across all applications (web, mobile, server).

## 📦 Installation

This package is already installed as a workspace dependency. To use it in any app:

```json
{
	"dependencies": {
		"@repo/types": "workspace:^"
	}
}
```

## 🎯 Purpose

- **Single Source of Truth**: All shared types defined once
- **Type Safety**: Full TypeScript support across the monorepo
- **Validation**: Zod schemas for runtime validation
- **Cross-Platform**: Works with Next.js, React Native, and any TypeScript project

## 📁 Structure

```
src/
├── index.ts                 # Main export file
├── interfaces/              # TypeScript interfaces
│   ├── auth.ts             # Authentication types
│   ├── api.ts              # API response types
│   ├── search.ts           # Anime/search types
│   └── index.ts
└── schemas/                 # Zod validation schemas
    ├── authValidation.ts   # Auth validation schemas
    ├── anilistValidation.ts # Anime validation schemas
    └── index.ts
```

## 🔧 Usage

### Importing Types

```typescript
// Import specific types
import type { User, SignUpInput, AnimeSearchResult } from "@repo/types";

// Import validation schemas
import { signUpSchema, signInEmailSchema } from "@repo/types";
```

### Authentication Types

```typescript
import type {
	User,
	SignUpInput,
	SignInEmailInput,
	SignInUsernameInput,
	AuthResponse,
	VerificationResponse,
} from "@repo/types";

// User object
const user: User = {
	id: "123",
	email: "user@example.com",
	name: "John Doe",
	username: "johndoe",
	emailVerified: true,
	createdAt: "2024-01-01T00:00:00Z",
	updatedAt: "2024-01-01T00:00:00Z",
};

// Auth response
const response: AuthResponse = {
	user,
	message: "Login successful",
};
```

### Validation Schemas

```typescript
import { signUpSchema, signInEmailSchema } from "@repo/types";
import type { SignUpInput } from "@repo/types";

// Validate data
const data: SignUpInput = {
	name: "John Doe",
	email: "john@example.com",
	password: "SecurePass123",
};

const result = signUpSchema.safeParse(data);

if (result.success) {
	console.log("Valid:", result.data);
} else {
	console.log("Errors:", result.error);
}
```

### With React Hook Form

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, type SignUpInput } from "@repo/types";

const form = useForm<SignUpInput>({
	resolver: zodResolver(signUpSchema),
});
```

### API Types

```typescript
import type {
	ApiResponse,
	PaginatedResponse,
	HealthCheckResponse,
	QueryOptions,
} from "@repo/types";

// Generic API response
const response: ApiResponse<User> = {
	data: user,
	message: "Success",
	status: 200,
};

// Paginated response
const paginatedUsers: PaginatedResponse<User> = {
	data: [user],
	pagination: {
		page: 1,
		limit: 10,
		total: 100,
		totalPages: 10,
	},
};
```

### Anime/Search Types

```typescript
import type { AnimeSearchResult, AnimeStatus, MediaFormat, AnimeTitle } from "@repo/types";

const anime: AnimeSearchResult = {
	id: 1,
	title: {
		romaji: "Naruto",
		english: "Naruto",
		native: "ナルト",
	},
	coverImage: {
		medium: "https://...",
	},
	genres: ["Action", "Adventure"],
	averageScore: 85,
	episodes: 220,
	status: AnimeStatus.FINISHED,
	format: MediaFormat.TV,
	seasonYear: 2002,
};
```

## 📋 Available Types

### Authentication

- `User` - User object
- `SignUpInput` - Sign up form data (from schema)
- `SignInEmailInput` - Email sign in data (from schema)
- `SignInUsernameInput` - Username sign in data (from schema)
- `AuthResponse` - Authentication response
- `VerificationResponse` - Email verification response
- `PasswordResetRequest` - Password reset request

### API

- `ApiResponse<T>` - Generic API response wrapper
- `PaginatedResponse<T>` - Paginated list response
- `HealthCheckResponse` - Health check response
- `QueryOptions` - Common query parameters
- `ApiErrorResponse` - Error response

### Anime/Search

- `AnimeSearchResult` - Anime search result
- `AnimeStatus` - Anime status enum
- `MediaFormat` - Media format enum
- `AnimeTitle` - Anime title in multiple languages
- `AnimeSearchInput` - Search input (from schema)

## 📝 Validation Schemas

### Auth Schemas

```typescript
// Individual validators
emailValidation; // Email validation
usernameValidation; // Username validation (3-15 chars, lowercase, alphanumeric)
passwordValidation; // Password validation (8-50 chars)
otpValidation; // OTP validation (6 digits)

// Complete schemas
signUpSchema; // Sign up: name, email, password
signInEmailSchema; // Email sign in: email, password
signInUsernameSchema; // Username sign in: username, password
passwordResetSchema; // Password reset: otp, password
passwordResetTokenSchema; // Password reset with token
```

### Anime Schemas

```typescript
searchAnimeSchema; // Anime search with query and sort options
```

## 🔄 Type Inference

All input types are automatically inferred from Zod schemas:

```typescript
// These types are generated from schemas
type SignUpInput = z.infer<typeof signUpSchema>;
type SignInEmailInput = z.infer<typeof signInEmailSchema>;
type AnimeSearchInput = z.infer<typeof searchAnimeSchema>;
```

## 🚀 Adding New Types

### 1. Add Interface

```typescript
// src/interfaces/myFeature.ts
export interface MyFeatureData {
	id: string;
	name: string;
}

// Export from src/interfaces/index.ts
export * from "./myFeature";
```

### 2. Add Validation Schema

```typescript
// src/schemas/myFeatureValidation.ts
import * as z from "zod";

export const myFeatureSchema = z.object({
	name: z.string().min(1),
});

export type MyFeatureInput = z.infer<typeof myFeatureSchema>;

// Export from src/schemas/index.ts
export * from "./myFeatureValidation";
```

### 3. Use Across Apps

```typescript
// In any app (web, mobile, server)
import type { MyFeatureData } from "@repo/types";
import { myFeatureSchema, type MyFeatureInput } from "@repo/types";
```

## 🎨 Best Practices

### ✅ Do's

- Define all shared types in this package
- Use Zod schemas for validation
- Export both schemas and inferred types
- Keep types consistent across frontend and backend
- Use type inference from schemas
- Document complex types with JSDoc comments

### ❌ Don'ts

- Don't duplicate type definitions across apps
- Don't define app-specific types here (only shared types)
- Don't export implementation code (only types and schemas)
- Don't break existing types (versioning matters)

## 🔍 Type Guards

```typescript
import { isValidAnimeStatus, isValidMediaFormat } from "@repo/types";

if (isValidAnimeStatus("FINISHED")) {
	// TypeScript knows it's AnimeStatus.FINISHED
}

if (isValidMediaFormat("TV")) {
	// TypeScript knows it's MediaFormat.TV
}
```

## 📚 Examples

### Server Route Handler

```typescript
import { signUpSchema } from "@repo/types";

export async function POST(request: Request) {
	const body = await request.json();
	const result = signUpSchema.safeParse(body);

	if (!result.success) {
		return Response.json({ error: result.error }, { status: 400 });
	}

	// result.data is typed as SignUpInput
	const { name, email, password } = result.data;
	// ... create user
}
```

### Client API Call

```typescript
import type { SignUpInput, User } from "@repo/types";

async function signUp(data: SignUpInput): Promise<User> {
	const response = await fetch("/api/auth/sign-up", {
		method: "POST",
		body: JSON.stringify(data),
	});

	return response.json();
}
```

### React Native Form

```typescript
import { signUpSchema, type SignUpInput } from "@repo/types";

// Works the same in React Native
const form = useForm<SignUpInput>({
	resolver: zodResolver(signUpSchema),
});
```

## 🔄 Versioning

When making breaking changes:

1. Increment version in `package.json`
2. Update all dependent packages
3. Document breaking changes
4. Consider deprecation warnings

## 🤝 Contributing

When adding new types:

1. Keep types generic and reusable
2. Add JSDoc comments for complex types
3. Export from appropriate index file
4. Update this README with examples
5. Ensure type-checks pass in all apps

## 📞 Support

For issues or questions about types, check:

- `/apps/web/README.md` - Web app type usage
- `/apps/server/docs/` - Server API documentation
- This README for general guidance
