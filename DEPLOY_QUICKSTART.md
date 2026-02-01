# 🚀 Quick Deployment Guide

## Summary: What Happens Where

- **Neon** = Your PostgreSQL database (cloud)
- **Vercel** = Your web app hosting (cloud)  
- **Your Laptop** = Where you run setup commands (local, but connected to production DB)

---

## Step-by-Step (20 minutes total)

### 1️⃣ Create Database (3 min)

Go to: https://console.neon.tech/

1. Click **"New Project"**
2. Name: `ey-meeting-tracker`
3. Region: **Europe** (Frankfurt/Stockholm)
4. **Copy the connection string** 📋

It looks like:
```
postgresql://user:password@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

---

### 2️⃣ Generate Secret Key (1 min)

**PowerShell:**
```powershell
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

📋 Copy this output - it's your `AUTH_SECRET`

---

### 3️⃣ Deploy to Vercel (5 min)

Go to: https://vercel.com/new

1. **Import** your `meeting_tracker` repo from GitHub
2. **Don't change** build settings (auto-detected from vercel.json)
3. Click **"Environment Variables"**
4. Add these 5 variables:

| Name | Value |
|------|-------|
| `DATABASE_URL` | Your Neon connection string from Step 1 |
| `AUTH_SECRET` | Your generated secret from Step 2 |
| `AUTH_TRUST_HOST` | `true` |
| `AUTH_RESEND_KEY` | Get from https://resend.com/api-keys |
| `EMAIL_FROM` | `EY Meeting Tracker <onboarding@resend.dev>` |

5. Click **"Deploy"** 🎉

**Wait 2-3 minutes** for deployment to complete...

---

### 4️⃣ Setup Database (5 min)

**On YOUR laptop, in PowerShell:**

#### Option A: Manual Setup (Works on Corporate Networks)

```powershell
# Navigate to project
cd "C:\Users\Soeren.Plaugmann\OneDrive - EY\Documents\GitHub\meeting_tracker"

# Create .env.production file manually
# Copy your DATABASE_URL from Vercel dashboard
@"
DATABASE_URL="your-neon-connection-string-from-vercel"
"@ | Out-File -FilePath .env.production -Encoding utf8

# Create database schema
npx dotenv -e .env.production -- prisma db push

# Import 162 customers
npx dotenv -e .env.production -- tsx scripts/reset-and-import-customers.ts
```

**To get DATABASE_URL:**
1. Go to https://vercel.com/dashboard
2. Click your project
3. Go to **Settings** → **Environment Variables**
4. Find `DATABASE_URL` and click **"Show"**
5. Copy the value

#### Option B: Using Vercel CLI (If SSL Works)

```powershell
# If you get SSL certificate errors on corporate network, use Option A instead

# Install Vercel CLI (one-time)
npm install -g vercel

# For corporate networks with SSL inspection:
$env:NODE_TLS_REJECT_UNAUTHORIZED="0"

# Login to Vercel
vercel login

# Pull your production DATABASE_URL
vercel env pull .env.production

# Create database schema
npx dotenv -e .env.production -- prisma db push

# Import 162 customers
npx dotenv -e .env.production -- tsx scripts/reset-and-import-customers.ts
```

**What's happening?**
- ✅ You're running commands on your laptop
- ✅ But they connect to your Neon production database in the cloud
- ✅ The `dotenv` command loads the DATABASE_URL from `.env.production`

---

### 5️⃣ Create Admin User (3 min)

**Two options:**

#### Option A: Via Prisma Studio (GUI)
```powershell
# Open database editor (connects to production)
npx dotenv -e .env.production -- prisma studio
```

1. Opens in browser at http://localhost:5555
2. Click **"User"** table
3. Click **"Add record"**
4. Fill in:
   - email: `your.name@dk.ey.com`
   - role: `ADMIN`
   - target: `8`
5. Click **"Save"**

#### Option B: Via Script
```powershell
# Run the create-user script
npx dotenv -e .env.production -- tsx scripts/create-user.ts
```

---

### 6️⃣ Test Your App ✅

Go to your Vercel URL (shown in deployment completion):
`https://your-app.vercel.app`

Test:
- [ ] Sign in with your @ey.com or @dk.ey.com email
- [ ] Check email for magic link
- [ ] Create a new meeting
- [ ] Search for customers (should see all 162)
- [ ] Install PWA on mobile

---

## 🎊 Done!

Your app is live at: `https://your-app.vercel.app`

### Optional: Add Custom Domain

In Vercel dashboard:
1. Go to **Settings** → **Domains**
2. Add: `meetings.ey.com` (or your preferred domain)
3. Follow DNS setup instructions

---

## ⚠️ Security Reminder

After setup, **delete** `.env.production` from your laptop:

```powershell
Remove-Item .env.production
```

All secrets are safely stored in Vercel. You can always pull them again with:
```powershell
vercel env pull .env.production
```

---

## 🆘 Troubleshooting

### "SSL certificate error" with Vercel CLI

**This happens on corporate networks (like EY) with SSL inspection.**

**Solution:** Use **Option A (Manual Setup)** in Step 4 instead of Vercel CLI.

Or, temporarily disable SSL verification:
```powershell
$env:NODE_TLS_REJECT_UNAUTHORIZED="0"
vercel login
```

⚠️ **Security Note:** Only use this on trusted networks. Reset after:
```powershell
Remove-Item Env:\NODE_TLS_REJECT_UNAUTHORIZED
```

### "Command not found: vercel"
```powershell
npm install -g vercel
```

### "Command not found: dotenv"
```powershell
npm install
```

### "Invalid DATABASE_URL"
- Make sure connection string ends with `?sslmode=require`
- Check Neon database is active (green dot in Neon console)

### Database commands fail
- Verify `.env.production` exists: `Get-Content .env.production`
- Should show `DATABASE_URL=postgresql://...`

### Can't sign in
- Check Resend API key is correct
- Verify AUTH_SECRET is set in Vercel
- Check Vercel logs for errors

---

## 📚 Full Documentation

See `DEPLOYMENT.md` for detailed documentation.
