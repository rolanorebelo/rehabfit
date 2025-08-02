# RehabFit Monorepo

An AI-powered injury-aware fitness application with personalized recovery tracking and recommendations.

## Project Structure

```
rehabfit-monorepo/
├── rehabfit-frontend/          # React frontend application
├── rehabfit-backend/           # Spring Boot backend API
├── rehabfit-embedding-service/ # Python embedding service
└── README.md
```

## Components

### Frontend (React)
- **Location**: `rehabfit-frontend/`
- **Tech Stack**: React, Tailwind CSS, Axios
- **Port**: 3001
- **Features**: 
  - User authentication
  - Progress tracking
  - AI chatbot assistant
  - Video recommendations
  - Dark mode support

### Backend (Spring Boot)
- **Location**: `rehabfit-backend/rehabfit/rehabfit/`
- **Tech Stack**: Java 17, Spring Boot, PostgreSQL, JWT
- **Port**: 8080
- **Features**:
  - RESTful API
  - User management
  - Progress tracking
  - RAG (Retrieval-Augmented Generation) integration
  - Pinecone vector database integration
  - OpenAI integration

### Embedding Service (Python)
- **Location**: `rehabfit-embedding-service/`
- **Tech Stack**: Python, Flask, Sentence Transformers
- **Port**: 5005
- **Purpose**: Generate embeddings for text data using HuggingFace models

## Quick Start

### Prerequisites
- Node.js 18+
- Java 17+
- Python 3.10+
- Docker & Docker Compose
- PostgreSQL (or use Docker)

### Environment Setup

1. **Backend Environment Variables**:
   Create `.env` or set in `application.properties`:
   ```properties
   SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/your_db
   SPRING_DATASOURCE_USERNAME=your_username
   SPRING_DATASOURCE_PASSWORD=your_password
   openai.api.key=your_openai_key
   pinecone.api.key=your_pinecone_key
   youtube.api.key=your_youtube_key
   ```

### Running with Docker

```bash
# Start all services
cd rehabfit-backend/rehabfit/rehabfit
docker-compose up -d

# Frontend (separate terminal)
cd rehabfit-frontend
npm install
npm start
```

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

- **User Authentication**: Registration, login, Google OAuth
- **Progress Tracking**: Pain, mobility, and strength metrics with visualizations
- **AI Assistant**: Chatbot powered by OpenAI with RAG capabilities
- **Video Recommendations**: YouTube integration for exercise videos
- **Responsive Design**: Mobile-friendly interface with dark mode
- **Data Persistence**: PostgreSQL database with vector search via Pinecone

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/google` - Google OAuth login
- `GET /auth/me` - Get current user

### Progress Tracking
- `POST /api/progress` - Log progress entry
- `GET /api/rag/dashboard` - Get dashboard data

### AI & RAG
- `POST /api/rag/chat` - Chat with AI assistant
- `POST /api/rag/upsert-chat` - Store chat messages

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

