# Vercel Deployment Guide - Complete Steps

## ⚠️ Important: Environment Variables Security

### Why `.env.example` and NOT `.env`?
- **`.env.example`** = Template (safe to commit to git) - shows what variables are needed
- **`.env`** = Actual secrets (NEVER commit to git) - kept local only
- **Vercel Dashboard** = Where you set REAL environment variables in production

✅ This is the correct security practice!

---

## 📋 Pre-Deployment Checklist

- ✅ Database schema updated and pushed to Neon
- ✅ Test data files created in `test-data/`
- ✅ `.env.example` contains only template (no real credentials)
- ✅ `.gitignore` includes `.env` and `.env.local`
- ✅ Project pushed to GitHub
- ✅ ESP32 code unchanged

---

## 🚀 Step-by-Step Vercel Deployment

### STEP 1: Prepare Your Repository (DONE ✅)
```bash
# Verify .env is in .gitignore
cat .gitignore | grep ".env"
# Output should include: .env, .env.local

# Verify only .env.example is in git
git ls-files | grep env
# Output should show: .env.example (NOT .env)
```

### STEP 2: Create Vercel Account & Project
1. Go to [https://vercel.com](https://vercel.com)
2. Sign up or log in
3. Click **"New Project"**
4. Import your GitHub repository: `OmarBhy/green_garden`
5. Select **"Next.js"** framework (auto-detected)
6. Click **"Import"**

### STEP 3: Configure Environment Variables in Vercel

After importing, Vercel shows "Configure Project" screen:

#### **Environment Variables Section:**

**Add these variables:**

```
DATABASE_URL = postgresql://username:password@host.neon.tech/dbname?sslmode=require&channel_binding=require
```
*(Copy your actual Neon connection string)*

```
NEXT_PUBLIC_API_URL = https://your-project.vercel.app
```
*(Replace "your-project" with your actual Vercel project name)*

**How to get DATABASE_URL from Neon:**
1. Go to [https://console.neon.tech](https://console.neon.tech)
2. Select your project
3. Click **"Connection String"** in top right
4. Copy the **PostgreSQL** connection string
5. Paste in Vercel → DATABASE_URL field

### STEP 4: Deploy!
1. Click **"Deploy"** button
2. Wait for build to complete (~2-3 minutes)
3. See green checkmark ✅ when done
4. Click **"Visit"** to see your live site

### STEP 5: Verify Deployment

**Check your live site:**
```
https://your-project.vercel.app
```

Should show:
- ✅ Dashboard page loads
- ✅ Real-time sensor display
- ✅ No database connection errors

---

## 📝 Environment Variables Explained

| Variable | Where It's Used | Example |
|----------|-----------------|---------|
| `DATABASE_URL` | Backend API routes & Prisma | `postgresql://...` from Neon |
| `NEXT_PUBLIC_API_URL` | Frontend (client-side calls) | `https://your-project.vercel.app` |

**Key Point:** `NEXT_PUBLIC_` prefix means it's visible to browser (safe data only, never passwords)

---

## 🔧 After Deployment - Update ESP32

Once Vercel deployment is live:

1. **Get your Vercel URL:**
   ```
   https://your-project.vercel.app
   ```

2. **Update ESP32_MASTER.ino:**
   ```cpp
   #define DASHBOARD_URL "https://your-project.vercel.app"  // <- Change this
   #define WIFI_SSID "YOUR_SSID"                            // <- Your WiFi
   #define WIFI_PASSWORD "YOUR_PASSWORD"                    // <- Your WiFi password
   ```

3. **Update ESP32_SLAVE.ino:**
   Same changes as Master

4. **Flash updated code to ESP32s**

5. **ESP32 will now send data to your live Vercel dashboard!**

---

## 🔄 Continuous Deployment

From now on:
- Push to `main` branch → Vercel auto-deploys
- No manual steps needed
- Takes ~1-2 minutes per deploy

```bash
# Make changes locally
git add .
git commit -m "description"
git push origin main

# ✅ Vercel automatically deploys!
# Check deployment status: https://vercel.com/dashboard
```

---

## ❌ Common Issues & Fixes

### "Error: DATABASE_URL is not set"
**Solution:** Add DATABASE_URL to Vercel Environment Variables

### "Connection refused"
**Solution:** Make sure DATABASE_URL is correct from Neon

### "NEXT_PUBLIC_API_URL mismatch"
**Solution:** Update to your actual Vercel URL (https://your-project.vercel.app)

### Database schema missing
**Solution:** Run in Vercel console:
```bash
# In Vercel dashboard → Project → Settings → Functions
npm run db:push
```

---

## 📊 Vercel Dashboard Overview

After deployment, monitor your app:

1. **Deployments Tab** - See all deployments
2. **Analytics** - Page views, response time
3. **Logs** - Real-time application logs
4. **Environment Variables** - Update/view variables
5. **Settings** - Git integration, domains, etc.

---

## 🎯 Your Deployment URLs

- **Live Dashboard:** https://your-project.vercel.app
- **API Endpoints:** https://your-project.vercel.app/api/data
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Neon Database:** https://console.neon.tech

---

## ✅ Final Checklist

Before you deploy:

```
✅ All files committed to git
✅ .env file NOT in git (only .env.example)
✅ GitHub repository is public/private but accessible
✅ Neon database is active
✅ DATABASE_URL is correct
✅ No build errors locally: npm run build
```

**Ready to deploy!** 🚀
