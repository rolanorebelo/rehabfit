# RehabFit

An AI-powered injury-aware fitness application with personalized recovery tracking and recommendations.

🚀 **Live Demo**: [https://rehabfit.vercel.app](https://rehabfit.vercel.app)

## Project Structure

```
rehabfit-monorepo/
├── rehabfit-frontend/          # React frontend (Vercel)
├── rehabfit-backend/           # Spring Boot backend (Railway)
├── rehabfit-embedding-service/ # Python embedding service (Railway)
└── README.md
```

## Components

### Frontend (React) - Deployed on Vercel
- **Location**: `rehabfit-frontend/`
- **Production URL**: https://rehabfit.vercel.app
- **Tech Stack**: React, Tailwind CSS, Axios
- **Features**: 
  - User authentication (JWT + Google OAuth)
  - Real-time progress tracking with charts
  - AI chatbot assistant
  - Video recommendations
  - Dark mode support
  - Responsive mobile design

### Backend (Spring Boot) - Deployed on Railway
- **Location**: `rehabfit-backend/rehabfit/rehabfit/`
- **Production URL**: https://rehabfit-production.up.railway.app
- **Tech Stack**: Java 21, Spring Boot 3.4.4, PostgreSQL 17, JWT, Hibernate
- **Features**:
  - RESTful API with Spring Security
  - User management with BCrypt password hashing
  - Progress tracking with time-series data
  - RAG (Retrieval-Augmented Generation) integration
  - Pinecone vector database for semantic search
  - OpenAI GPT-4 integration for AI assistance
  - YouTube Data API for exercise video recommendations
  - CORS configured for production domains

### Embedding Service (Python) - Deployed on Railway
- **Location**: `rehabfit-embedding-service/`
- **Internal URL**: http://skillful-success.railway.internal:5005
- **Tech Stack**: Python, Flask, Sentence Transformers (HuggingFace)
- **Model**: all-MiniLM-L6-v2 (384-dimensional embeddings)
- **Purpose**: Generate embeddings for RAG functionality

## Deployment

### Production Infrastructure
- **Frontend**: Vercel (Serverless, Global CDN)
- **Backend**: Railway (Containerized, Auto-scaling)
- **Database**: Railway PostgreSQL 17.6
- **Embedding Service**: Railway (Python Flask)
- **Vector Database**: Pinecone (Cloud-hosted)

### Environment Variables

#### Backend (Railway)
```properties
JDBC_DATABASE_URL=jdbc:postgresql://postgres.railway.internal:5432/railway?user=...&password=...
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=aped-4627-b74a
PINECONE_INDEX=rehabfit
PINECONE_PROJECT=6hwstht
YOUTUBE_API_KEY=...
JWT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

#### Frontend (Vercel)
```bash
REACT_APP_API_URL=https://rehabfit-production.up.railway.app
DISABLE_ESLINT_PLUGIN=true
```

## Quick Start

### Prerequisites
- Node.js 18+
- Java 21+
- Python 3.10+
- Docker & Docker Compose (for local development)
- PostgreSQL 15+ (or use Docker)

## Local Development

## Local Development

1. **Clone and Install**:
   ```bash
   git clone https://github.com/rolanorebelo/rehabfit.git
   cd rehabfit-monorepo
   ```

2. **Backend Environment Variables**:
   Create `application.properties` in `rehabfit-backend/rehabfit/rehabfit/src/main/resources/`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/rehabfit
   spring.datasource.username=postgres
   spring.datasource.password=your_password
   openai.api.key=sk-your_openai_key
   pinecone.api.key=your_pinecone_key
   pinecone.environment=your_pinecone_env
   pinecone.index=rehabfit
   youtube.api.key=your_youtube_key
   jwt.secret=your_jwt_secret
   ```

3. **Frontend Environment Variables**:
   Create `.env.local` in `rehabfit-frontend/`:
   ```bash
   REACT_APP_API_URL=http://localhost:8080
   ```

### Running with Docker (Recommended for Local Development)

```bash
# Start all services
cd rehabfit-backend/rehabfit/rehabfit
docker-compose up -d

# Frontend (separate terminal)
cd ../../rehabfit-frontend
npm install
npm start
```

Access the application at http://localhost:3001

### Running Manually

1. **Start Database**:
   ```bash
   # Using Docker
   docker run -d \
     --name postgres \
     -e POSTGRES_PASSWORD=your_password \
     -e POSTGRES_DB=your_db \
     -p 5432:5432 \
     postgres:15
   ```

2. **Start Embedding Service**:
   ```bash
   cd rehabfit-embedding-service
   pip install -r requirements.txt
   python embed_service.py
   ```

3. **Start Backend**:
   ```bash
   cd rehabfit-backend/rehabfit/rehabfit
   ./mvnw spring-boot:run
   ```

4. **Start Frontend**:
   ```bash
   cd rehabfit-frontend
   npm install
   npm start
   ```

## Features

- **🔐 User Authentication**: Registration, login, and Google OAuth 2.0 integration
- **📊 Progress Tracking**: Track pain levels, mobility, and strength with interactive charts
- **🤖 AI Assistant**: Chatbot powered by OpenAI GPT-4 with RAG capabilities using Pinecone
- **🎥 Video Recommendations**: YouTube integration for personalized exercise videos
- **🌙 Responsive Design**: Mobile-friendly interface with dark mode support
- **💾 Data Persistence**: PostgreSQL database with HikariCP connection pooling
- **🔍 Semantic Search**: Vector embeddings via HuggingFace Sentence Transformers
- **🔒 Security**: JWT authentication, BCrypt password hashing, CORS protection

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/google` - Google OAuth login
- `GET /auth/me` - Get current user

### Progress Tracking
- `POST /api/progress` - Log progress entry
- `GET /api/progress` - Get user progress history
- `GET /api/rag/dashboard` - Get dashboard data with AI insights

### AI & RAG
- `POST /api/rag/chat` - Chat with AI assistant
- `POST /api/rag/upsert-chat` - Store chat messages in vector database
- `POST /api/rag/recommendations` - Get AI-powered exercise recommendations

## Technology Stack

### Frontend
- React 18
- Tailwind CSS
- Axios for API calls
- React Router for navigation
- Recharts for data visualization

### Backend
- Spring Boot 3.4.4
- Spring Security with JWT
- Hibernate ORM
- PostgreSQL 17.6
- HikariCP connection pooling
- RestTemplate for external APIs

### AI/ML
- OpenAI GPT-4 API
- Pinecone Vector Database
- HuggingFace Sentence Transformers
- Python Flask for embedding service

### DevOps
- Docker & Docker Compose
- Railway (Backend & Embedding Service)
- Vercel (Frontend)
- GitHub Actions (CI/CD ready)

## Architecture

```
┌─────────────────┐
│  React Frontend │ (Vercel)
│  Port: 3001     │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│ Spring Boot API │ (Railway)
│  Port: 8080     │
└────────┬────────┘
         │
    ┌────┴─────────────┬──────────────┬─────────────┐
    ▼                  ▼              ▼             ▼
┌──────────┐  ┌─────────────┐  ┌──────────┐  ┌─────────────┐
│PostgreSQL│  │   Pinecone  │  │  OpenAI  │  │  Embedding  │
│   DB     │  │   Vector    │  │   API    │  │  Service    │
│ (Railway)│  │  Database   │  │          │  │  (Railway)  │
└──────────┘  └─────────────┘  └──────────┘  └─────────────┘
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

