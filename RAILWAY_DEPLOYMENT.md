# Railway Deployment Guide - RehabFit

## 🚀 Quick Deployment Steps

### Prerequisites
- GitHub account
- Railway.app account (sign up at https://railway.app)
- All API keys ready:
  - OpenAI API Key
  - Pinecone API Key & Environment
  - YouTube Data API Key (optional)
  - Google OAuth Client ID

---

## Step 1: Push Code to GitHub

```bash
# Navigate to project root
cd c:\Users\rolan\rehabfit-monorepo

# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for Railway deployment"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/rehabfit.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Backend on Railway

### 2.1 Create Backend Service
1. Go to https://railway.app
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `rehabfit` repository
5. Railway will detect your Docker setup

### 2.2 Configure Backend Service
1. Click on the backend service
2. Go to **"Settings"** tab
3. Set **Root Directory**: `rehabfit-backend/rehabfit/rehabfit`
4. Go to **"Variables"** tab and add:

```env
# Database (Railway will auto-generate these if you add PostgreSQL)
DATABASE_URL=postgresql://...
SPRING_DATASOURCE_URL=jdbc:postgresql://...
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=...

# API Keys
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=pcsk_...
PINECONE_ENVIRONMENT=aped-4627-b74a
PINECONE_INDEX=rehabfit
YOUTUBE_API_KEY=AIza...

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id

# Embedding Service URL (update after deploying embedding service)
EMBEDDING_SERVICE_URL=http://embedding-service:5005
```

5. Go to **"Settings"** → **"Networking"**
6. Click **"Generate Domain"** to get your backend URL
7. Copy this URL (e.g., `https://rehabfit-backend-production.up.railway.app`)

---

## Step 3: Add PostgreSQL Database

1. In Railway project, click **"New"** → **"Database"** → **"PostgreSQL"**
2. Railway auto-generates connection variables
3. These will be available to your backend service automatically
4. No manual configuration needed!

---

## Step 4: Deploy Embedding Service

### 4.1 Create Embedding Service
1. In Railway project, click **"New"** → **"GitHub Repo"**
2. Select same repository
3. Click on the new service
4. Go to **"Settings"**
5. Set **Root Directory**: `rehabfit-embedding-service`
6. Set **Start Command**: `python embed_service.py`

### 4.2 Configure Embedding Service
Go to **"Variables"** and add:
```env
PORT=5005
```

---

## Step 5: Deploy Frontend (Separate - Vercel Recommended)

### Option A: Vercel (Recommended for React)

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd rehabfit-frontend

# Create .env.production
echo "REACT_APP_API_URL=https://your-backend-url.railway.app" > .env.production

# Deploy
vercel

# Follow prompts, then deploy to production
vercel --prod
```

### Option B: Railway (All-in-One)

1. Create new service in Railway project
2. Set **Root Directory**: `rehabfit-frontend`
3. Add **Build Command**: `npm install && npm run build`
4. Add **Start Command**: `npm start`
5. Add environment variable:
```env
REACT_APP_API_URL=https://your-backend-url.railway.app
```

---

## Step 6: Update Environment Variables

### Backend Service Variables (Complete List)
```env
# Spring Boot
PORT=8080
SPRING_PROFILES_ACTIVE=prod

# Database (auto-configured by Railway)
DATABASE_URL=${DATABASE_URL}
SPRING_DATASOURCE_URL=${DATABASE_URL}
SPRING_DATASOURCE_USERNAME=${PGUSER}
SPRING_DATASOURCE_PASSWORD=${PGPASSWORD}
SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.postgresql.Driver
SPRING_JPA_HIBERNATE_DDL_AUTO=update
SPRING_JPA_SHOW_SQL=false

# API Keys
OPENAI_API_KEY=sk-proj-your-key
PINECONE_API_KEY=pcsk_your-key
PINECONE_ENVIRONMENT=aped-4627-b74a
PINECONE_INDEX=rehabfit
YOUTUBE_API_KEY=AIzaSy...

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Services
EMBEDDING_SERVICE_URL=http://embedding-service.railway.internal:5005
```

### Frontend Environment Variables (Vercel/Railway)
```env
REACT_APP_API_URL=https://your-backend.railway.app
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

---

## Step 7: Update Google OAuth Redirect URIs

1. Go to https://console.cloud.google.com/
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Add **Authorized redirect URIs**:
   - `https://your-frontend-url.vercel.app`
   - `https://your-backend-url.railway.app/login/oauth2/code/google`

---

## Step 8: Test Deployment

### Backend Health Check
```bash
curl https://your-backend-url.railway.app/actuator/health
```

### Embedding Service Check
```bash
curl https://your-embedding-service.railway.app/health
```

### Frontend Check
Visit: `https://your-frontend-url.vercel.app`

---

## Troubleshooting

### Backend Won't Start
- Check Railway logs: Service → **"Deployments"** tab → Click latest deployment
- Common issues:
  - Missing environment variables
  - Database connection failed
  - Port conflicts

### Database Connection Issues
```bash
# Railway auto-provides these variables:
DATABASE_URL
PGHOST
PGPORT
PGUSER
PGPASSWORD
PGDATABASE

# Make sure application.properties uses them:
spring.datasource.url=${DATABASE_URL:jdbc:postgresql://localhost:5432/rehabfitdb}
```

### CORS Errors
- Make sure frontend URL is in CORS allowedOriginPatterns
- Already configured: `https://*.railway.app`, `https://*.vercel.app`

### Embedding Service Not Reachable
Use Railway's internal networking:
```env
EMBEDDING_SERVICE_URL=http://embedding-service.railway.internal:5005
```

---

## Cost Estimates

### Railway Free Tier
- $5 credit/month
- Enough for:
  - 1 Backend service
  - 1 PostgreSQL database
  - 1 Embedding service
- Approximately 500 hours/month

### Vercel Free Tier
- 100 GB bandwidth
- Unlimited deployments
- Custom domain support

### Total Monthly Cost
- Free tier: **$0** (with Railway $5 credit + Vercel free)
- Paid tier: **$5-20/month** after credits

---

## Post-Deployment

### Enable Custom Domain (Optional)
1. In Railway, go to service → **"Settings"** → **"Domains"**
2. Add custom domain (e.g., `api.rehabfit.com`)
3. Update DNS records as instructed
4. Update CORS and frontend environment variables

### Monitor Logs
```bash
# Railway CLI (optional)
npm install -g @railway/cli
railway login
railway logs
```

### Auto-Deployments
- Railway auto-deploys on git push to main branch
- Disable in Settings → Deployments if needed

---

## Quick Commands

```bash
# Rebuild backend (if you make changes)
cd rehabfit-backend/rehabfit/rehabfit
docker build -t rehabfit-backend .

# Rebuild frontend
cd rehabfit-frontend
npm run build

# Check Railway deployment status
railway status

# View logs
railway logs --service backend
```

---

## Success Checklist

- [ ] Backend deployed on Railway
- [ ] PostgreSQL database provisioned
- [ ] Embedding service deployed
- [ ] Frontend deployed on Vercel
- [ ] All environment variables configured
- [ ] Google OAuth redirect URIs updated
- [ ] CORS configured correctly
- [ ] All services tested and working
- [ ] Custom domains configured (optional)

---

## Support & Resources

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Vercel Docs: https://vercel.com/docs
- Your Railway Dashboard: https://railway.app/dashboard

---

## Emergency Rollback

If something goes wrong:
1. Go to Railway → Service → **"Deployments"**
2. Find previous working deployment
3. Click **"⋮"** → **"Redeploy"**

---

**🎉 Your RehabFit app is now live!**

Backend: `https://your-backend.railway.app`
Frontend: `https://your-frontend.vercel.app`
