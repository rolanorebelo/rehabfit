# Deploying RehabFit to Render - Step by Step

## 🚀 Quick Deploy

Your code is now ready for Render deployment! Follow these steps:

### Step 1: Connect to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New"** → **"Blueprint"**
3. Connect your GitHub account (if not already connected)
4. Select the **`rolanorebelo/rehabfit`** repository
5. Render will automatically detect the `render.yaml` file

### Step 2: Configure Environment Variables

⚠️ **IMPORTANT**: Before clicking "Apply", you MUST set these environment variables:

In the Render Blueprint setup, add these **secret** environment variables:

```
OPENAI_API_KEY=your_openai_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_ENVIRONMENT=your_pinecone_environment
PINECONE_INDEX=rehabfit
PINECONE_PROJECT=your_pinecone_project_id
YOUTUBE_API_KEY=your_youtube_api_key_here
```

The following are already configured in `render.yaml`:
- ✅ `SPRING_DATASOURCE_URL` (auto-connected to database)
- ✅ `SPRING_DATASOURCE_USERNAME` (auto-connected to database)
- ✅ `SPRING_DATASOURCE_PASSWORD` (auto-connected to database)
- ✅ `CORS_ORIGINS` (set to `https://rehabfit.vercel.app`)
- ✅ `EMBEDDING_SERVICE_URL` (internal service connection)

### Step 3: Deploy

1. Click **"Apply"** or **"Create Blueprint"**
2. Render will create 3 services:
   - 🗄️ **rehabfit-db** (PostgreSQL database)
   - 🖥️ **rehabfit-backend** (Spring Boot API)
   - 🤖 **rehabfit-embedding** (Python embedding service)

### Step 4: Monitor Deployment

**Expected timeline:**
- Database: ~2 minutes
- Embedding Service: ~3-5 minutes
- Backend: ~8-12 minutes (Maven build takes time)

**Watch the logs:**
1. Click on **rehabfit-backend** service
2. Go to **"Logs"** tab
3. Look for:
   ```
   Started RehabfitApplication in X seconds
   Tomcat started on port 8080
   ```

### Step 5: Test Your Deployment

Once deployed, your backend URL will be: `https://rehabfit-backend.onrender.com`

**Test the health endpoint:**
```bash
curl https://rehabfit-backend.onrender.com/api/rag/health
```

Expected response: `OK`

**Test with query parameter:**
```bash
curl "https://rehabfit-backend.onrender.com/api/rag/test-youtube?query=physical%20therapy"
```

### Step 6: Update Frontend

Update your Vercel environment variables:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **rehabfit-frontend** project
3. Go to **Settings** → **Environment Variables**
4. Update or add:
   ```
   REACT_APP_API_URL=https://rehabfit-backend.onrender.com
   ```
5. **Redeploy** your frontend

---

## 🔧 What's Been Fixed

### ✅ Security Configuration
- Added `/api/rag/health` to public endpoints
- Health check endpoint is now accessible without authentication

### ✅ Database Configuration
- Changed env vars from `DATABASE_URL` to `SPRING_DATASOURCE_URL`
- Changed env vars from `DB_USERNAME` to `SPRING_DATASOURCE_USERNAME`
- Changed env vars from `DB_PASSWORD` to `SPRING_DATASOURCE_PASSWORD`
- Matches Render's PostgreSQL property names

### ✅ Health Check Endpoint
- Updated from `/api/rag/test-youtube` to `/api/rag/health`
- Simpler, faster health check for Render
- No external API calls needed

### ✅ Dockerfile Optimized
- Multi-stage build for smaller image
- Memory limits for Render free tier: `-Xmx320m -Xms128m`
- Respects `$PORT` environment variable

---

## 🐛 Troubleshooting

### Backend failing to start?

**Check logs for database connection errors:**
```
FATAL: database "rehabfit" does not exist
```
**Solution:** Database takes 1-2 minutes to provision. Wait and Render will auto-restart.

### Health check failing?

**Error:** `Health check failed`
**Solution:** 
1. Check that `/api/rag/health` endpoint is accessible
2. Verify backend logs show "Started RehabfitApplication"
3. Ensure port 8080 is exposed

### Build timeout?

**Error:** `Build exceeded maximum time`
**Solution:**
1. This is rare but can happen on first build
2. Click "Manual Deploy" → "Clear build cache & deploy"
3. Maven dependencies will be cached after first build

### Embedding service issues?

**Error:** `Failed to download model`
**Solution:**
1. The HuggingFace model (~90MB) downloads on first start
2. This adds ~2-3 minutes to initial deployment
3. Subsequent deploys are faster (model is cached)

---

## 💰 Free Tier Limits

- **750 hours/month** total across all services
- **Auto-sleep** after 15 minutes of inactivity
- **Cold start:** ~10-30 seconds after sleep
- **Database:** 256MB storage, 512MB RAM

For production with more traffic, consider upgrading to Starter plans ($7-20/month per service).

---

## 🎯 Next Steps

1. ✅ Deploy to Render (follow steps above)
2. ✅ Test health endpoint
3. ✅ Update frontend environment variables
4. ✅ Test end-to-end flow
5. 🚀 Share your deployed app!

---

## 📝 Notes

- **Render uses PostgreSQL 15** (compatible with your local setup)
- **Auto-deploy** is enabled - pushing to `main` triggers redeployment
- **Environment variables** persist across deployments
- **Logs** are retained for 7 days on free tier

Happy deploying! 🎉
