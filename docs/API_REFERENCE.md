# API Documentation

## Base URL

```
http://localhost:3000/api
```

## Table of Contents

- [Root](#root)
- [Health Check](#health-check)
- [Authentication](#authentication)
  - [Sign Up](#sign-up)
  - [Sign In (Email)](#sign-in-email)
  - [Sign In (Username)](#sign-in-username)
  - [Sign Out](#sign-out)
  - [Google OAuth](#google-oauth)
  - [Email Verification](#email-verification)
  - [Send Verification Email](#send-verification-email)
  - [Send Verification OTP](#send-verification-otp)
  - [Reset Password](#reset-password)
- [User](#user)
  - [Get Current User](#get-current-user)
  - [Get User by Identifier](#get-user-by-identifier)
  - [Update Username](#update-username)

---

## Root

### GET `/`

Returns a simple greeting message.

**Method:** `GET`

**Authentication:** Not required

**Request Body:** None

**Response:**

```json
{
  "message": "Hello world!"
}
```

**Status Codes:**

- `200` - Success

---

## Health Check

### GET `/health`

Checks the health status of the server and database connection.

**Method:** `GET`

**Authentication:** Not required

**Request Body:** None

**Response (Healthy):**

```json
{
  "status": "healthy",
  "checks": {
    "database": true,
    "timestamp": "2026-02-01T12:00:00.000Z",
    "uptime": 3600.5
  }
}
```

**Response (Unhealthy):**

```json
{
  "status": "unhealthy",
  "checks": {
    "database": false,
    "timestamp": "2026-02-01T12:00:00.000Z",
    "uptime": 3600.5
  },
  "error": "Connection timeout"
}
```

**Status Codes:**

- `200` - Healthy
- `503` - Unhealthy

---

## Authentication

### Sign Up

#### POST `/auth/sign-up`

Create a new user account with email and password.

**Method:** `POST`

**Authentication:** Not required

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Validation Rules:**

- `name`: String, required, trimmed
- `email`: Valid email format
- `password`: 8-50 characters

**Response (Success):**

```json
{
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "emailVerified": false,
    "createdAt": "2026-02-01T12:00:00.000Z"
  },
  "session": {
    "id": "session_123",
    "token": "...",
    "expiresAt": "2026-03-01T12:00:00.000Z"
  }
}
```

**Error Responses:**

```json
{
  "error": "Validation failed",
  "details": {
    "email": ["Please enter a valid email address"],
    "password": ["Password must be at least 8 characters long"]
  }
}
```

```json
{
  "error": "This email is already registered",
  "field": "email"
}
```

**Status Codes:**

- `200` - Account created successfully
- `400` - Validation error
- `409` - Email already exists

---

### Sign In (Email)

#### POST `/auth/sign-in/email`

Authenticate user with email and password.

**Method:** `POST`

**Authentication:** Not required

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Validation Rules:**

- `email`: Valid email format
- `password`: 8-50 characters

**Response (Success):**

```json
{
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "emailVerified": true
  },
  "session": {
    "id": "session_123",
    "token": "...",
    "expiresAt": "2026-03-01T12:00:00.000Z"
  }
}
```

**Error Response:**

```json
{
  "error": "Invalid credentials"
}
```

**Status Codes:**

- `200` - Authenticated successfully
- `400` - Validation error
- `401` - Invalid credentials

---

### Sign In (Username)

#### POST `/auth/sign-in/username`

Authenticate user with username and password.

**Method:** `POST`

**Authentication:** Not required

**Request Body:**

```json
{
  "username": "johndoe",
  "password": "securePassword123"
}
```

**Validation Rules:**

- `username`: 3-15 characters, lowercase letters, numbers, and underscores only
- `password`: 8-50 characters

**Response (Success):**

```json
{
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com"
  },
  "session": {
    "id": "session_123",
    "token": "...",
    "expiresAt": "2026-03-01T12:00:00.000Z"
  }
}
```

**Error Response:**

```json
{
  "error": "Invalid credentials"
}
```

**Status Codes:**

- `200` - Authenticated successfully
- `400` - Validation error
- `401` - Invalid credentials

---

### Sign Out

#### POST `/auth/sign-out`

Sign out the current user and invalidate the session.

**Method:** `POST`

**Authentication:** Required (Cookie-based)

**Request Body:** None

**Response:**

```json
{
  "message": "Signed out successfully"
}
```

**Status Codes:**

- `200` - Signed out successfully
- `401` - Not authenticated

---

### Google OAuth

#### GET `/auth/google`

Initiate Google OAuth authentication flow.

**Method:** `GET`

**Authentication:** Not required

**Query Parameters:**

- `callbackURL` (optional): URL to redirect after authentication. Default: `http://localhost:3000`

**Request Example:**

```
GET /auth/google?callbackURL=http://localhost:3000/dashboard
```

**Response:**

```json
{
  "data": {
    "url": "https://accounts.google.com/o/oauth2/v2/auth?..."
  }
}
```

**Status Codes:**

- `200` - Redirect URL generated successfully
- `500` - Internal server error

**Usage Flow:**

1. Frontend calls this endpoint
2. Backend returns Google OAuth URL
3. Frontend redirects user to the URL
4. User authenticates with Google
5. Google redirects back to `callbackURL`

---

### Email Verification

#### GET `/auth/verify-email`

Verify user's email address using a token.

**Method:** `GET`

**Authentication:** Not required

**Query Parameters:**

- `token` (required): Email verification token
- `callbackURL` (optional): URL to redirect after verification

**Request Example:**

```
GET /auth/verify-email?token=abc123&callbackURL=http://localhost:3000/dashboard
```

**Response (Success):**

```json
{
  "message": "Email verified successfully"
}
```

**Error Response:**

```json
{
  "error": "Token is required"
}
```

```json
{
  "error": "Failed to verify email"
}
```

**Status Codes:**

- `200` - Email verified successfully
- `400` - Missing token
- `401` - Invalid or expired token

---

### Send Verification Email

#### GET `/auth/send-verification-email`

Send a verification email to the current user's email address.

**Method:** `GET`

**Authentication:** Required (Cookie-based)

**Request Body:** None

**Response (Success):**

```json
{
  "message": "Verification email sent"
}
```

**Error Responses:**

```json
{
  "error": "Unauthorized"
}
```

```json
{
  "error": "Email is already verified"
}
```

**Status Codes:**

- `200` - Email sent successfully
- `400` - Email already verified
- `401` - Not authenticated
- `500` - Failed to send email

---

### Send Verification OTP

#### GET `/auth/send-verification-otp`

Send a one-time password (OTP) for password reset to the user's email.

**Method:** `GET`

**Authentication:** Required (Cookie-based)

**Request Body:** None

**Response (Success):**

```json
{
  "message": "Verification OTP sent"
}
```

**Error Response:**

```json
{
  "error": "Unauthorized"
}
```

```json
{
  "error": "Failed to send verification OTP"
}
```

**Status Codes:**

- `200` - OTP sent successfully
- `401` - Not authenticated
- `500` - Failed to send OTP

**Notes:**

- OTP is sent to the authenticated user's email
- OTP expires in 10 minutes
- OTP is 6 digits

---

### Reset Password

#### POST `/auth/reset-password`

Reset user's password using an OTP code.

**Method:** `POST`

**Authentication:** Required (Cookie-based)

**Request Body:**

```json
{
  "otp": "123456",
  "password": "newSecurePassword123"
}
```

**Validation Rules:**

- `otp`: Exactly 6 digits
- `password`: 8-50 characters

**Response (Success):**

```json
{
  "message": "Password reset successfully"
}
```

**Error Responses:**

```json
{
  "error": "Unauthorized"
}
```

```json
{
  "error": "Validation failed",
  "details": {
    "otp": ["OTP must be exactly 6 digits"],
    "password": ["Password must be at least 8 characters long"]
  }
}
```

```json
{
  "error": "Failed to reset password"
}
```

**Status Codes:**

- `200` - Password reset successfully
- `400` - Validation error or invalid OTP
- `401` - Not authenticated
- `500` - Internal server error

---

## User

### Get Current User

#### GET `/user/me`

Get the currently authenticated user's profile information.

**Method:** `GET`

**Authentication:** Required (Cookie-based)

**Request Body:** None

**Response (Success):**

```json
{
  "data": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "emailVerified": true,
    "username": "johndoe",
    "displayUsername": "JohnDoe",
    "image": "https://example.com/avatar.jpg",
    "createdAt": "2026-01-01T12:00:00.000Z",
    "updatedAt": "2026-02-01T12:00:00.000Z"
  }
}
```

**Error Response:**

```json
{
  "error": "Unauthorized"
}
```

**Status Codes:**

- `200` - Success
- `401` - Not authenticated

---

### Get User by Identifier

#### GET `/user/{identifier}`

Get a user's public profile by their ID or username.

**Method:** `GET`

**Authentication:** Not required

**Path Parameters:**

- `identifier`: User ID or username (with or without @ prefix)

**Request Examples:**

```
GET /user/user_123
GET /user/johndoe
GET /user/@johndoe
```

**Response (Success):**

```json
{
  "data": {
    "id": "user_123",
    "name": "John Doe",
    "username": "johndoe",
    "image": "https://example.com/avatar.jpg",
    "createdAt": "2026-01-01T12:00:00.000Z"
  }
}
```

**Error Responses:**

```json
{
  "error": "Identifier is required"
}
```

```json
{
  "error": "User not found"
}
```

**Status Codes:**

- `200` - User found
- `400` - Missing identifier
- `404` - User not found

**Notes:**

- Only public profile information is returned
- Email and other sensitive data are not included

---

### Update Username

#### POST `/user/me/username`

Update the current user's username.

**Method:** `POST`

**Authentication:** Required (Cookie-based)

**Request Body:**

```json
{
  "username": "newusername"
}
```

**Validation Rules:**

- `username`: 3-15 characters, lowercase letters, numbers, and underscores only

**Response (Success - Changed):**

```json
{
  "message": "Username updated successfully"
}
```

**Response (Success - Same Username):**

```json
{
  "message": "Username is the same as the current one"
}
```

**Error Responses:**

```json
{
  "error": "Unauthorized"
}
```

```json
{
  "error": "Username is required"
}
```

```json
{
  "error": "Validation failed",
  "details": {
    "username": ["Username must be at least 3 characters long"]
  }
}
```

```json
{
  "error": "This username is already taken",
  "field": "username"
}
```

**Status Codes:**

- `200` - Username updated successfully
- `400` - Validation error
- `401` - Not authenticated
- `409` - Username already taken
- `503` - Database connection error (with automatic retry)

**Notes:**

- Username changes are unique across the platform
- The system automatically retries on transient database errors
- Race conditions are handled by database constraints

---

## Error Handling

All API endpoints follow a consistent error response format:

### Standard Error Response

```json
{
  "error": "Error message description",
  "field": "fieldName"  // Optional: specific field that caused the error
}
```

### Validation Error Response

```json
{
  "error": "Validation failed",
  "details": {
    "fieldName": ["Error message 1", "Error message 2"]
  }
}
```

### Common HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| `200` | OK | Request successful |
| `400` | Bad Request | Invalid request data or validation error |
| `401` | Unauthorized | Authentication required or invalid credentials |
| `404` | Not Found | Resource not found |
| `409` | Conflict | Resource already exists (e.g., duplicate email/username) |
| `500` | Internal Server Error | Server error occurred |
| `503` | Service Unavailable | Database or external service unavailable |

### Database Error Codes

The API automatically handles and translates PostgreSQL/Neon errors:

| DB Code | HTTP Status | Response |
|---------|-------------|----------|
| `23505` | `409` | Unique constraint violation (duplicate data) |
| `23503` | `404` | Foreign key violation (related resource not found) |
| `23502` | `400` | Not null violation (required field missing) |
| `08000`/`08006` | `503` | Connection error (with automatic retry) |

---

## Authentication

### Cookie-Based Sessions

The API uses cookie-based session management powered by BetterAuth:

- Session cookies are HTTP-only and secure
- Cookies are automatically sent with requests from the same origin
- No need to manually manage tokens in frontend code

### Authentication Flow

1. **Sign Up/Sign In**: User authenticates via email, username, or Google OAuth
2. **Session Created**: Server sets an HTTP-only cookie with session token
3. **Authenticated Requests**: Cookie is automatically included in subsequent requests
4. **Sign Out**: Cookie is cleared and session invalidated

### Protected Routes

Routes requiring authentication will return `401 Unauthorized` if:

- No session cookie is present
- Session has expired
- Session token is invalid

---

## Rate Limiting

Rate limiting is applied to prevent abuse:

- Limits are applied per IP address
- Rate limit information may be included in response headers
- Exceeded limits result in `429 Too Many Requests`

---

## CORS

The API supports CORS for the following origins:

**Development:**

- `http://localhost:3000` (Web)
- `http://localhost:8081` (Expo)

**Production:**

- Configured via `WEB_FRONTEND_URL` and `EXPO_FRONTEND_URL` environment variables

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- All request/response bodies use JSON format
- Content-Type header should be `application/json` for POST requests
- Passwords are hashed using bcrypt with 8 rounds
- Email verification tokens expire in 10 minutes
- OTP codes expire in 10 minutes
- Session tokens are valid for 30 days (configurable)

---

## Development

### Base URLs

- **Local Development**: `http://localhost:3000/api`
- **Production**: Configure via `BETTER_AUTH_URL` environment variable

### Testing Endpoints

You can test endpoints using:

- cURL
- Postman
- Insomnia
- HTTPie
- Or any HTTP client

### Example cURL Requests

**Sign Up:**

```bash
curl -X POST http://localhost:3000/api/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

**Get Current User:**

```bash
curl -X GET http://localhost:3000/api/user/me \
  --cookie "session=your_session_cookie"
```

**Update Username:**

```bash
curl -X POST http://localhost:3000/api/user/me/username \
  -H "Content-Type: application/json" \
  --cookie "session=your_session_cookie" \
  -d '{"username": "newusername"}'
```

---

## Support

For questions or issues, contact: [monsurcodes@gmail.com](mailto:monsurcodes@gmail.com)
