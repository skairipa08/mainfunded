# FundEd - Smoke Test Runbook

**Purpose**: Manual verification of critical user flows before production deployment.

**Prerequisites**:
- MongoDB running and accessible
- `.env.local` configured with all required variables
- Stripe test mode API keys configured
- Cloudinary configured (optional, for file uploads)
- Resend API key configured (optional, for emails)

---

## Environment Setup

### 1. Start Development Server
```bash
npm run dev
```
**Expected**: Server starts on http://localhost:3000

### 2. Verify Environment
```bash
npm run check:env
npm run doctor
```
**Expected**: All required variables set, MongoDB connection successful

---

## Test Flow 1: Admin Access

### Steps:
1. Navigate to http://localhost:3000/login
2. Sign in with Google OAuth using an email from `ADMIN_EMAILS`
3. **Expected**: Redirected to `/admin` dashboard
4. Verify admin panel loads:
   - Students list visible
   - Campaigns list visible
   - Stats visible

**Failure Points**:
- If redirected to `/onboarding` → Check `ADMIN_EMAILS` env var
- If 403/unauthorized → Check user role in database

---

## Test Flow 2: Student Verification

### Steps:
1. Sign in as a **non-admin** user (email NOT in `ADMIN_EMAILS`)
2. **Expected**: Redirected to `/onboarding` or `/dashboard`
3. Navigate to `/dashboard`
4. **Expected**: See "Not Verified" status
5. Create student profile:
   - Navigate to student profile creation (if UI exists)
   - Or use API: `POST /api/admin/students/profile`
   - Submit: university, field of study, country
6. **Expected**: Profile created with status "pending"
7. As **admin**, navigate to `/admin/students`
8. **Expected**: See new student in pending list
9. Click on student to view details
10. **Expected**: See student information and documents (if uploaded)
11. Click "Verify" button
12. **Expected**: 
    - Student status changes to "verified"
    - Email sent to student (if Resend configured)
    - Student can now create campaigns

**Failure Points**:
- Profile creation fails → Check MongoDB connection
- Admin can't see student → Check admin auth
- Verification fails → Check email in database matches

---

## Test Flow 3: File Upload (Student Documents)

### Steps:
1. As verified student, navigate to profile/document upload
2. Upload a document (PDF or image):
   - Use `POST /api/uploads/document`
   - Include: `file`, `doc_type`
3. **Expected**: 
   - File uploaded to Cloudinary
   - URL returned
   - Document stored in `student_profiles.docs` array
4. As admin, view student profile
5. **Expected**: Documents visible and clickable

**Failure Points**:
- Upload fails → Check Cloudinary credentials
- Document not visible → Check `docs` array in database
- 503 error → Cloudinary not configured (expected if optional)

---

## Test Flow 4: Campaign Creation & Publishing

### Steps:
1. As **verified student**, navigate to campaign creation
2. Create campaign:
   - Title, story, goal amount, category
   - Upload cover image (optional): `POST /api/uploads/image`
   - Use API: `POST /api/campaigns`
3. **Expected**: Campaign created with status "draft"
4. Publish campaign:
   - Use API: `POST /api/campaigns/{id}/publish`
   - Or use admin panel if UI exists
5. **Expected**: 
   - Campaign status changes to "published"
   - Email sent to student (if Resend configured)
   - Campaign visible on `/browse` page

**Failure Points**:
- Creation fails → Check student verification status
- Publish fails → Check campaign ownership
- Not visible on browse → Check campaign status is "published"

---

## Test Flow 5: Donation Flow

### Steps:
1. Navigate to `/browse`
2. **Expected**: See published campaigns
3. Click on a campaign
4. Navigate to `/campaign/{campaign_id}`
5. **Expected**: 
   - Campaign details visible
   - Donation form visible
   - Progress bar shows 0% (if no donations yet)
6. Enter donation amount (e.g., $10)
7. Enter name and email (or leave blank for anonymous)
8. Click "Donate Now"
9. **Expected**: 
   - Redirected to Stripe Checkout
   - Stripe test payment page loads
10. Use Stripe test card: `4242 4242 4242 4242`
    - Expiry: Any future date
    - CVC: Any 3 digits
    - ZIP: Any 5 digits
11. Complete payment
12. **Expected**: 
    - Redirected back to campaign page
    - Campaign `raised_amount` increased
    - `donor_count` increased
    - Donation appears in donor wall
    - Email sent to donor (if Resend configured, not anonymous)

**Failure Points**:
- Checkout fails → Check Stripe API key
- Payment doesn't process → Check webhook configuration
- Amount not updated → Check webhook received and processed

---

## Test Flow 6: Stripe Webhook Verification

### Steps:
1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login to Stripe CLI:
   ```bash
   stripe login
   ```
3. Forward webhooks to local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
4. **Expected**: CLI shows webhook secret (starts with `whsec_`)
5. Update `.env.local` with the webhook secret:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
6. Trigger test event:
   ```bash
   stripe trigger checkout.session.completed
   ```
7. **Expected**: 
   - Webhook received by server
   - Payment processed
   - Donation created in database
   - Campaign amounts updated

**Failure Points**:
- Webhook not received → Check webhook URL and port
- Signature verification fails → Check `STRIPE_WEBHOOK_SECRET` matches CLI output
- Payment not processed → Check webhook route logs

---

## Test Flow 7: Edge Cases

### Test 7.1: Donation to Unpublished Campaign
1. Try to donate to a campaign with status "draft"
2. **Expected**: Error message "This campaign is not currently accepting donations"

### Test 7.2: Invalid Campaign ID
1. Try to access `/campaign/invalid_id`
2. **Expected**: 404 error or "Campaign not found" message

### Test 7.3: Duplicate Verification
1. As admin, try to verify an already-verified student
2. **Expected**: Error "Student is already verified"

### Test 7.4: File Upload Validation
1. Try to upload invalid file type (e.g., .exe)
2. **Expected**: Error "Invalid file type. Please upload a JPEG, PNG image, or PDF document."
3. Try to upload file > 20MB
4. **Expected**: Error "File is too large. Maximum file size is 20MB."

### Test 7.5: User Deletion with Campaigns
1. As admin, try to delete a user who owns campaigns
2. **Expected**: Error "Cannot delete user with existing campaigns. Delete or transfer campaigns first."

---

## Verification Checklist

After completing all flows, verify:

- [ ] All API routes return consistent error format: `{ error: { code, message } }`
- [ ] No console errors in browser
- [ ] No 500 errors in server logs
- [ ] All emails sent (if Resend configured)
- [ ] All file uploads work (if Cloudinary configured)
- [ ] Webhook processing works (if Stripe configured)
- [ ] Database data is consistent (no orphaned records)
- [ ] All pages load without errors
- [ ] Navigation works correctly
- [ ] Authentication redirects work correctly

---

## Known Limitations

1. **Sentry**: Optional - build will succeed without it
2. **Cloudinary**: Optional - file uploads return 503 if not configured
3. **Resend**: Optional - emails fail silently if not configured
4. **Stripe**: Required for donations - test mode keys work

---

## Troubleshooting

### Build Fails
- Check Node.js version (18+)
- Run `npm install --legacy-peer-deps`
- Check for TypeScript errors

### MongoDB Connection Fails
- Verify `MONGO_URL` is correct
- Check MongoDB is running
- Verify network access

### Stripe Webhook Fails
- Verify `STRIPE_WEBHOOK_SECRET` matches Stripe CLI output
- Check webhook URL is accessible
- Verify webhook route uses `runtime = 'nodejs'`

### Authentication Fails
- Verify Google OAuth credentials
- Check `AUTH_SECRET` is set
- Verify `AUTH_URL` matches your domain

---

## Vercel Deployment Testing

### Pre-Deployment Checklist
- [ ] All environment variables set in Vercel Dashboard
- [ ] `AUTH_URL` matches Vercel deployment URL
- [ ] Google OAuth redirect URI configured for production domain
- [ ] Stripe webhook endpoint configured for production domain

### Post-Deployment Verification

#### 1. Verify Environment Variables
```bash
# Test health endpoint (if available)
curl https://your-app.vercel.app/api/health
```

#### 2. Test Google OAuth Redirect
1. Navigate to `https://your-app.vercel.app/login`
2. Click "Sign in with Google"
3. **Expected**: Redirects to Google OAuth, then back to `/auth/callback`
4. **Verify**: URL in Google Cloud Console matches: `https://your-app.vercel.app/api/auth/callback/google`

#### 3. Test Stripe Webhook
1. Create a test donation
2. Check Stripe Dashboard → Webhooks → Your endpoint
3. **Expected**: Events appear in "Recent events"
4. **Verify**: Webhook URL is: `https://your-app.vercel.app/api/stripe/webhook`

#### 4. Verify MongoDB Connection
- Test any authenticated route (e.g., `/dashboard`)
- **Expected**: No connection errors in Vercel logs

#### 5. Check Build Logs
- Vercel Dashboard → Deployments → Latest → Build Logs
- **Expected**: No errors, only warnings about optional MongoDB deps (acceptable)

---

**Last Updated**: 2024-01-13  
**Status**: Ready for production deployment
