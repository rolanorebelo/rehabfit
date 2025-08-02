# RehabFit Backend

AI-powered injury-aware fitness backend built with Spring Boot.

## Tech Stack
- Java 17
- Spring Boot 3.x
- Spring Security with JWT
- PostgreSQL
- OpenAI API
- Pinecone Vector Database
- YouTube Data API v3

## Project Structure
```
rehabfit-backend/
├── .env.example                    # Environment variables template
├── README.md                       # This file
└── rehabfit/
    └── rehabfit/                   # Main Spring Boot project
        ├── src/
        │   └── main/
        │       ├── java/
        │       │   └── com/example/rehabfit/
        │       └── resources/
        │           └── application.properties
        ├── pom.xml
        └── docker-compose.yml       # PostgreSQL setup
```

## Quick Setup

### Prerequisites
- Java 17+
- Maven 3.6+
- PostgreSQL (or Docker)

### 1. Environment Configuration
Copy `.env.example` to `.env` and configure your API keys:
```bash
cp .env.example .env
# Edit .env with your actual values
```

### 2. Database Setup
```bash
# Option 1: Using Docker (recommended)
cd rehabfit/rehabfit
docker-compose up -d postgres

# Option 2: Local PostgreSQL
createdb rehabfit
```

### 3. Run the Application
```bash
cd rehabfit/rehabfit
./mvnw spring-boot:run
```

The API will be available at `http://localhost:8080`

## API Documentation

### Authentication Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login with JWT
- `POST /auth/google` - Google OAuth login
- `GET /auth/me` - Get current user profile

### Progress Tracking
- `POST /api/progress` - Log new progress entry
- `GET /api/rag/dashboard` - Get user dashboard data

### AI Chat & RAG
- `POST /api/rag/chat` - Chat with AI assistant
- `POST /api/rag/upsert-chat` - Store chat messages for context

### YouTube Integration
- `GET /api/videos/search` - Search exercise videos
- `GET /api/videos/recommendations` - Get personalized video recommendations

## Environment Variables

Required environment variables (see `.env.example`):

| Variable | Description | Required |
|----------|-------------|----------|
| `SPRING_DATASOURCE_URL` | PostgreSQL connection string | Yes |
| `SPRING_DATASOURCE_USERNAME` | Database username | Yes |
| `SPRING_DATASOURCE_PASSWORD` | Database password | Yes |
| `OPENAI_API_KEY` | OpenAI API key for chat functionality | Yes |
| `PINECONE_API_KEY` | Pinecone vector database key | Yes |
| `YOUTUBE_API_KEY` | YouTube Data API v3 key | Yes |
| `CORS_ORIGINS` | Allowed CORS origins | No (defaults to localhost:3001) |

## Development

### Running Tests
```bash
./mvnw test
```

### Building for Production
```bash
./mvnw clean package -DskipTests
java -jar target/rehabfit-*.jar
```

## Docker Support

Build and run with Docker:
```bash
docker build -t rehabfit-backend .
docker run -p 8080:8080 --env-file .env rehabfit-backend
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Ensure PostgreSQL is running
   - Check connection string in `.env`
   - Verify database exists

2. **API Key Errors**
   - Verify all API keys are set in `.env`
   - Check API key validity and permissions

3. **CORS Issues**
   - Update `CORS_ORIGINS` in `.env`
   - Ensure frontend URL is included

For more details, see the main [README.md](../README.md) in the monorepo root.