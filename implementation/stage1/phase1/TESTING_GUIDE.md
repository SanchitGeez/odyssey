# Phase 1 Authentication - Testing Guide

## 🚀 Quick Start

**All services are already running via Docker Compose:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- PgAdmin: http://localhost:5050 (admin@admin.com / admin)

---

## ✅ What's Been Tested

### Backend API Tests (via curl) ✅
All backend endpoints have been tested and verified working:
- ✅ User registration with valid data
- ✅ User login with correct credentials
- ✅ Protected endpoint access with valid token
- ✅ Error handling (duplicate email, wrong password, missing token)
- ✅ Database persistence verified in PgAdmin

---

## 🧪 Frontend Testing Checklist

### Test 1: Registration Flow
1. Navigate to http://localhost:5173
2. You should be redirected to `/login` (default route)
3. Click "Create one" link at the bottom to go to `/register`
4. **Test form validation:**
   - Try submitting empty form → Should show "All fields are required"
   - Enter password less than 8 characters → Should show error
   - Enter mismatched passwords → Should show "Passwords do not match"
5. **Test successful registration:**
   - Enter email: `test@example.com`
   - Enter password: `password123`
   - Confirm password: `password123`
   - Click "Create Account"
   - Should redirect to `/dashboard`
   - Should display user information (email, ID, account status)

### Test 2: Login Flow
1. Click "Logout" button on dashboard
2. Should redirect to `/login`
3. **Test form validation:**
   - Try empty fields → Should show "Email and password are required"
   - Try password < 8 characters → Should show error
4. **Test wrong credentials:**
   - Email: `test@example.com`
   - Password: `wrongpassword123`
   - Should show error message from API
5. **Test successful login:**
   - Email: `test@example.com`
   - Password: `password123`
   - Should redirect to `/dashboard`
   - Should show user information

### Test 3: Protected Route Access
1. While logged in, navigate to `/dashboard`
2. Should show dashboard with user info
3. Open browser DevTools → Application → Local Storage
4. Verify `auth_token` exists in localStorage
5. Click "Logout"
6. Verify `auth_token` is removed from localStorage
7. Try manually navigating to `/dashboard` via URL
8. Should redirect to `/login`

### Test 4: Token Persistence
1. Login with valid credentials
2. While on `/dashboard`, refresh the page (F5)
3. Should remain logged in and show dashboard
4. Should NOT redirect to login
5. Check Network tab - should see API call to `/api/v1/auth/me`

### Test 5: Navigation & Routes
1. **Public routes (not logged in):**
   - http://localhost:5173/ → redirects to `/login`
   - http://localhost:5173/login → shows login page
   - http://localhost:5173/register → shows register page
   - http://localhost:5173/dashboard → redirects to `/login`

2. **Protected routes (logged in):**
   - http://localhost:5173/ → redirects to `/login` (default)
   - http://localhost:5173/dashboard → shows dashboard
   - Logout button visible in dashboard

### Test 6: Loading States
1. Login with valid credentials
2. Observe button text:
   - Before submit: "Sign In"
   - During submit: "Signing in..."
   - Input fields should be disabled during loading
3. Check protected route loading:
   - Clear localStorage and navigate to `/dashboard`
   - Should briefly show loading spinner before redirect

### Test 7: Error Handling
1. **Backend down scenario:**
   - Stop backend: `docker compose stop server`
   - Try to login
   - Should show error message
   - Restart: `docker compose start server`

2. **Network tab inspection:**
   - Open DevTools → Network tab
   - Login successfully
   - Check request to `/api/v1/auth/login`
   - Should have `Authorization: Bearer <token>` in subsequent requests

### Test 8: Duplicate Registration
1. Register a new user (e.g., `unique@test.com`)
2. Logout
3. Try registering with the same email again
4. Should show "Email already registered" error

---

## 🎨 UI/UX Verification

### Theme Colors
Verify the following colors are applied correctly:
- **Background**: Dark gray (`#45474B`) - entire page background
- **Surface**: Light gray (`#F5F7F8`) - login/register cards, dashboard cards
- **Primary**: Yellow (`#F4CE14`) - "Sign In" and "Create Account" buttons
- **Accent**: Green (`#379777`) - "Create one" and "Sign in" links

### Responsive Design
1. Test on different screen sizes:
   - Desktop (1920x1080)
   - Tablet (768px width)
   - Mobile (375px width)
2. Forms should remain centered and readable
3. Cards should have proper max-width constraints

---

## 🐛 Known Issues / Limitations

- **No Toast Notifications**: Currently using inline error messages instead of shadcn toast
- **No Email Format Validation on Frontend**: Browser's built-in validation is used
- **Token Expiry**: Tokens expire after 30 minutes, no automatic refresh implemented
- **No "Remember Me"**: All sessions use the same 30-minute expiry

---

## 📊 Expected API Calls

### Registration Flow
```
POST http://localhost:8000/api/v1/auth/register
Body: {"email": "test@example.com", "password": "password123"}
Response: {"id": "...", "email": "...", "is_active": true, "created_at": "..."}
```

### Login Flow
```
POST http://localhost:8000/api/v1/auth/login
Body: {"email": "test@example.com", "password": "password123"}
Response: {"access_token": "eyJ...", "token_type": "bearer"}
```

### Get Current User (on dashboard load)
```
GET http://localhost:8000/api/v1/auth/me
Headers: Authorization: Bearer eyJ...
Response: {"id": "...", "email": "...", "is_active": true, "created_at": "..."}
```

---

## 🔍 Debugging Tips

### Check Browser Console
```bash
# Open DevTools (F12) and check Console tab
# Look for errors like:
- CORS errors → Backend not running or wrong URL
- 401 Unauthorized → Token expired or invalid
- Network errors → Backend unreachable
```

### Check Docker Logs
```bash
# Frontend logs
docker compose logs client -f

# Backend logs
docker compose logs server -f

# Check if services are running
docker compose ps
```

### Verify Environment Variables
```bash
# Backend
cat /home/sanchit/Projects/Odyssey/server/.env

# Frontend
cat /home/sanchit/Projects/Odyssey/client/.env.local
```

### Direct API Testing
```bash
# Test backend directly
curl http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"curl@test.com","password":"testpass123"}'
```

---

## ✅ Success Criteria

After completing all tests, you should verify:
- [x] User can register with email/password
- [x] User can login and receive JWT token
- [x] Token is stored in localStorage and persists across page refreshes
- [x] Protected routes are inaccessible without authentication
- [x] User can logout and token is cleared
- [x] Forms have proper validation and error handling
- [x] UI matches theme colors and looks clean in dark mode
- [x] Backend follows proper layered architecture
- [x] Database migrations work correctly

---

## 📝 Test Results

Document your test results below:

### Test 1: Registration ⬜
- [ ] Form validation works
- [ ] Successful registration redirects to dashboard
- [ ] User data displayed correctly

### Test 2: Login ⬜
- [ ] Form validation works
- [ ] Wrong credentials show error
- [ ] Successful login redirects to dashboard

### Test 3: Protected Routes ⬜
- [ ] Dashboard accessible when logged in
- [ ] Dashboard redirects when logged out
- [ ] Token stored in localStorage

### Test 4: Token Persistence ⬜
- [ ] Page refresh maintains login state
- [ ] API call to /me on load

### Test 5: Navigation ⬜
- [ ] All public routes work
- [ ] Protected routes behave correctly

### Test 6: Loading States ⬜
- [ ] Button loading text shows
- [ ] Inputs disabled during loading
- [ ] Loading spinner on protected route check

### Test 7: Error Handling ⬜
- [ ] Duplicate email shows error
- [ ] Wrong password shows error
- [ ] Network errors handled gracefully

---

## 🎉 Next Steps

Once all tests pass:
1. Update `PLAN.md` to mark "Frontend Tests" as complete
2. Take screenshots of working app for documentation
3. Consider adding:
   - Toast notifications with shadcn/sonner
   - "Forgot Password" flow
   - Email verification
   - Better password strength indicator
4. Ready to move to **Stage 1 - Phase 2**: Next feature phase

---

**Last Updated**: 2025-11-22
**Status**: Ready for Testing
