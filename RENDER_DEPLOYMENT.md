# Deploying RehabFit Backend on Render

## Prerequisites
1. A [Render](https://render.com) account (free tier available)
2. Your GitHub repository connected to Render

## Deployment Steps

### 1. Connect Repository to Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Blueprint"
3. Connect your GitHub account and select the `rehabfit` repository
4. Render will automatically detect the `render.yaml` file

### 2. Configure Environment Variables
In the Render dashboard, set these environment variables for the `rehabfit-backend` service:

```
OPENAI_API_KEY=your_openai_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=aped-4627-b74a
PINECONE_INDEX=rehabfit
PINECONE_PROJECT=6hwstht
YOUTUBE_API_KEY=your_youtube_api_key
EMBEDDING_SERVICE_URL=http://rehabfit-embedding:5005
```

### 3. Deploy
1. Click "Create Blueprint" in Render
2. Render will automatically create:
   - PostgreSQL database (`rehabfit-db`)
   - Backend web service (`rehabfit-backend`)
   - Embedding service (`rehabfit-embedding`)
3. Wait for deployment to complete (usually 5-10 minutes)

### 4. Get the Backend URL
After deployment, Render will provide a URL like: `https://rehabfit-backend.onrender.com`

### 5. Update Frontend
Update your frontend's `.env` file or Vercel environment variables:
```
REACT_APP_API_URL=https://rehabfit-backend.onrender.com
```

## Services Overview

### Backend Service (`rehabfit-backend`)
- **Framework**: Spring Boot (Java)
- **Purpose**: Main API server handling user authentication, RAG queries, and dashboard data
- **Port**: 8080
- **Health Check**: `/api/rag/test-youtube`

### Embedding Service (`rehabfit-embedding`)
- **Framework**: Flask (Python)
- **Purpose**: Provides sentence embeddings using HuggingFace `all-MiniLM-L6-v2` model
- **Port**: 5005
- **Health Check**: `/embed`
- **Model**: Downloads ~90MB model on first startup (may take time)

### Database (`rehabfit-db`)
- **Type**: PostgreSQL
- **Purpose**: Stores user data, progress logs, and authentication info
- **Plan**: Free tier (256MB storage, 512MB RAM)

### Build Failures
- Check the build logs in Render dashboard
- Ensure all environment variables are set correctly
- Verify the Dockerfile is in the root directory

### Database Connection Issues
- Render automatically creates and connects the PostgreSQL database
- Check the database logs if connection fails

### API Key Issues
- Ensure all API keys are set as environment variables
- Check that the keys are valid and have proper permissions

## Free Tier Limitations
- 750 hours/month free
- Automatic sleep after 15 minutes of inactivity
- Cold starts may take a few seconds

## Cost Optimization
- The free tier should be sufficient for development and light production use
- Monitor usage in the Render dashboard