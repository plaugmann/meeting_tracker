# EY Meeting Tracker

A Progressive Web App (PWA) for EY employees to track customer meetings and drive engagement.

## 🚀 Features

### Core Functionality
- ✅ **Meeting Management**: Create, edit, delete, and list customer meetings
- ✅ **Customer Tracking**: Multi-select customers per meeting
- ✅ **External Participants**: Track meeting attendees
- ✅ **Progress Dashboard**: Real-time stats with weekly/monthly views
- ✅ **Target Tracking**: Configurable monthly meeting targets with progress bars

### Security & Access Control
- ✅ **Email Authentication**: Magic link sign-in via Resend
- ✅ **Domain Restriction**: Only @ey.com and @dk.ey.com email addresses can access
- ✅ **Role-Based Access Control**:
  - **EMPLOYEE**: Create/edit own meetings, view own stats
  - **MANAGER**: View all reports, access analytics
  - **ADMIN**: Full access including user/customer management

### Admin Features
- ✅ **Customer Management**: Add, edit, delete customer names
- ✅ **User Management**: Change roles and set individual targets
- ✅ **Reports**: Three report types (By User, By Customer, By Period)
- ✅ **CSV Export**: Download reports with active filters

### Progressive Web App (PWA)
- ✅ **Installable**: Add to home screen on iOS and Android
- ✅ **Standalone Mode**: Full-screen app experience
- ✅ **Offline-Ready**: Service worker with caching (online-first)
- ✅ **Mobile-Optimized**: Touch-friendly UI, large targets

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth v5
- **Styling**: Tailwind CSS v4
- **PWA**: Custom service worker + manifest
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 20.19+ or 22.12+ or 24.0+
- npm or yarn
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/plaugmann/meeting_tracker.git
cd meeting_tracker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
AUTH_SECRET="your-random-secret-here"
AUTH_TRUST_HOST=true

# Email (Resend)
AUTH_RESEND_KEY="your-resend-api-key"
EMAIL_FROM="EY Meeting Tracker <noreply@yourdomain.com>"
```

**To generate AUTH_SECRET:**
```bash
openssl rand -base64 32
```

**To get Resend API Key:**
1. Sign up at https://resend.com
2. Verify your domain or use test mode
3. Create an API key

### 4. Initialize Database

```bash
# Run migrations
npx prisma migrate dev

# Seed database (creates admin user + sample customers)
npm run db:seed
```

**Default Admin User:** `admin@ey.com`

### 5. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## 📦 Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🗄️ Database Management

```bash
# Open Prisma Studio (database GUI)
npx prisma studio

# Run database test
npm run test:db

# Create new migration
npx prisma migrate dev --name description

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## 👥 User Roles

### Employee (Default)
- Register and manage own meetings
- View personal dashboard
- Track progress toward targets

### Manager
- All Employee permissions
- Access reports page
- View team-wide analytics
- Export data as CSV

### Admin
- All Manager permissions
- Manage customer list
- Manage user roles and targets
- Full system access

## 📱 Installing as PWA

### iOS (iPhone/iPad)
1. Open the app in Safari
2. Tap the Share button (📤)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"

### Android
1. Open the app in Chrome
2. Tap the menu (⋮)
3. Tap "Add to Home screen"
4. Confirm

### Desktop (Chrome/Edge)
1. Look for the install icon in the address bar
2. Click "Install"

## 🔐 Security Notes

- `.env` file contains secrets - **NEVER commit this file**
- Database file (`dev.db`) is in `.gitignore`
- Use strong `AUTH_SECRET` in production
- Configure Resend with verified domain in production
- Service worker only active in production builds

## 📊 Database Schema

### Users
- Email, name, role, target
- Relationships: meetings, accounts

### Customers
- Name (unique)
- Relationships: meetings

### Meetings
- Date, description, external participants
- Relationships: user, customers (many-to-many)

### Auth Tables
- Account (OAuth providers)
- VerificationToken (magic links)

## 🚀 Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy**
```bash
vercel
```

3. **Set Environment Variables**
   - Go to Vercel dashboard → Project Settings → Environment Variables
   - Add all variables from `.env`

4. **Database Note**
   - SQLite doesn't work on Vercel (ephemeral filesystem)
   - Use **Turso** (SQLite-compatible edge database) or **Vercel Postgres**

### Turso Setup (for SQLite on Vercel)

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Create database
turso db create meeting-tracker

# Get connection string
turso db show meeting-tracker

# Update .env
DATABASE_URL="libsql://[your-database].turso.io?authToken=[your-token]"
```

## 📝 Scripts Reference

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run db:seed      # Seed database
npm run test:db      # Test database connection
```

## 🐛 Troubleshooting

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Database Issues
```bash
# Reset database
npx prisma migrate reset

# Regenerate Prisma Client
npx prisma generate
```

### Auth Not Working
- Check `AUTH_SECRET` is set
- Verify `AUTH_RESEND_KEY` is valid
- Ensure email domain is verified in Resend
- Check `EMAIL_FROM` matches verified domain

## 📄 License

MIT

## 🤝 Contributing

This is an internal EY project. For questions or issues, contact the development team.

## 📞 Support

For technical support or questions:
- Check `TEST_RESULTS.md` for test documentation
- Review Prisma schema in `prisma/schema.prisma`
- Contact: [your-contact-info]
# Force rebuild - 2026-02-01 07:33
