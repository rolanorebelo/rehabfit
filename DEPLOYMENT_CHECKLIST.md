# 🚀 Railway Deployment - Pre-Flight Checklist

## ✅ Before You Deploy

### 1. Code Prepared
- [x] Railway configuration files created
- [x] CORS updated for production URLs
- [x] Frontend API configured for environment variables
- [x] .gitignore configured properly
- [x] All secrets in .env files (not committed)

### 2. API Keys Ready
- [ ] OpenAI API Key: `sk-proj-...`
- [ ] Pinecone API Key: `pcsk_...`
- [ ] Pinecone Environment: `aped-4627-b74a`
- [ ] Google OAuth Client ID
- [ ] YouTube API Key (optional)

### 3. GitHub Ready
- [ ] Code committed to git
- [ ] GitHub repository created
- [ ] Code pushed to GitHub

### 4. Railway Account
- [ ] Signed up at https://railway.app
- [ ] GitHub account connected to Railway

---

## 🎯 Deployment Steps

### Backend Service
1. [ ] Create new Railway project
2. [ ] Deploy from GitHub repo
3. [ ] Set root directory: `rehabfit-backend/rehabfit/rehabfit`
4. [ ] Add all environment variables (use `.env.railway.template`)
5. [ ] Generate domain
6. [ ] Copy backend URL: `_______________________________`

### Database
7. [ ] Add PostgreSQL to Railway project
8. [ ] Verify connection variables auto-configured

### Embedding Service
9. [ ] Add new service from same GitHub repo
10. [ ] Set root directory: `rehabfit-embedding-service`
11. [ ] Set start command: `python embed_service.py`
12. [ ] Add PORT=5005 variable

### Frontend
13. [ ] Install Vercel CLI: `npm install -g vercel`
14. [ ] Create `.env.production` with backend URL
15. [ ] Deploy: `cd rehabfit-frontend && vercel --prod`
16. [ ] Copy frontend URL: `_______________________________`

---

## 🔧 Post-Deployment

### Update OAuth
17. [ ] Go to Google Cloud Console
18. [ ] Add frontend URL to authorized redirect URIs
19. [ ] Add backend URL to authorized redirect URIs

### Test Everything
20. [ ] Visit frontend URL
21. [ ] Test login with email/password
22. [ ] Test Google OAuth login
23. [ ] Test AI chatbot
24. [ ] Test progress tracking
25. [ ] Test video recommendations

---

## 📝 Important URLs

Fill these in after deployment:

```
Backend URL:  https://________________________________.railway.app
Frontend URL: https://________________________________.vercel.app
Database:     Managed by Railway (internal)
Embedding:    http://embedding-service.railway.internal:5005
```

---

## 🆘 Troubleshooting

### Backend won't start?
- Check Railway logs: Dashboard → Service → Deployments → View Logs
- Verify all environment variables are set
- Check database connection

### Frontend can't connect?
- Verify REACT_APP_API_URL is set correctly
- Check CORS configuration in WebConfig.java
- Check browser console for errors

### CORS errors?
- Backend WebConfig already includes `*.railway.app` and `*.vercel.app`
- If using custom domain, add it to allowedOriginPatterns

### Database errors?
- Railway auto-provides DATABASE_URL
- Check if PostgreSQL service is running
- Verify init.sql ran successfully

---

## 💰 Cost Tracking

### Free Tier Limits
- Railway: $5 credit/month (~500 hours)
- Vercel: 100 GB bandwidth, unlimited deployments

### Monitoring Usage
- Railway Dashboard → Project → Usage
- Set up billing alerts

---

## 🎉 Success Criteria

Your deployment is successful when:
- ✅ Backend responds to health checks
- ✅ Database schema created
- ✅ Frontend loads without errors
- ✅ Login works (email + Google OAuth)
- ✅ AI chatbot responds to messages
- ✅ Progress tracking saves data
- ✅ Video recommendations load

---

## 📞 Need Help?

1. Read `RAILWAY_DEPLOYMENT.md` for detailed guide
2. Check Railway logs for error messages
3. Test locally first: `docker-compose up`
4. Railway Discord: https://discord.gg/railway

---

**Ready to deploy? Start with the checklist above!** 🚀

**Estimated Time: 15-20 minutes for first deployment**
