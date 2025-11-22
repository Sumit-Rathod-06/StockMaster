# Frontend-Backend Connection Fix

## Issues Fixed

### 1. **API URL Configuration**
- **Problem**: Frontend was using relative path `/api` which doesn't work with a separate backend server
- **Solution**: Updated `src/api/api.js` to use full backend URL `http://localhost:5000/api`
- **Config**: Added `.env` file with `VITE_API_URL=http://localhost:5000/api`

### 2. **Server Port**
- **Problem**: Server was configured for port 3000, but frontend connects to port 5000
- **Solution**: Updated `server.js` to use port 5000 as default

### 3. **Authentication API Mismatch**
- **Problem**: AuthContext was trying to use wrong field names and endpoints
- **Backend expects**: `loginId`, `emailId` (not `email`)
- **Solution**: Updated `AuthContext.jsx` to match backend API:
  - Login: requires `loginId` and `password`
  - Register: requires `loginId`, `emailId`, `password`, `role`

### 4. **Login Page**
- **Problem**: Form was using `email` field instead of `loginId`
- **Solution**: Updated `Login.jsx` to use `loginId` field

### 5. **Register Page**
- **Problem**: 
  - Form fields didn't match backend API (`name` → `loginId`, `email` → `emailId`)
  - Role values were lowercase (`warehouse_staff` → `WarehouseStaff`)
  - Registration tried to login immediately (backend doesn't return token on register)
- **Solution**: 
  - Updated form fields to match backend
  - Changed role values to match backend enum values
  - Redirect to login after successful registration

## Files Modified

1. **Client/src/api/api.js**
   - Added full backend URL configuration
   - Now supports `VITE_API_URL` env variable

2. **Client/src/context/AuthContext.jsx**
   - Updated login/register to use correct API fields
   - Fixed token and user data handling
   - Improved error handling

3. **Client/src/pages/auth/Login.jsx**
   - Changed `email` field to `loginId`
   - Updated form submission to use correct field names

4. **Client/src/pages/auth/Register.jsx**
   - Changed form fields: `name` → `loginId`, `email` → `emailId`
   - Updated role values: `warehouse_staff` → `WarehouseStaff`
   - Changed post-register redirect from `/` to `/login`

5. **Server/server.js**
   - Changed default port from 3000 to 5000

6. **Client/.env** (new)
   - Added environment variable for backend URL

## How to Run

### Backend
```bash
cd Server
npm run dev
# Runs on http://localhost:5000
```

### Frontend
```bash
cd Client
npm run dev
# Runs on http://localhost:5173 (or next available port)
```

## Testing Login

Use these credentials:
- **Login ID**: Any ID you registered with or test ID (e.g., "101")
- **Password**: Your password
- **Email** (for register): your_email@example.com
- **Role**: InventoryManager, WarehouseStaff, or Admin

## Key Points

✅ Frontend now connects to backend on port 5000
✅ API calls use correct field names matching backend
✅ Authentication flow matches backend implementation
✅ Token is properly stored in localStorage
✅ User data is persisted for session management
✅ Error handling improved with proper error messages
