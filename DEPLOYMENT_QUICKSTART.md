# RehabFit - Railway Deployment Quick Start

## ✅ What's Been Prepared

Your app is now ready for Railway deployment! Here's what was configured:

### Files Created/Updated:
1. ✅ `railway.json` - Railway configuration
2. ✅ `.railwayignore` - Files to exclude from deployment
3. ✅ `RAILWAY_DEPLOYMENT.md` - Complete deployment guide
4. ✅ `WebConfig.java` - Updated CORS to accept Railway/Vercel URLs
5. ✅ `axios.js` - Added environment variable support for API URL

---

## 🚀 Deploy Now (5 Steps)

### Step 1: Push to GitHub (2 minutes)
```bash
git add .
git commit -m "Configure for Railway deployment"
git push origin main
```

### Step 2: Deploy Backend on Railway (3 minutes)
1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repo
4. Set root directory: `rehabfit-backend/rehabfit/rehabfit`
5. Add environment variables (see RAILWAY_DEPLOYMENT.md)

### Step 3: Add PostgreSQL (1 minute)
1. In Railway project, click "New" → "PostgreSQL"
2. Done! Auto-configured ✅

### Step 4: Deploy Embedding Service (2 minutes)
1. Click "New" → Same GitHub repo
2. Set root directory: `rehabfit-embedding-service`
3. Set start command: `python embed_service.py`

### Step 5: Deploy Frontend on Vercel (2 minutes)
```bash
cd rehabfit-frontend
npx vercel
```

**Total Time: ~10 minutes** ⏱️

---

## 📋 Environment Variables Checklist

### Required for Backend:
```
OPENAI_API_KEY=sk-proj-...
PINECONE_API_KEY=pcsk_...
PINECONE_ENVIRONMENT=aped-4627-b74a
PINECONE_INDEX=rehabfit
GOOGLE_CLIENT_ID=...
```

### Optional:
```
YOUTUBE_API_KEY=AIza...
```

---

## 🎯 What Happens Next?

1. **Railway builds** your Docker containers
2. **PostgreSQL** auto-provisions
3. **Deployment completes** in 3-5 minutes
4. **You get URLs** like:
   - Backend: `https://rehabfit-backend-production.up.railway.app`
   - Frontend: `https://rehabfit.vercel.app`

---

## 💡 Pro Tips

- **Free Tier**: Railway gives $5/month credit (enough for testing)
- **Auto-Deploy**: Push to GitHub = automatic deployment
- **Logs**: Check Railway dashboard for real-time logs
- **Rollback**: One-click rollback to previous deployment

---

## 📚 Need Help?

Read the full guide: `RAILWAY_DEPLOYMENT.md`

**Quick Links:**
- Railway Dashboard: https://railway.app/dashboard
- Railway Docs: https://docs.railway.app
- Vercel Dashboard: https://vercel.com/dashboard

---

## 🔧 Already Have Services Running?

Update environment variables:
```bash
# Frontend .env.production
REACT_APP_API_URL=https://your-backend-url.railway.app

# Backend doesn't need changes - CORS already configured!
```

---

**Ready to deploy? Start with Step 1 above! 🚀**
