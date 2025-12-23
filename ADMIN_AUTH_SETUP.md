# Admin Authentication Setup Guide

## ✅ Implementation Complete

Role-based JWT authentication has been implemented for admin access.

## 🔧 What Changed

### Backend Changes:

1. **JWT Utilities** (`src/utils/jwt.ts`)
   - Token generation (access & refresh tokens)
   - Token verification

2. **Authentication Middleware** (`src/middleware/auth.middleware.ts`)
   - `authenticate` - Verifies JWT tokens
   - `requireAdmin` - Verifies token AND admin role

3. **Auth Routes** (`src/routes/auth.routes.ts`)
   - `POST /api/auth/admin/login` - Admin login endpoint
   - `POST /api/auth/admin/refresh` - Refresh access token

4. **Protected Admin Routes**
   - All `/api/admin/*` routes now require valid admin JWT token
   - Admin middleware checks both authentication AND role

### Frontend Changes:

1. **Admin Login** (`pages/admin/AdminLogin.tsx`)
   - Now calls `/api/auth/admin/login` API
   - Stores `adminAccessToken` and `adminRefreshToken` in localStorage

2. **Admin Dashboard** (`pages/admin/AdminDashboard.tsx`)
   - Uses JWT tokens in Authorization header for all API calls
   - Proper logout removes both tokens

3. **Admin API Client** (`services/adminApi.ts`)
   - Axios instance with automatic token injection
   - Automatic token refresh on 401 errors

## 🚀 Setup Instructions

### Step 1: Create Admin User

You need to create an admin user in the database. Run the script:

```bash
cd lost-and-found-lk-backend-node
npx ts-node scripts/createAdminUser.ts
```

Or manually create via MongoDB:
- Email: `admin@traceback.com`
- Password: Will be hashed using bcrypt
- Roles: `["ADMIN", "USER"]`

**Default credentials** (will be set by script):
- Email: `admin@traceback.com`
- Password: `Thejanaadmin2003@`

### Step 2: Environment Variables

Make sure these are set in your backend:

```env
JWT_SECRET=your-secret-key-here
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d
```

### Step 3: Test Admin Login

1. Go to `/admin/login`
2. Login with admin credentials
3. You'll be redirected to `/admin/dashboard`
4. All API calls will include JWT token automatically

## 🔐 How It Works

### Login Flow:
```
1. Admin enters email/password
2. Frontend → POST /api/auth/admin/login
3. Backend verifies credentials & checks ADMIN role
4. Backend generates accessToken + refreshToken
5. Frontend stores tokens in localStorage
6. All subsequent requests include: Authorization: Bearer <token>
```

### Request Flow:
```
1. Frontend makes request with Authorization header
2. Backend requireAdmin middleware verifies token
3. Middleware checks if user has "ADMIN" role
4. Request proceeds if valid, 401/403 if not
```

### Token Refresh:
```
1. Access token expires (15 minutes)
2. Frontend receives 401 error
3. Automatically calls /api/auth/admin/refresh with refreshToken
4. Gets new accessToken
5. Retries original request
```

## 🔒 Security Features

✅ **JWT-based authentication** - Secure token system
✅ **Role-based access control** - Only ADMIN role can access
✅ **Password hashing** - bcrypt (10 rounds)
✅ **Token expiration** - Access tokens expire in 15 minutes
✅ **Refresh tokens** - Long-lived (7 days) for seamless UX
✅ **Protected routes** - All admin endpoints require authentication
✅ **Automatic logout** - On token expiration/refresh failure

## 🛡️ Protection Status

**Protected Routes:**
- ✅ `GET /api/admin/stats`
- ✅ `GET /api/admin/users`
- ✅ `PUT /api/admin/users/:id/block`
- ✅ `DELETE /api/admin/users/:id`
- ✅ `PUT /api/admin/posts/:id/hide`
- ✅ `DELETE /api/admin/posts/:id`
- ✅ `POST /api/admin/posts/:id/approve-facebook`

**Unauthorized Access:**
- Returns `401 Unauthorized` if no token
- Returns `403 Forbidden` if not admin role
- Returns `401 Unauthorized` if token expired/invalid

## 📝 Next Steps

1. ✅ Create admin user (run script)
2. ✅ Test login flow
3. ✅ Verify admin routes are protected
4. ⚠️ **Change default password** after first login
5. Consider adding password change endpoint
6. Consider adding admin user management UI

## ⚠️ Important Notes

- **Default password is visible in script** - Change it after first login!
- **JWT_SECRET** must be strong and secret - never commit to git
- **Token storage** - Currently in localStorage (consider httpOnly cookies for production)
- **Admin user creation** - Run script once to create initial admin

## 🐛 Troubleshooting

### "No token provided"
- Make sure you're logged in
- Check localStorage has `adminAccessToken`

### "Invalid or expired token"
- Token expired (15 min) - refresh should happen automatically
- If persists, logout and login again

### "Admin access required"
- User exists but doesn't have ADMIN role
- Run script to add ADMIN role to user

### "Invalid credentials"
- Wrong email/password
- User doesn't exist
- User is blocked

