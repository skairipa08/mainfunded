# FundEd - Educational Crowdfunding Platform

FundEd is a self-hostable crowdfunding platform for verified students to raise funds for educational needs. Built with Next.js (App Router), MongoDB, NextAuth.js, and iyzico.

## Features

- 🎓 **Student Verification** - Admin-verified student profiles ensure authenticity
- 💳 **iyzico Payments** - Secure donation processing with callback verification
- 🔐 **Google OAuth** - NextAuth.js with Google provider
- 📊 **Admin Dashboard** - Verify students, manage users, view statistics
- 🌍 **Campaign Filters** - Browse by category, country, field of study
- 💝 **Donor Wall** - Public recognition with anonymous option
- 📁 **File Uploads** - Cloudinary integration for images and documents
- 🔒 **Security** - Rate limiting, CORS protection, input validation

## Tech Stack

- **Frontend & Backend**: Next.js 14 (App Router)
- **Database**: MongoDB
- **Authentication**: NextAuth.js v5 (Google OAuth, database sessions)
- **Payments**: iyzico (with callback verification)
- **Storage**: Cloudinary
- **Deployment**: Vercel (recommended) 

---

## Quick Start

### Prerequisites

- Node.js 18+ with npm/yarn
- MongoDB (local or MongoDB Atlas)
- Google Cloud Console account (for OAuth)
- iyzico account (for payments)
- Cloudinary account (for file uploads - optional)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/skairipa08/FundEd.git
   cd FundEd
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**
   
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables (see Environment Variables section below).

4. **Run development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000)

5. **Build for production**
   ```bash
   npm run build
   npm start
   # or
   yarn build
   yarn start
   ```

---

## Run Locally (Development Setup)

This guide will help you set up the FundEd project for local development, including the Admin Panel with NextAuth, MongoDB, Google OAuth, and iyzico payment testing.

### Prerequisites

- **Node.js 18+** (with npm) - [Download Node.js](https://nodejs.org/)
- **MongoDB** - Local installation or MongoDB Atlas account
- **Google Cloud Console account** - For OAuth setup
- **iyzico account** - For payment testing (sandbox mode)


### Step-by-Step Setup

#### 1. Install Dependencies

```bash
npm install
```

#### 2. Copy Environment Variables

**macOS/Linux:**
```bash
cp .env.example .env.local
```

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env.local
```

**Windows (Command Prompt):**
```cmd
copy .env.example .env.local
```

#### 3. Fill in Environment Variables

Open `.env.local` and fill in the required values:

**Required Variables:**

- `MONGO_URL` - MongoDB connection string
  - Local: `mongodb://localhost:27017`
  - MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/`
  
- `DB_NAME` - Database name (default: `funded_db`)

- `AUTH_SECRET` - Random secret for NextAuth
  - Generate with: `openssl rand -base64 32`
  - Or use: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

- `AUTH_URL` - Your local URL (usually `http://localhost:3000`)

- `GOOGLE_CLIENT_ID` - From Google Cloud Console (see Google OAuth Setup below)

- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console

- `IYZICO_API_KEY` - iyzico API key (from iyzico merchant panel)

- `IYZICO_SECRET_KEY` - iyzico secret key (from iyzico merchant panel)

- `IYZICO_BASE_URL` - Use `https://sandbox-api.iyzipay.com` for testing, `https://api.iyzipay.com` for production

- `ADMIN_EMAILS` - Comma-separated list of admin email addresses
  - Example: `admin@example.com,admin2@example.com`
  - **Important**: Add your email here to access the admin panel!

**Optional Variables:**

- `CLOUDINARY_*` - For file uploads (can be skipped for basic testing)
- `CORS_ORIGINS` - CORS allowed origins (default: `http://localhost:3000`)

#### 4. Google OAuth Setup

To enable Google OAuth authentication:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Select **Web application**
6. Configure **Authorized JavaScript origins**:
   - Add: `http://localhost:3000`
7. Configure **Authorized redirect URIs**:
   - Add: `http://localhost:3000/api/auth/callback/google`
8. Click **Create**
9. Copy the **Client ID** and **Client Secret** to your `.env.local` file

**Important URLs for local development:**
- Authorized JavaScript origin: `http://localhost:3000`
- Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

#### 5. Run Doctor Script

The doctor script checks your environment setup:

```bash
npm run doctor
```

This will:
- ✅ Check all required environment variables
- ✅ Test MongoDB connection
- ✅ Display database information
- ✅ Show configuration summary
- ✅ Provide next steps

If any checks fail, fix the issues before proceeding.

#### 6. Create Database Indexes

Create the required database indexes:

```bash
npm run db:indexes
```

This creates indexes for optimal query performance. You only need to run this once (or after schema changes).

#### 7. Start Development Server

```bash
npm run dev
```

The server will start at [http://localhost:3000](http://localhost:3000)

#### 8. Test Admin Panel Access

1. **Add your email to ADMIN_EMAILS** in `.env.local` (if not already added)
2. **Restart the dev server** (if you just added ADMIN_EMAILS)
3. **Sign in** at [http://localhost:3000/login](http://localhost:3000/login)
   - Click "Sign in with Google"
   - Use your Google account (must match an email in ADMIN_EMAILS)
4. **Access admin panel** at [http://localhost:3000/admin](http://localhost:3000/admin)

**Note**: The admin panel requires:
- Your email to be in the `ADMIN_EMAILS` environment variable
- You to be signed in with Google OAuth
- The email you sign in with must match an email in `ADMIN_EMAILS`

### iyzico Payment Testing (Local Development)

iyzico sandbox mod kullanılarak yerel test yapılabilir:

1. **iyzico Sandbox hesabı oluşturun**: [sandbox-merchant.iyzipay.com](https://sandbox-merchant.iyzipay.com) adresinden kayıt olun

2. **API anahtarlarını alın**: Merchant panelinizden API Key ve Secret Key değerlerini kopyalayın

3. **.env.local dosyanızı güncelleyin**:
   ```env
   IYZICO_API_KEY=your_sandbox_api_key
   IYZICO_SECRET_KEY=your_sandbox_secret_key
   IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
   ```

4. **Test kart bilgileri** (sandbox):
   - Kart No: `5528790000000008`
   - Son Kullanma: `12/2030`
   - CVV: `123`

**Önemli**: Sandbox modda yapılan ödemeler gerçek para çekmez.

### Useful Scripts

- `npm run doctor` - Run health check (env vars, MongoDB connection, config)
- `npm run check:env` - Check environment variables only
- `npm run db:indexes` - Create database indexes
- `npm run seed:dev` - Seed dev database (admin user, student profile, campaign)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server

### Seed Development Data

To quickly set up test data for local development:

```bash
npm run seed:dev
```

This script (dev-only, won't run in production) will:
- Set the first email from `ADMIN_EMAILS` to admin role
- Create a pending student profile for that user
- Create a published campaign owned by that user

**Note**: The user must have signed in at least once (via `/login`) before running the seed script.

### End-to-End Smoke Test Checklist

Use this checklist to verify the core functionality works end-to-end:

#### 1. Admin Access
- [ ] Add your email to `ADMIN_EMAILS` in `.env.local`
- [ ] Restart dev server (`npm run dev`)
- [ ] Sign in at `/login` with your Google account
- [ ] Navigate to `/admin` - should load admin panel
- [ ] Verify you see admin dashboard with stats

#### 2. Verify Student
- [ ] Navigate to `/admin/students` - should see student list
- [ ] Click on a pending student (or use seed script: `npm run seed:dev`)
- [ ] Click "Verify" button - should show success toast
- [ ] Verify student status changes to "verified"
- [ ] (Optional) Click "Reject" on another student with reason - should show success

#### 3. Create/Publish Campaign
- [ ] Sign in as a verified student (or verify the seeded student)
- [ ] Navigate to campaign creation page
- [ ] Fill in campaign details (title, story, goal amount, etc.)
- [ ] Submit campaign - should create as "draft"
- [ ] Click "Publish" button - should change status to "published"
- [ ] Verify campaign appears in public campaign list (`/campaigns`)

#### 4. Checkout Donation
- [ ] Navigate to a published campaign page
- [ ] Fill in donation form (amount, donor name, email)
- [ ] Click "Donate" button - should redirect to iyzico Checkout
- [ ] Complete payment in iyzico sandbox mode (use test card: `5528790000000008`)
- [ ] Verify redirect to success page
- [ ] Check campaign page - raised amount should increase
- [ ] Check donor count should increment

#### 5. Payment Callback Test Steps
- [ ] Ensure iyzico sandbox API keys are set in `.env.local`
- [ ] Make a test donation through the UI
- [ ] iyzico will redirect to `/api/iyzico/callback` after payment
- [ ] Check dev server logs - should see callback received and processed
- [ ] Verify donation record created in database
- [ ] Verify campaign totals updated

**Troubleshooting Payments:**
- If payment callback fails: Check `IYZICO_API_KEY` and `IYZICO_SECRET_KEY` are set correctly
- If payment form doesn't load: Verify `IYZICO_BASE_URL` is correct (`https://sandbox-api.iyzipay.com` for testing)
- If callback not received: Verify `AUTH_URL` is set correctly for redirect URLs

### Troubleshooting

**MongoDB Connection Issues:**
- Make sure MongoDB is running locally, or
- Check your MongoDB Atlas connection string
- Verify `MONGO_URL` in `.env.local` is correct
- Run `npm run doctor` to test connection

**Google OAuth Issues:**
- Verify redirect URI matches exactly: `http://localhost:3000/api/auth/callback/google`
- Check that JavaScript origin is: `http://localhost:3000`
- Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct

**Admin Panel Access Issues:**
- Make sure your email is in `ADMIN_EMAILS` (comma-separated, no spaces around commas)
- Restart the dev server after changing `ADMIN_EMAILS`
- Sign out and sign in again to refresh your session
- Check browser console for errors

**iyzico Payment Issues:**
- Make sure `IYZICO_API_KEY` and `IYZICO_SECRET_KEY` are set in `.env.local`
- Verify `IYZICO_BASE_URL` is correct (use `https://sandbox-api.iyzipay.com` for testing)
- Check that the callback URL is accessible: `localhost:3000/api/iyzico/callback`

---

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB
MONGO_URL=mongodb://localhost:27017
DB_NAME=funded_db

# NextAuth (required)
AUTH_SECRET=your-secret-key-generate-with-openssl-rand-base64-32
AUTH_URL=http://localhost:3000

# Google OAuth (NextAuth)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# iyzico (ödemeler için gerekli)
IYZICO_API_KEY=your_sandbox_api_key
IYZICO_SECRET_KEY=your_sandbox_secret_key
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com

# Cloudinary (optional, for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Admin (comma-separated emails)
ADMIN_EMAILS=admin@example.com,admin2@example.com

# Optional: CORS
CORS_ORIGINS=http://localhost:3000
```

### Generating AUTH_SECRET

```bash
openssl rand -base64 32
```

---

## Authentication & Roles

### User Roles

- **user** (default) - Can browse campaigns and donate
- **admin** - Can verify students, manage users, view statistics

**Note**: There is no "student" role. Student verification is separate from user roles and is determined by `student_profiles.verificationStatus`.

### Role Assignment

1. **Default Role**: When a user signs in with Google for the first time, they are assigned the `user` role (stored on NextAuth adapter's `users` collection).

2. **Admin Promotion**: 
   - Set `ADMIN_EMAILS` environment variable with comma-separated email addresses
   - Users with emails in this list are automatically assigned `admin` role on first sign-in
   - Example: `ADMIN_EMAILS=admin@example.com,admin2@example.com`

3. **Student Verification** (separate from roles):
   - User creates a student profile via `/api/admin/students/profile` → creates document in `student_profiles` collection
   - Admin verifies the student via `/api/admin/students/:id/verify` with `action: "approve"`
   - `student_profiles.verificationStatus` is set to "verified"
   - Only users with `student_profiles.verificationStatus === "verified"` can create campaigns
   - User role remains `user` - verification status is checked separately

### Identity Model

**Canonical User Identifier**: NextAuth `user.id` (MongoDB ObjectId string)
- All user references use NextAuth adapter's `users` collection
- Campaign ownership: `campaigns.owner_id` = NextAuth `user.id`
- Student profiles: `student_profiles.user_id` = NextAuth `user.id`
- No separate "custom users" collection is maintained

**Student Verification**:
- Student verification data lives ONLY in `student_profiles` collection
- Fields: `user_id` (canonical), `verificationStatus` ("pending"|"verified"|"rejected")
- Verification is NOT stored in `accounts` collection (that's for OAuth provider linkage)

**Roles**:
- `users.role`: "user" | "admin" (stored on adapter users collection)
- Student verification is separate from role - determined by `student_profiles.verificationStatus`
- Verified students can create campaigns (checked via `student_profiles.verificationStatus === "verified"`)
- Admins bypass verification checks

### Student Verification Flow

1. User signs in with Google (role: `user`)
2. User creates student profile (POST `/api/admin/students/profile`) → `student_profiles` collection
3. Admin reviews and verifies (POST `/api/admin/students/:id/verify` with `action: "approve"`)
4. `student_profiles.verificationStatus` is set to "verified"
5. User can now create campaigns (POST `/api/campaigns`) - verified by checking `student_profiles.verificationStatus`

---

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Select **Web application**
6. Add **Authorized JavaScript origins**:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
7. Add **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
8. Copy **Client ID** and **Client Secret** to `.env.local`

---

## iyzico Setup

1. [sandbox-merchant.iyzipay.com](https://sandbox-merchant.iyzipay.com) adresinden sandbox hesabı oluşturun
2. Merchant panelinden **API Key** ve **Secret Key** değerlerini alın
3. `.env.local` dosyanıza ekleyin:
   ```env
   IYZICO_API_KEY=your_sandbox_api_key
   IYZICO_SECRET_KEY=your_sandbox_secret_key
   IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
   ```

**Production için:**
1. [merchant.iyzipay.com](https://merchant.iyzipay.com) adresinden gerçek hesap oluşturun
2. `IYZICO_BASE_URL` değerini `https://api.iyzipay.com` olarak güncelleyin

**Önemli**: iyzico, ödeme tamamlandıktan sonra `/api/iyzico/callback` adresine POST isteği gönderir. Bu endpoint otomatik olarak ödeme doğrulaması yapar.

**Test Kartları (Sandbox):**
- Başarılı: `5528790000000008` (Mastercard)
- Başarılı: `4603450000000000` (Visa)
- Son Kullanma: `12/2030`
- CVV: `123`

---

## Cloudinary Setup

1. Create account at [cloudinary.com](https://cloudinary.com)
2. Go to **Dashboard**
3. Copy **Cloud name**, **API Key**, and **API Secret**
4. Add to `.env.local`

---

## Vercel Deployment

### Prerequisites
- Vercel account (free tier available)
- MongoDB Atlas (free tier available) or self-hosted MongoDB
- All service accounts (Google, iyzico, Cloudinary) configured

### Deployment Steps

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import Project to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" > "Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**
   - In Vercel project settings, go to "Environment Variables"
   - Add all variables from `.env.local`:
     - `MONGO_URL` (use MongoDB Atlas connection string)
     - `AUTH_SECRET` (generate new one for production)
     - `AUTH_URL` (your Vercel domain, e.g., `https://your-app.vercel.app`)
     - `GOOGLE_CLIENT_ID`
     - `GOOGLE_CLIENT_SECRET`
     - `IYZICO_API_KEY` (use live key in production)
     - `IYZICO_SECRET_KEY` (from iyzico merchant panel)
     - `IYZICO_BASE_URL` (`https://api.iyzipay.com` for production)
     - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
     - `ADMIN_EMAILS` (comma-separated)

4. **Update OAuth Redirect URIs**
   - Update Google OAuth redirect URI to: `https://your-app.vercel.app/api/auth/callback/google`
   - Set iyzico callback URL to: `https://your-app.vercel.app/api/iyzico/callback`

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Visit your deployed app

### Vercel Deployment Checklist

- [ ] All environment variables added to Vercel
- [ ] `AUTH_SECRET` generated and added
- [ ] `AUTH_URL` set to production domain
- [ ] `MONGO_URL` points to MongoDB Atlas (or accessible database)
- [ ] `ADMIN_EMAILS` set with admin email addresses
- [ ] Google OAuth redirect URI updated to production domain
- [ ] iyzico callback URL set to production domain
- [ ] `IYZICO_API_KEY` added (required)
- [ ] `IYZICO_SECRET_KEY` added (required)
- [ ] `IYZICO_BASE_URL` set to `https://api.iyzipay.com`
- [ ] Build passes: `npm run build`
- [ ] Test authentication flow
- [ ] Test donation flow
- [ ] Test donation flow with iyzico sandbox

### Local Payment Testing

iyzico uses callback-based payment flow. No CLI tool is needed.
Use iyzico sandbox test card: `5528790000000008` (Exp: 12/30, CVC: 123).
Callback endpoint: `POST /api/iyzico/callback`

---

## API Endpoints

### Authentication
- `GET /api/auth/signin` - Sign in page (NextAuth)
- `GET/POST /api/auth/[...nextauth]` - NextAuth handlers
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Campaigns
- `GET /api/campaigns` - List published campaigns (with filters: category, country, field_of_study, search, page, limit)
- `GET /api/campaigns/:id` - Get campaign details (public)
- `POST /api/campaigns` - Create campaign (verified students only)
- `PATCH /api/campaigns/:id` - Update campaign (owner or admin)
- `POST /api/campaigns/:id/publish` - Publish campaign (owner or admin)
- `GET /api/campaigns/my` - Get my campaigns (students/admins)

### Donations
- `POST /api/donations/checkout` - Create iyzico checkout form
- `GET /api/donations/status/:session_id` - Get payment status
- `GET /api/donations/my` - Get my donations (authenticated users)

### Admin
- `GET /api/admin/students` - List students (admin only, optional status filter)
- `GET /api/admin/students/pending` - List pending verifications (admin only)
- `POST /api/admin/students/:id/verify` - Verify student (admin only, action: "approve"|"reject")
- `POST /api/admin/students/:id/reject` - Reject student (admin only)
- `POST /api/admin/students/profile` - Create student profile (authenticated users)
- `GET /api/admin/campaigns` - List all campaigns (admin only)
- `PUT /api/admin/campaigns/:id/status` - Update campaign status (admin only)
- `GET /api/admin/users` - List users (admin only)
- `PUT /api/admin/users/:id/role` - Update user role (admin only)
- `DELETE /api/admin/users/:id` - Delete user (admin only)
- `GET /api/admin/stats` - Platform statistics (admin only)

### Payment Callback
- `POST /api/iyzico/callback` - iyzico payment callback handler (verifies payment via iyzico API)

### Static Data
- `GET /api/static/categories` - Campaign categories
- `GET /api/static/countries` - Supported countries
- `GET /api/static/fields-of-study` - Fields of study

---

## Development

### Project Structure

```
funded/
├── app/
│   ├── api/              # API routes (App Router)
│   │   ├── auth/         # Authentication routes (NextAuth)
│   │   ├── campaigns/    # Campaign routes
│   │   ├── donations/    # Donation routes
│   │   ├── admin/        # Admin routes
│   │   ├── iyzico/       # iyzico payment callback
│   │   └── static/       # Static data
│   ├── page.tsx          # Home page
│   └── layout.tsx        # Root layout
├── components/           # React components
├── lib/                  # Utilities and helpers
│   ├── authz.ts          # Auth helpers (NextAuth-based, canonical IDs)
│   ├── api-client.ts     # Frontend API client
│   ├── validators/       # Zod validation schemas
│   └── api-error.ts      # Error response helpers
├── scripts/              # Migration scripts
│   └── migrate-identity.ts  # Identity standardization script
├── auth.ts               # NextAuth configuration
├── auth.config.ts        # Auth config
└── middleware.ts         # Next.js middleware
```

### Running Tests

```bash
npm test
# or with UI
npm run test:ui
```

### Building

```bash
npm run build
```

---

## Authorization Rules

- **Public**: Browse campaigns, view campaign details
- **Authenticated Users**: Create student profile, view own donations
- **Verified Students**: Create campaigns (draft status)
- **Campaign Owners/Admins**: Update campaigns, publish campaigns
- **Admins**: Verify students, manage users, view all campaigns, update campaign status

---

## Migration Notes

### Identity Migration (Legacy Data)

If you have existing data from a previous version, run the identity migration script to standardize user IDs:

```bash
npm run migrate:identity
```

This script:
- Maps `campaigns.owner_id` and `campaigns.student_id` to canonical NextAuth `user.id`
- Maps `student_profiles.user_id` to canonical NextAuth `user.id`
- Uses email as the mapping key between legacy custom users and adapter users
- Creates indexes on `student_profiles` collection (unique on `user_id`, index on `verificationStatus`)
- Prints a summary: updated counts, skipped records, unresolved mappings

**Important**: Run this migration script before deploying to production if you have existing data.

**What the migration does**:
1. Builds email → NextAuth `user.id` mapping from adapter users collection
2. Attempts to map legacy `user_id` formats (like `user_xxx`) to canonical IDs via email
3. Updates `campaigns.owner_id` to use canonical NextAuth `user.id`
4. Updates `student_profiles.user_id` to use canonical NextAuth `user.id`
5. Creates required indexes on `student_profiles`

**After migration**:
- All campaigns use `owner_id` with canonical NextAuth user IDs
- All student profiles use `user_id` with canonical NextAuth user IDs
- No more legacy `student_id` fields on campaigns
- No more fallback logic needed in code

---

## License

MIT License - see LICENSE file for details.

---

## Support

For issues and feature requests, please open a GitHub issue.
