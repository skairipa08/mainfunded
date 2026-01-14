# Campaign Creation & Login Back Button Fix

## Issues Fixed

### BUG #1: "Start Campaign" page not working
**Problem**: Navbar linked to `/create-campaign` but route didn't exist  
**Solution**: Created canonical `/campaigns/new` route with proper gating

### BUG #2: Browser back button not working after sign in
**Problem**: Auth callback used complex redirect logic that didn't respect `callbackUrl` properly  
**Solution**: Fixed callback handling to prioritize `callbackUrl` and use `router.push()` (not `replace`)

---

## Files Created

1. **`app/campaigns/new/page.tsx`**
   - Server component that checks authentication and verification status
   - Redirects unauthenticated users to `/login?callbackUrl=/campaigns/new`
   - Redirects non-verified users to `/onboarding` with message
   - Allows verified students and admins to proceed

2. **`app/campaigns/new/form-wrapper.tsx`**
   - Client component with campaign creation form
   - Handles form submission to `/api/campaigns`
   - Redirects to campaign page on success
   - Shows error messages on failure

3. **`components/ui/textarea.tsx`**
   - TypeScript version of Textarea component (was .jsx)

---

## Files Modified

1. **`components/Navbar.tsx`**
   - Changed "Start Campaign" link from `/create-campaign` → `/campaigns/new`

2. **`components/Footer.tsx`**
   - Changed "Start a Campaign" link from `/create-campaign` → `/campaigns/new`

3. **`app/dashboard/page.tsx`**
   - Changed "Create Campaign" buttons from `/onboarding` → `/campaigns/new`

4. **`app/login/page-wrapper.tsx`**
   - Changed default `callbackUrl` from `/admin` → `/dashboard`
   - Now properly uses `callbackUrl` from search params

5. **`app/auth/callback/page-wrapper.tsx`**
   - **FIXED**: Now checks for `callbackUrl` FIRST before determining redirect
   - Uses `router.push()` (not `replace`) to preserve browser history
   - Properly handles all redirect cases with `setChecking(false)` in all paths

6. **`app/onboarding/page.tsx`**
   - Now accepts `message` query param to show context
   - Redirects to login with callbackUrl if not authenticated

---

## Route Gating Logic

### `/campaigns/new` Access Control:

1. **Not authenticated** → Redirect to `/login?callbackUrl=/campaigns/new`
2. **Authenticated but no student profile** → Redirect to `/onboarding?message=Create a student profile to start a campaign`
3. **Authenticated but not verified** → Redirect to `/onboarding?message=Verify your student profile to start a campaign`
4. **Verified student OR admin** → Show campaign creation form

---

## Login & Redirect Flow

### Before Fix:
- Login defaulted to `/admin`
- Callback page checked `callbackUrl` AFTER determining redirect
- Used `router.push()` but logic was wrong
- Browser back button didn't work due to redirect loops

### After Fix:
- Login defaults to `/dashboard` (more appropriate)
- Callback page checks `callbackUrl` FIRST
- Uses `router.push()` consistently (preserves history)
- All redirect paths properly set `setChecking(false)`
- Browser back button works correctly

### Redirect Pattern:
```
Protected Page → /login?callbackUrl=/campaigns/new
  ↓
User signs in → NextAuth redirects to /auth/callback?callbackUrl=/campaigns/new
  ↓
Callback page checks callbackUrl FIRST → router.push('/campaigns/new')
  ↓
User lands on intended page, browser back works
```

---

## Navigation Updates

All "Start Campaign" links now point to `/campaigns/new`:
- ✅ Navbar "Start Campaign" button
- ✅ Footer "Start a Campaign" link
- ✅ Dashboard "Create Campaign" button
- ✅ Dashboard "Create Your First Campaign" button

---

## Build Status

✅ `npm run build` passes  
✅ No TypeScript errors  
✅ No linter errors  
✅ Route `/campaigns/new` builds successfully (3.5 kB, 139 kB total)

---

## Testing Checklist

### Scenario 1: Signed out user
- [x] Click "Start Campaign" → redirects to `/login?callbackUrl=/campaigns/new`
- [x] After login → returns to `/campaigns/new`
- [x] Browser back button works (goes to previous page, not stuck)

### Scenario 2: Signed in, not verified
- [x] Visit `/campaigns/new` → redirects to `/onboarding?message=Verify your student profile...`
- [x] Message displays on onboarding page

### Scenario 3: Signed in, verified student
- [x] Visit `/campaigns/new` → form loads
- [x] Create draft campaign → redirects to `/campaign/[id]`
- [x] API call succeeds

### Scenario 4: Signed in, admin
- [x] Visit `/campaigns/new` → form loads (admin bypass)
- [x] Can create campaigns

---

## Redirect Methods Used

- **`router.push()`**: Used everywhere (preserves browser history)
- **`redirect()`**: Used in server components (Next.js 14 App Router)
- **NO `router.replace()`**: Avoided to preserve history

---

## Final Canonical Route

**Start Campaign**: `/campaigns/new`  
**Page File**: `app/campaigns/new/page.tsx`  
**Form Component**: `app/campaigns/new/form-wrapper.tsx`

---

## Production Readiness

✅ Start Campaign flow works end-to-end  
✅ Correct gating for all user states  
✅ Login redirects preserve browser history  
✅ Back button works after sign in  
✅ All links updated to canonical route
