# Wedding App (زفاف) - Manus Setup Guide

## ✅ Project Successfully Imported!

Your Lovable project has been successfully cloned and configured to work in the Manus environment.

## 📁 Project Location

```
/home/ubuntu/dsfdsffds
```

## 🚀 Development Server

The development server is currently **running** and accessible at:

**Public URL:** https://8080-i14ntlcdr231340aknb9r-b2799dc0.sg1.manus.computer

**Local URL:** http://localhost:8080/

## 🛠️ Available Commands

### Start Development Server
```bash
cd /home/ubuntu/dsfdsffds
npm run dev
```

### Build for Production
```bash
npm run build
```

### Build for Development Mode
```bash
npm run build:dev
```

### Preview Production Build
```bash
npm run preview
```

### Run Linter
```bash
npm run lint
```

## 📱 Mobile App Configuration

Your app uses **Capacitor** for mobile deployment (iOS/Android). The configuration has been updated to work locally instead of pointing to Lovable's servers.

### Capacitor Configuration
- **App ID:** `app.lovable.22b37f64f7ba4316bcf3951e42d6cd16`
- **App Name:** زفاف (Wedding)
- **Web Directory:** `dist`

### Build Mobile App
```bash
# Build the web app first
npm run build

# Sync with Capacitor
npx cap sync

# Open in Android Studio
npx cap open android

# Open in Xcode
npx cap open ios
```

## 🗄️ Database Configuration

Your app uses **Supabase** as the backend. The environment variables are already configured in `.env`:

- **Project ID:** ojryfssngnnjubqsrtzi
- **URL:** https://ojryfssngnnjubqsrtzi.supabase.co
- **Publishable Key:** (configured in .env)

## 🎨 Tech Stack

- **Framework:** Vite + React 18
- **Language:** TypeScript
- **UI Library:** shadcn-ui (Radix UI components)
- **Styling:** Tailwind CSS
- **Mobile:** Capacitor 8
- **Backend:** Supabase
- **State Management:** TanStack Query (React Query)
- **Forms:** React Hook Form + Zod
- **Routing:** React Router DOM
- **PWA:** Vite PWA Plugin

## 📝 Key Features

Based on the project structure, your app includes:

1. **Wedding Halls Management** - Browse and book wedding venues
2. **Dress Shopping** - Browse and purchase wedding dresses
3. **Service Providers** - Find wedding service vendors
4. **Booking System** - Calendar-based booking management
5. **Reviews & Ratings** - User reviews for halls and vendors
6. **Favorites** - Save favorite venues and services
7. **Admin Panel** - Manage listings and bookings
8. **Location-based Search** - Find venues by city
9. **PWA Support** - Install as mobile app
10. **RTL Support** - Right-to-left Arabic interface

## 🔧 Configuration Changes Made

1. **Capacitor Config** - Commented out the Lovable server URL to work locally
2. **Vite Config** - Added `.manus.computer` to allowed hosts for public access

## 📦 Dependencies Installed

All 771 npm packages have been successfully installed, including:
- React ecosystem packages
- Radix UI components
- Supabase client
- Capacitor for mobile
- And many more...

## 🔐 Environment Variables

Your `.env` file contains:
```
VITE_SUPABASE_PROJECT_ID="ojryfssngnnjubqsrtzi"
VITE_SUPABASE_PUBLISHABLE_KEY="[configured]"
VITE_SUPABASE_URL="https://ojryfssngnnjubqsrtzi.supabase.co"
```

## 📤 Deployment Options

### Option 1: Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Option 2: Deploy to Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

### Option 3: Build and Host Anywhere
```bash
# Build the app
npm run build

# The dist/ folder contains your production-ready app
# Upload it to any static hosting service
```

### Option 4: Mobile App Deployment
```bash
# Build web app
npm run build

# Sync with Capacitor
npx cap sync

# For Android - generates APK/AAB
npx cap open android

# For iOS - generates IPA
npx cap open ios
```

## 🔄 Syncing with GitHub

Your project is connected to: **Bigmoq/dsfdsffds**

### Commit and Push Changes
```bash
cd /home/ubuntu/dsfdsffds
git add .
git commit -m "Your commit message"
git push origin main
```

### Pull Latest Changes
```bash
git pull origin main
```

## ⚠️ Notes

- The dev server is currently running in the background
- Any changes you make to the code will automatically reload in the browser
- The public URL will remain active as long as the sandbox is running
- Security vulnerabilities detected: 11 (4 moderate, 7 high) - run `npm audit fix` to resolve

## 🎯 Next Steps

1. **Edit Your Code** - All source files are in `/home/ubuntu/dsfdsffds/src/`
2. **Test Changes** - The dev server auto-reloads on file changes
3. **Commit to GitHub** - Use git commands to save your work
4. **Deploy** - Use any of the deployment options above

## 📞 Need Help?

- Check the original README.md for Lovable-specific documentation
- Review the Capacitor docs for mobile deployment
- Consult Supabase docs for database operations

---

**Your app is ready to edit and deploy! 🎉**
