# Pinecone Initial

A Node.js application that demonstrates vector search capabilities using Pinecone database with multiple AI embedding services including OpenAI, Google Gemini, and Cohere.

## Description

This project is a REST API that integrates with Pinecone vector database to perform semantic search on movie data. It supports multiple embedding models and provides a Swagger UI for API documentation and testing.

## Features

- **Vector Search**: Semantic search using Pinecone vector database
- **Multiple AI Providers**: Support for OpenAI, Google Gemini, and Cohere embeddings
- **Movie Database**: Sample implementation with movie data
- **API Documentation**: Interactive Swagger UI documentation
- **Health Check**: System status monitoring endpoint

## Prerequisites

Before running this application, make sure you have:

- Node.js (v14 or higher)
- npm or yarn package manager
- API keys for the following services:
  - Pinecone Database
  - OpenAI (optional)
  - Google Gemini (optional)
  - Cohere AI

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pinecone-initial
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your API keys:
```env
PINECONE_API=your_pinecone_api_key
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
COHERE_API_KEY=your_cohere_api_key
```

## Usage

### Development Mode

Start the development server with auto-reload:
```bash
npm run dev
```

### Production Mode

Start the server:
```bash
node app.js
```

The server will start on `http://localhost:3000`

## API Endpoints

### Movies
- **GET** `/movies` - Search movies using vector embeddings
  - Returns similar movies based on semantic search

### Health Check
- **GET** `/healthcheck` - Check application status
  - Returns system status and timestamp

### API Documentation
- **GET** `/api-docs` - Interactive Swagger UI documentation

## Configuration

### Pinecone Setup

The application expects a Pinecone index named `sample-movies`. Make sure to:

1. Create a Pinecone index with the appropriate dimensions:
   - OpenAI `text-embedding-3-small`: 1536 dimensions
   - Google Gemini `embedding-001`: 768 dimensions
   - Cohere `embed-english-v3.0`: 1024 dimensions

2. Update the index name in [`app.js`](app.js:26) if different:
```javascript
const index = pinecone.Index("your-index-name");
```

### Embedding Models

The application currently uses Cohere's embedding model by default. You can switch between different providers by modifying the embedding generation code in the [`/movies`](app.js:91) endpoint.

## Project Structure

```
pinecone-initial/
├── app.js              # Main application file
├── package.json        # Project dependencies and scripts
├── .env               # Environment variables (not tracked)
├── README.md          # Project documentation
└── package-lock.json  # Dependency lock file
```

## Dependencies

### Core Dependencies
- **express**: Web framework for Node.js
- **@pinecone-database/pinecone**: Pinecone vector database client
- **@google/generative-ai**: Google Gemini AI client
- **openai**: OpenAI API client
- **cohere-ai**: Cohere AI client
- **dotenv**: Environment variable management

### Development Dependencies
- **nodemon**: Development server with auto-reload

### Documentation
- **swagger-jsdoc**: Swagger documentation generator
- **swagger-ui-express**: Swagger UI middleware

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PINECONE_API` | Pinecone API key | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Optional |
| `GEMINI_API_KEY` | Google Gemini API key | Optional |
| `COHERE_API_KEY` | Cohere API key | Yes (current default) |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Submit a pull request

## License

ISC License

## Support

For questions or issues, please check the API documentation at `http://localhost:3000/api-docs` when the server is running.