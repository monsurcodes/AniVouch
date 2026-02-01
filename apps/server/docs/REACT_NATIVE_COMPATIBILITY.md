# React Native/Expo API Compatibility Guide

## Overview

This guide outlines the changes needed to make your authentication APIs compatible with both web and React Native/Expo clients using a unified API approach. The solution implements dual authentication support - cookies for web and Bearer tokens for mobile.

---

## 🎯 Strategy

**Unified API with Dual Authentication:**
- Same endpoints serve both web and mobile clients
- Web clients continue using cookie-based sessions (no breaking changes)
- Mobile clients use Bearer tokens in Authorization header
- Backend detects and supports both authentication methods

---

## 📋 Implementation Steps

### Step 1: Install Bearer Token Plugin

```bash
cd apps/server
pnpm add better-auth  # Make sure you have the latest version with bearer support
```

---

### Step 2: Update Better Auth Configuration

**File:** `apps/server/src/lib/auth/config.ts`

**Changes:**

1. Import bearer plugin at the top:
```typescript
import { bearer } from "better-auth/plugins";
```

2. Add bearer plugin to plugins array:
```typescript
export const auth = betterAuth({
  // ... existing config
  
  plugins: [
    username(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "forget-password") {
          await sendPasswordResetOTP(email, otp);
        }
      },
    }),
    bearer(),  // ADD THIS LINE - enables token-based auth
  ],
});
```

3. Update trustedOrigins to support mobile:
```typescript
trustedOrigins:
  env.NODE_ENV === "production"
    ? [
        env.WEB_FRONTEND_URL!,
        env.EXPO_FRONTEND_URL!,
        env.MOBILE_DEEP_LINK_SCHEME + "://*",  // Allow deep links
      ].filter(Boolean)
    : [
        "http://localhost:3000",
        "exp://localhost:8081",  // Expo development
        "exp://*",  // All Expo development URLs
        env.MOBILE_DEEP_LINK_SCHEME + "://*",
      ],
```

---

### Step 3: Update Environment Variables

**File:** `apps/server/src/lib/config/env.ts`

Add mobile-specific environment variables:

```typescript
const envSchema = z.object({
  DATABASE_URL: z.url(),
  BETTER_AUTH_URL: z.url(),
  WEB_FRONTEND_URL: z.url().optional(),
  EXPO_FRONTEND_URL: z.url().optional(),
  MOBILE_DEEP_LINK_SCHEME: z.string().default("myapp"),  // ADD THIS
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_IOS_CLIENT_ID: z.string().optional(),  // ADD THIS (for iOS OAuth)
  GOOGLE_ANDROID_CLIENT_ID: z.string().optional(),  // ADD THIS (for Android OAuth)
  SMTP_MAIL_USERNAME: z.email(),
  SMTP_MAIL_PASS: z.string().min(1),
  SMTP_SENDER_EMAIL: z.email(),
  ANILIST_GRAPHQL_API: z.url(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});
```

**Add to `.env` file:**
```env
MOBILE_DEEP_LINK_SCHEME=myapp
GOOGLE_IOS_CLIENT_ID=your-ios-client-id
GOOGLE_ANDROID_CLIENT_ID=your-android-client-id
```

---

### Step 4: Update Authentication Helper

**File:** `apps/server/src/lib/auth/helpers.ts`

Replace the entire file with:

```typescript
import { headers } from "next/headers";
import { cache } from "react";

import { auth } from "./config";

export const getCurrentUser = cache(async () => {
  const headersList = await headers();
  
  // Check for Bearer token first (mobile clients)
  const authHeader = headersList.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const response = await auth.api.verifySession({
      headers: { authorization: authHeader },
    });
    
    if (response) {
      return { session: response.session, user: response.user };
    }
  }
  
  // Fallback to cookie-based session (web clients)
  const response = await auth.api.getSession({
    headers: headersList,
  });

  if (!response) {
    return { session: null, user: null };
  }

  return { session: response.session, user: response.user };
});
```

**What this does:**
- Checks for Authorization header with Bearer token (mobile)
- Falls back to cookie-based session (web)
- Returns null if neither authentication method succeeds

---

### Step 5: Update Sign In Endpoints

Update all sign-in/sign-up endpoints to return token in response body.

#### A. Email Sign In

**File:** `apps/server/src/app/api/auth/sign-in/email/route.ts`

Replace with:

```typescript
import { NextResponse } from "next/server";
import { emailSignInSchema } from "@repo/types/src/schemas/authValidation";

import { auth } from "@/lib/auth";
import { handleError } from "@/lib/utils";

export async function POST(request: Request) {
  const body = await request.json();

  const result = emailSignInSchema.safeParse(body);

  if (!result.success) {
    return handleError(result.error);
  }

  const { email, password } = result.data;

  try {
    const response = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
      asResponse: true,
    });
    
    // Extract response data
    const data = await response.json();
    
    // Get the token for mobile clients
    const token = data.session?.token || data.token;
    
    // Return response with token in body + Set-Cookie header for web
    return new NextResponse(
      JSON.stringify({
        user: data.user,
        session: data.session,
        token: token,  // Mobile clients use this
      }),
      {
        status: response.status,
        headers: response.headers,  // Preserves Set-Cookie for web
      }
    );
  } catch (error) {
    return handleError(error);
  }
}
```

#### B. Username Sign In

**File:** `apps/server/src/app/api/auth/sign-in/username/route.ts`

Apply same pattern as email sign-in above.

#### C. Sign Up

**File:** `apps/server/src/app/api/auth/sign-up/route.ts`

Apply same pattern - return token in response body.

---

### Step 6: Add Client Detection Utility (Optional)

**New File:** `apps/server/src/lib/utils/client-detection.ts`

```typescript
/**
 * Detects whether the request is from a web or mobile client
 */
export function getClientType(headers: Headers): "web" | "mobile" {
  const userAgent = headers.get("user-agent") || "";
  const clientType = headers.get("x-client-type");
  
  // Explicit client type header
  if (clientType === "mobile") {
    return "mobile";
  }
  
  // Detect React Native/Expo clients
  if (
    userAgent.includes("Expo") ||
    userAgent.includes("ReactNative") ||
    userAgent.includes("okhttp")  // Android
  ) {
    return "mobile";
  }
  
  return "web";
}

/**
 * Checks if request is from mobile client
 */
export function isMobileClient(headers: Headers): boolean {
  return getClientType(headers) === "mobile";
}
```

Add to barrel export in `apps/server/src/lib/utils/index.ts`:
```typescript
export * from "./client-detection";
```

---

### Step 7: Add Mobile OAuth Endpoint

**New File:** `apps/server/src/app/api/auth/google/mobile/route.ts`

```typescript
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { handleError, AppError } from "@/lib/utils";

/**
 * Mobile OAuth endpoint
 * Accepts Google ID token from expo-auth-session
 * Returns JWT token for mobile app
 */
export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();
    
    if (!idToken) {
      return handleError(new AppError("idToken required", 400));
    }
    
    // Verify Google ID token and create session
    const response = await auth.api.verifyIdToken({
      body: {
        provider: "google",
        idToken: idToken,
      },
      asResponse: true,
    });
    
    const data = await response.json();
    
    return NextResponse.json({
      user: data.user,
      token: data.session?.token || data.token,
      session: data.session,
    });
  } catch (error) {
    return handleError(error);
  }
}
```

---

### Step 8: Add Token Refresh Endpoint

**New File:** `apps/server/src/app/api/auth/refresh/route.ts`

```typescript
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { handleError, AppError } from "@/lib/utils";

/**
 * Refresh token endpoint for mobile clients
 * Exchanges refresh token for new access token
 */
export async function POST(request: Request) {
  try {
    const { refreshToken } = await request.json();
    
    if (!refreshToken) {
      return handleError(new AppError("Refresh token required", 400));
    }
    
    const response = await auth.api.refreshSession({
      body: { refreshToken },
      asResponse: true,
    });
    
    const data = await response.json();
    
    return NextResponse.json({
      token: data.session?.token || data.token,
      expiresAt: data.session?.expiresAt,
      session: data.session,
    });
  } catch (error) {
    return handleError(error);
  }
}
```

---

### Step 9: Update Google OAuth Endpoint (Optional)

**File:** `apps/server/src/app/api/auth/google/route.ts`

Add client type detection:

```typescript
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { handleError } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const callbackURL = searchParams.get("callbackURL") || "http://localhost:3000";
    const clientType = searchParams.get("clientType") || "web";
    
    const authResponse = await auth.api.signInSocial({
      body: {
        provider: "google",
        callbackURL: callbackURL,
      },
      asResponse: true,
    });

    const redirectUrl = authResponse.headers.get("location");
    
    return NextResponse.json({
      data: { 
        url: redirectUrl,
        // Mobile clients should use /api/auth/google/mobile instead
        note: clientType === "mobile" ? "Use /api/auth/google/mobile endpoint" : undefined,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
```

---

## 📱 React Native/Expo Client Implementation

### Installation

```bash
npx expo install expo-secure-store expo-auth-session expo-web-browser
```

### Auth Client Setup

**File:** `apps/mobile/src/lib/auth-client.ts`

```typescript
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

// Token storage
async function storeToken(token: string) {
  await SecureStore.setItemAsync('auth_token', token);
}

async function getToken() {
  return await SecureStore.getItemAsync('auth_token');
}

async function removeToken() {
  await SecureStore.deleteItemAsync('auth_token');
}

// Sign up
export async function signUp(name: string, email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/sign-up`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Type': 'mobile',
    },
    body: JSON.stringify({ name, email, password }),
  });
  
  const data = await response.json();
  
  if (data.token) {
    await storeToken(data.token);
  }
  
  return data;
}

// Sign in with email
export async function signInWithEmail(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/sign-in/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Type': 'mobile',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  
  if (data.token) {
    await storeToken(data.token);
  }
  
  return data;
}

// Sign in with username
export async function signInWithUsername(username: string, password: string) {
  const response = await fetch(`${API_URL}/auth/sign-in/username`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Type': 'mobile',
    },
    body: JSON.stringify({ username, password }),
  });
  
  const data = await response.json();
  
  if (data.token) {
    await storeToken(data.token);
  }
  
  return data;
}

// Sign out
export async function signOut() {
  await removeToken();
}

// Authenticated fetch wrapper
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = await getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  // Handle 401 - token expired
  if (response.status === 401) {
    await removeToken();
    throw new Error('Session expired');
  }
  
  return response;
}

// Get current user
export async function getCurrentUser() {
  const response = await fetchWithAuth('/user/me');
  return await response.json();
}

// Refresh token
export async function refreshToken(refreshToken: string) {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });
  
  const data = await response.json();
  
  if (data.token) {
    await storeToken(data.token);
  }
  
  return data;
}
```

### Google OAuth Setup

**File:** `apps/mobile/src/lib/google-auth.ts`

```typescript
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';

WebBrowser.maybeCompleteAuthSession();

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  async function signInWithGoogle() {
    const result = await promptAsync();
    
    if (result.type === 'success') {
      const { id_token } = result.params;
      
      // Send idToken to your server
      const apiResponse = await fetch(`${API_URL}/auth/google/mobile`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Client-Type': 'mobile',
        },
        body: JSON.stringify({ idToken: id_token }),
      });
      
      const data = await apiResponse.json();
      
      if (data.token) {
        await SecureStore.setItemAsync('auth_token', data.token);
      }
      
      return data;
    }
    
    return null;
  }

  return {
    request,
    response,
    signInWithGoogle,
  };
}
```

### Usage Example

```typescript
// In your React Native component
import { signInWithEmail, getCurrentUser, fetchWithAuth } from './lib/auth-client';
import { useGoogleAuth } from './lib/google-auth';

function LoginScreen() {
  const { signInWithGoogle } = useGoogleAuth();

  async function handleEmailLogin() {
    try {
      const result = await signInWithEmail('user@example.com', 'password');
      console.log('Logged in:', result.user);
      
      // Fetch user data
      const userData = await getCurrentUser();
      console.log('User data:', userData);
    } catch (error) {
      console.error('Login failed:', error);
    }
  }

  async function handleGoogleLogin() {
    try {
      const result = await signInWithGoogle();
      console.log('Google login:', result);
    } catch (error) {
      console.error('Google login failed:', error);
    }
  }

  // Make authenticated API calls
  async function searchAnime(query: string) {
    const response = await fetchWithAuth('/anime/search', {
      method: 'POST',
      body: JSON.stringify({ search: query, sort: 'SCORE_DESC' }),
    });
    
    return await response.json();
  }

  return (
    // Your UI here
  );
}
```

---

## 🔧 Configuration Files

### Expo App Configuration

**File:** `apps/mobile/app.json`

```json
{
  "expo": {
    "name": "AniVouch",
    "slug": "anivouch",
    "scheme": "myapp",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "bundleIdentifier": "com.yourcompany.anivouch",
      "supportsTablet": true
    },
    "android": {
      "package": "com.yourcompany.anivouch",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

### Environment Variables

**File:** `apps/mobile/.env`

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id
```

---

## ✅ Testing Checklist

### Backend Testing

- [ ] Install bearer plugin and verify auth config
- [ ] Test sign-in endpoints return both cookies AND tokens
- [ ] Test `getCurrentUser()` with Bearer token in header
- [ ] Test `getCurrentUser()` with cookies (web flow)
- [ ] Test mobile OAuth endpoint accepts idToken
- [ ] Test refresh token endpoint
- [ ] Verify CORS allows Expo origins
- [ ] Test with web client - ensure no breaking changes

### Mobile Client Testing

- [ ] Sign up with email returns token
- [ ] Sign in with email returns token
- [ ] Sign in with username returns token
- [ ] Token is stored securely in SecureStore
- [ ] Authenticated requests include Bearer token
- [ ] getCurrentUser works with Bearer token
- [ ] Google OAuth flow works end-to-end
- [ ] Token refresh works when expired
- [ ] Sign out removes token from storage

---

## 🔒 Security Considerations

1. **Token Storage**
   - Always use `expo-secure-store` for tokens
   - Never use `AsyncStorage` for sensitive data
   - Tokens are encrypted at rest on device

2. **Token Expiry**
   - Implement refresh token logic
   - Typical: 7-day access token, 30-day refresh token
   - Automatically refresh before expiry

3. **HTTPS Only**
   - Always use HTTPS in production
   - Never send tokens over HTTP
   - Configure proper SSL certificates

4. **Token Revocation**
   - Store active tokens in database
   - Allow manual token revocation
   - Invalidate on password change

5. **Rate Limiting**
   - Already configured in your error handler ✅
   - Monitor failed authentication attempts
   - Implement account lockout if needed

---

## 📊 API Compatibility Matrix

| Feature | Web (Current) | React Native (After Changes) |
|---------|--------------|----------------------------|
| Sign Up Email | ✅ Works (cookies) | ✅ Works (Bearer token) |
| Sign In Email | ✅ Works (cookies) | ✅ Works (Bearer token) |
| Sign In Username | ✅ Works (cookies) | ✅ Works (Bearer token) |
| Google OAuth | ✅ Works (redirect) | ✅ Works (idToken) |
| Get Current User | ✅ Works (cookies) | ✅ Works (Bearer token) |
| Email Verification | ✅ Works | ✅ Works (deep links) |
| Password Reset | ✅ Works | ✅ Works (deep links) |
| Anime Search | ✅ Works | ✅ Works |
| Health Check | ✅ Works | ✅ Works |
| User Profile | ✅ Works (cookies) | ✅ Works (Bearer token) |

---

## 🚀 Deployment Notes

### Environment Variables to Add

**Production `.env`:**
```env
MOBILE_DEEP_LINK_SCHEME=myapp
EXPO_FRONTEND_URL=myapp://
GOOGLE_IOS_CLIENT_ID=your-production-ios-client-id
GOOGLE_ANDROID_CLIENT_ID=your-production-android-client-id
```

### Deep Link Configuration

1. Register custom URL scheme in app stores
2. Configure deep link handling in Expo
3. Update trustedOrigins in Better Auth
4. Test deep links on physical devices

---

## 📚 Resources

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Expo Auth Session](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Expo Secure Store](https://docs.expo.dev/versions/latest/sdk/securestore/)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)

---

## ❓ Troubleshooting

### "Token verification failed"
- Check Better Auth bearer plugin is installed
- Verify token format: `Bearer <token>`
- Ensure token hasn't expired

### "CORS error from Expo"
- Add Expo origin to trustedOrigins
- Check `X-Client-Type` header is sent
- Verify API URL in mobile app

### "Google OAuth not working"
- Verify Google client IDs for iOS/Android
- Check redirect URI matches deep link scheme
- Test on physical device (not simulator)

### "getCurrentUser returns null on mobile"
- Verify Authorization header is sent
- Check token is stored in SecureStore
- Ensure bearer plugin is active

---

## 🎯 Next Steps

1. **Phase 1: Backend Changes** (This document)
   - Install bearer plugin
   - Update auth endpoints
   - Add mobile OAuth
   - Test with Postman/curl

2. **Phase 2: Mobile App Setup**
   - Create Expo app structure
   - Implement auth client
   - Add secure token storage
   - Build login/signup screens

3. **Phase 3: Integration Testing**
   - Test full auth flows
   - Verify token refresh
   - Test OAuth on devices
   - Performance testing

4. **Phase 4: Production Deploy**
   - Configure production OAuth
   - Set up deep links
   - Deploy backend changes
   - Submit apps to stores

---

**Last Updated:** February 1, 2026
