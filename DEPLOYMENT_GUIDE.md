# 🚀 Deployment Guide - FreeLancerOS

## Frontend (Vercel) ✅ DONE
- URL: https://vercel.com/import
- Status: **DEPLOYED** or deploying
- Auto-deploys on push to `master`

## Backend (Railway) - SETUP NOW

### Step 1: Create Railway Project (if not done)
1. Go to: https://railway.app/dashboard
2. Click **"New Project"**
3. Click **"Deploy from GitHub Repo"**
4. Select: `benhammane/freelanceos`
5. Click **"Deploy"**

### Step 2: Add PostgreSQL Database
1. In Railway project, click **"+ Create Service"**
2. Select **"Database"** → **"PostgreSQL"**
3. Wait for it to initialize
4. Railway auto-injects: `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`

### Step 3: Configure Backend Service Variables
In the `backend` service:

1. Go to **"Variables"** tab
2. Add these variables:

```
APP_JWT_SECRET=your-secret-jwt-key-at-least-32-chars
APP_ADMIN_EMAIL=admin@freelanceos.local
APP_ADMIN_PASSWORD=ChangeMe123!
APP_STRIPE_SECRET_KEY=sk_test_YOUR_KEY
APP_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
SERVER_PORT=8080
SPRING_JPA_HIBERNATE_DDL_AUTO=update
```

### Step 4: Database Connection
Railway automatically provides these variables from PostgreSQL:
- `PGHOST` → maps to `SPRING_DATASOURCE_URL`
- `PGUSER` → maps to `SPRING_DATASOURCE_USERNAME`
- `PGPASSWORD` → maps to `SPRING_DATASOURCE_PASSWORD`
- `PGDATABASE` → in the URL
- `PGPORT` → in the URL

The `application.yml` will use: `jdbc:postgresql://$PGHOST:$PGPORT/$PGDATABASE`

### Step 5: Deploy
1. Click **"Deploy"** on the backend service
2. Wait for build to complete (~5-10 minutes)
3. Once deployed, you'll see the Railway URL:
   - Example: `https://freelanceos-backend.railway.app`

### Step 6: Update Frontend API URL (Optional)
If you want the frontend to call your backend:

1. Go to Vercel: https://vercel.com/dashboard
2. Click on `freelanceos` project
3. Go to **Settings** → **Environment Variables**
4. Add: `VITE_API_URL=https://YOUR-RAILWAY-URL`
5. Redeploy

---

## Final Stack

| Component | URL | Status |
|-----------|-----|--------|
| Frontend | https://freelanceos.vercel.app | ✅ Deployed |
| Backend API | https://freelanceos-backend.railway.app | 🚀 Deploying |
| Database | PostgreSQL (Railway) | ✅ Created |
| Payments | Stripe (Test Mode) | ✅ Ready |

**Total Cost: $0/month** (Vercel free + Railway $5 free credits)

---

## Troubleshooting

### Backend won't build?
- Check Railway logs: click service → **Logs**
- Common issues:
  - Missing environment variables
  - Java version mismatch
  - PostgreSQL not connected

### Can't connect to database?
- Verify `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD` are set
- Check if PostgreSQL service is running (green status)

### Frontend can't call backend?
- Check `VITE_API_URL` is set correctly
- Verify CORS is enabled on backend
- Check browser console for network errors
