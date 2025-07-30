# Whisper.cpp Transcription API - Deployment Guide

## Overview

This guide explains how to deploy the transcription API with whisper.cpp in various environments, ensuring the "Failed to start transcription process" error is resolved.

## Prerequisites

### System Requirements
- Node.js 16+ 
- Git
- C++ compiler (gcc/clang)
- CMake (for building whisper.cpp)
- Make

### For Different Operating Systems

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install build-essential cmake git nodejs npm
```

#### CentOS/RHEL
```bash
sudo yum groupinstall "Development Tools"
sudo yum install cmake git nodejs npm
```

#### macOS
```bash
# Install Xcode command line tools
xcode-select --install
# Install Node.js and npm via Homebrew
brew install node
```

## Installation Steps

### 1. Clone and Setup the Project
```bash
git clone <your-repo-url>
cd <your-project-directory>
npm install
```

### 2. Install and Compile Whisper.cpp
```bash
# Clone whisper.cpp
git clone https://github.com/ggerganov/whisper.cpp.git
cd whisper.cpp

# Compile whisper.cpp
make

# Download required models
bash ./models/download-ggml-model.sh base
# Optional: Download other models
# bash ./models/download-ggml-model.sh tiny    # Fastest
# bash ./models/download-ggml-model.sh small   # Good balance
# bash ./models/download-ggml-model.sh medium  # Better accuracy
# bash ./models/download-ggml-model.sh large   # Best accuracy

cd ..
```

### 3. Configure Environment Variables

Create or update your `.env` file:
```env
NODE_ENV=production

# Your existing API keys
PINECONE_API=your_pinecone_api_key
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
COHERE_API_KEY=your_cohere_api_key

# Whisper.cpp Configuration
WHISPER_PATH=./whisper.cpp/build/bin/whisper-cli
WHISPER_MODELS_PATH=./whisper.cpp/models
```

### 4. Verify Installation
Test that whisper.cpp is working:
```bash
# Test whisper directly
./whisper.cpp/build/bin/whisper-cli -m ./whisper.cpp/models/ggml-base.bin -f ./uploads/jfk.wav

# Test via API
curl -X POST http://localhost:3000/transcribe \
  -F "audio=@uploads/jfk.wav" \
  -F "model=base"
```

## Deployment Configurations

### Docker Deployment

Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine

# Install build dependencies
RUN apk add --no-cache \
    build-base \
    cmake \
    git \
    bash

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Build whisper.cpp
RUN git clone https://github.com/ggerganov/whisper.cpp.git && \
    cd whisper.cpp && \
    make && \
    bash ./models/download-ggml-model.sh base

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3000

CMD ["npm", "start"]
```

### Environment-Specific Configurations

#### Development
```env
WHISPER_PATH=./whisper.cpp/build/bin/whisper-cli
WHISPER_MODELS_PATH=./whisper.cpp/models
```

#### Production (Linux Server)
```env
WHISPER_PATH=/opt/app/whisper.cpp/build/bin/whisper-cli
WHISPER_MODELS_PATH=/opt/app/whisper.cpp/models
```

#### Production (Docker)
```env
WHISPER_PATH=/app/whisper.cpp/build/bin/whisper-cli
WHISPER_MODELS_PATH=/app/whisper.cpp/models
```

## Troubleshooting

### Common Issues and Solutions

#### 1. "Failed to start transcription process"
**Cause**: Whisper executable not found or not executable
**Solutions**:
- Verify whisper.cpp is compiled: `ls -la whisper.cpp/build/bin/whisper-cli`
- Check executable permissions: `chmod +x whisper.cpp/build/bin/whisper-cli`
- Verify environment variables are set correctly
- Check the path in your `.env` file matches the actual location

#### 2. "Model file not found"
**Cause**: Whisper model files not downloaded
**Solutions**:
- Download models: `cd whisper.cpp && bash ./models/download-ggml-model.sh base`
- Verify model files exist: `ls -la whisper.cpp/models/ggml-*.bin`
- Check WHISPER_MODELS_PATH environment variable

#### 3. "Permission denied" errors
**Cause**: Insufficient file permissions
**Solutions**:
- Make whisper executable: `chmod +x whisper.cpp/build/bin/whisper-cli`
- Check directory permissions: `chmod 755 whisper.cpp/build/bin/`
- Ensure uploads directory is writable: `chmod 755 uploads/`

#### 4. Compilation errors
**Cause**: Missing build dependencies
**Solutions**:
- Install build tools (see Prerequisites section)
- Update CMake: `cmake --version` (should be 3.12+)
- Clean and rebuild: `cd whisper.cpp && make clean && make`

### Performance Optimization

#### Model Selection
- **tiny**: Fastest, least accurate (~39 MB)
- **base**: Good balance (~148 MB) - **Recommended for production**
- **small**: Better accuracy (~488 MB)
- **medium**: High accuracy (~1.5 GB)
- **large**: Best accuracy (~3.1 GB)

#### Resource Requirements
- **Memory**: 2-8 GB depending on model size
- **CPU**: Multi-core recommended for faster processing
- **Storage**: 500 MB - 4 GB for models
- **Network**: Sufficient bandwidth for file uploads

## Production Checklist

- [ ] Whisper.cpp compiled successfully
- [ ] Required models downloaded
- [ ] Environment variables configured
- [ ] File permissions set correctly
- [ ] API endpoint tested
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Resource limits set
- [ ] Backup strategy for models
- [ ] Monitoring setup

## API Usage

### Endpoint: POST /transcribe

**Parameters:**
- `audio` (file, required): Audio file to transcribe
- `model` (string, optional): Model to use (tiny, base, small, medium, large)
- `language` (string, optional): Language code (auto-detect if not specified)

**Example:**
```bash
curl -X POST http://your-domain.com/transcribe \
  -F "audio=@audio-file.mp3" \
  -F "model=base" \
  -F "language=en"
```

**Response:**
```json
{
  "transcription": "Transcribed text here",
  "model": "base",
  "language": "en",
  "originalFilename": "audio-file.mp3"
}
```

## Security Considerations

1. **File Upload Limits**: Current limit is 100MB per file
2. **File Type Validation**: Only audio files are accepted
3. **Temporary File Cleanup**: Files are automatically deleted after processing
4. **Rate Limiting**: Consider implementing rate limiting for production
5. **Authentication**: Add authentication for production use

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Test whisper.cpp directly before testing the API
4. Check server logs for detailed error messages