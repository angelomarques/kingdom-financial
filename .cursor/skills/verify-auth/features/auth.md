# Auth Feature Map

## User Stories & Flow Map

### 1. Sign Up Flow
- **Entry**: `/sign-up`
- **Trigger**: Form submission with name, email, password (>= 8 chars)
- **API**: Server Action `signUpAction` -> Better Auth `signUpEmail`
- **Data**: Inserts into `user`, `account`, and `session` tables in D1 / fallback store
- **Outcome**: Sets session cookie and redirects to `/session`
- **Render**: Session card displays user name, email, session token preview, and active status badge

### 2. Sign In Flow
- **Entry**: `/sign-in`
- **Trigger**: Form submission with email and password
- **API**: Server Action `signInAction` -> Better Auth `signInEmail`
- **Data**: Validates credentials in `account` / `user` tables and creates new `session`
- **Outcome**: Sets session cookie and redirects to `/session`
- **Render**: Session card displays authenticated state

### 3. Session Overview & Sign Out
- **Entry**: `/session`
- **Trigger**: Direct visit or redirect after auth; "Sign out" button trigger
- **Data**: `getSession()` reads headers/cookies to resolve `AuthState` (domain model)
- **Unauthenticated State**: Displays "No active session" card with links to sign in and sign up
- **Authenticated State**: Displays user details, session token, expiration, and Sign out button
- **Sign Out Outcome**: Server Action `signOutAction` revokes session and redirects to `/sign-in`

### 4. Middleware Session Protection
- **Route**: `/session`
- **Protection**: Middleware checks `better-auth.session_token` cookie; unauthenticated direct requests redirect to `/sign-in`
