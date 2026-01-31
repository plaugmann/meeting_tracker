# Deployment Guide - EY Meeting Tracker

## Prerequisites
- ✅ GitHub account connected to Vercel
- ✅ GitHub account connected to Neon
- ✅ Resend API key (for email authentication)

## Step 1: Create Neon PostgreSQL Database

1. Go to https://console.neon.tech/
2. Click **"Create a project"**
3. Name it: `ey-meeting-tracker`
4. Select region: **EU (Frankfurt or Stockholm)** (closest to Denmark)
5. Click **"Create project"**
6. Copy the **Connection String** (starts with `postgresql://...`)

## Step 2: Prepare Environment Variables

You'll need these values:

### DATABASE_URL
- From Neon dashboard (step 1 above)
- Example: `postgresql://user:password@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require`

### AUTH_SECRET
- Generate with: `openssl rand -base64 32`
- Or use: https://generate-secret.vercel.app/32

### AUTH_RESEND_KEY
- Get from https://resend.com/api-keys
- Starts with `re_`

### EMAIL_FROM
- Use: `EY Meeting Tracker <onboarding@resend.dev>`
- Or your verified domain email

## Step 3: Deploy to Vercel

### Option A: Via Vercel Dashboard (Easiest)

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository: `meeting_tracker`
4. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./`
   - **Build Command:** `prisma generate && next build`
   - **Output Directory:** `.next`
5. Click **"Environment Variables"**
6. Add each variable:
   ```
   DATABASE_URL = postgresql://...
   AUTH_SECRET = your-secret-here
   AUTH_TRUST_HOST = true
   AUTH_RESEND_KEY = re_xxx
   EMAIL_FROM = EY Meeting Tracker <onboarding@resend.dev>
   ```
7. Click **"Deploy"**

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## Step 4: Initialize Production Database

**Run these commands on your LOCAL laptop, but connected to production database:**

### Option A: Using Vercel CLI (Recommended)

```powershell
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Pull production environment variables from Vercel
npx vercel env pull .env.production

# This creates .env.production with your DATABASE_URL

# Now run database commands with production env
npx dotenv -e .env.production -- prisma db push

# Import customers
npx dotenv -e .env.production -- tsx scripts/reset-and-import-customers.ts
```

### Option B: Manual Setup

1. Create a temporary `.env.production` file locally:
```env
DATABASE_URL="postgresql://your-neon-connection-string"
```

2. Run database setup:
```powershell
# Push schema to production database
$env:DATABASE_URL="your-neon-connection-string"
npx prisma db push

# Import customers
npx tsx scripts/reset-and-import-customers.ts
```

**⚠️ Important:** Delete `.env.production` after setup for security!

## Step 5: Import Customers

You have two options:

### Option A: Via Script (Recommended)
```bash
# Temporarily add to package.json scripts:
"import:customers": "tsx scripts/reset-and-import-customers.ts"

# Run via Vercel CLI:
vercel env pull .env.production
npx tsx scripts/reset-and-import-customers.ts
```

### Option B: Manual Import
1. Go to your Vercel deployment URL
2. Sign in as admin
3. Use the admin interface to add customers

## Step 6: Create Admin Users

### Option A: Via Script
```bash
npx tsx scripts/create-user.ts
```

### Option B: Via Prisma Studio
```bash
npx prisma studio
# Add users directly in the User table
```

## Verification Checklist

- [ ] App loads at your Vercel URL
- [ ] Database connection works
- [ ] Sign in with email works
- [ ] Customers are loaded
- [ ] Can create meetings
- [ ] PWA installs on mobile

## Post-Deployment

1. **Custom Domain (Optional)**
   - Go to Vercel → Settings → Domains
   - Add: `meetings.ey.com` or similar

2. **Monitoring**
   - Vercel Analytics enabled automatically
   - Check error logs in Vercel dashboard

3. **Backups**
   - Neon provides automatic backups
   - Consider weekly exports via Prisma

## Troubleshooting

### "Invalid DATABASE_URL"
- Ensure connection string includes `?sslmode=require`
- Check Neon database is active

### "Auth error"
- Verify AUTH_SECRET is set
- Check AUTH_TRUST_HOST=true

### "Email not sending"
- Verify Resend API key
- Check email domain is verified

## Environment Variables Reference

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="base64-secret"
AUTH_TRUST_HOST="true"
AUTH_RESEND_KEY="re_xxx"
EMAIL_FROM="EY Meeting Tracker <onboarding@resend.dev>"
```

## Support

For issues, check:
1. Vercel deployment logs
2. Neon database status
3. Resend email logs
