# Postman Testing Guide for Transcribe Endpoint

This guide provides comprehensive instructions for testing the `/transcribe` endpoint using Postman.

## Overview

The transcribe endpoint uses whisper.cpp to convert audio files to text. It accepts various audio formats and provides configurable transcription options.

**Endpoint:** `POST http://localhost:3000/transcribe`  
**Content-Type:** `multipart/form-data`

## Prerequisites

1. **Server Running:** Ensure the Node.js server is running on `http://localhost:3000`
2. **Audio Files:** Have test audio files ready (mp3, wav, m4a, flac, ogg, webm, mp4)
3. **Whisper.cpp Setup:** For actual transcription results, whisper.cpp must be installed (see WHISPER_SETUP.md)

## Basic Test Setup in Postman

### 1. Create New Request
1. Open Postman
2. Click "New" → "Request"
3. Name: "Transcribe Audio"
4. Method: `POST`
5. URL: `http://localhost:3000/transcribe`

### 2. Configure Request Body
1. Go to "Body" tab
2. Select "form-data"
3. Add the following key-value pairs:

| Key | Type | Value | Required | Description |
|-----|------|-------|----------|-------------|
| `audio` | File | [Select audio file] | ✅ Yes | Audio file to transcribe |
| `model` | Text | `base` | ❌ No | Whisper model (tiny, base, small, medium, large) |
| `language` | Text | `en` | ❌ No | Language code (auto-detect if omitted) |

## Test Scenarios

### Test 1: Basic Transcription (Minimal Parameters)

**Setup:**
- Method: `POST`
- URL: `http://localhost:3000/transcribe`
- Body (form-data):
  - `audio`: [Upload an audio file]

**Expected Response (200 OK):**
```json
{
  "transcription": "Transcribed text content here...",
  "model": "base",
  "language": "auto-detect",
  "originalFilename": "your-audio-file.mp3"
}
```

### Test 2: Transcription with Specific Model

**Setup:**
- Method: `POST`
- URL: `http://localhost:3000/transcribe`
- Body (form-data):
  - `audio`: [Upload an audio file]
  - `model`: `tiny`

**Expected Response (200 OK):**
```json
{
  "transcription": "Transcribed text content...",
  "model": "tiny",
  "language": "auto-detect",
  "originalFilename": "your-audio-file.mp3"
}
```

### Test 3: Transcription with Language Specification

**Setup:**
- Method: `POST`
- URL: `http://localhost:3000/transcribe`
- Body (form-data):
  - `audio`: [Upload an audio file]
  - `model`: `base`
  - `language`: `en`

**Expected Response (200 OK):**
```json
{
  "transcription": "Transcribed text content...",
  "model": "base",
  "language": "en",
  "originalFilename": "your-audio-file.mp3"
}
```

### Test 4: All Parameters

**Setup:**
- Method: `POST`
- URL: `http://localhost:3000/transcribe`
- Body (form-data):
  - `audio`: [Upload an audio file]
  - `model`: `large`
  - `language`: `en`

**Expected Response (200 OK):**
```json
{
  "transcription": "High-quality transcribed text content...",
  "model": "large",
  "language": "en",
  "originalFilename": "your-audio-file.mp3"
}
```

## Error Testing Scenarios

### Test 5: Missing Audio File

**Setup:**
- Method: `POST`
- URL: `http://localhost:3000/transcribe`
- Body (form-data):
  - `model`: `base`
  - (No audio file)

**Expected Response (400 Bad Request):**
```json
{
  "error": "No audio file provided"
}
```

### Test 6: Invalid File Format

**Setup:**
- Method: `POST`
- URL: `http://localhost:3000/transcribe`
- Body (form-data):
  - `audio`: [Upload a non-audio file like .txt, .pdf, .jpg]

**Expected Response (400 Bad Request):**
```json
{
  "error": "Only audio files are allowed!"
}
```

### Test 7: Invalid Model

**Setup:**
- Method: `POST`
- URL: `http://localhost:3000/transcribe`
- Body (form-data):
  - `audio`: [Upload an audio file]
  - `model`: `invalid_model`

**Expected Response (400 Bad Request):**
```json
{
  "error": "Invalid model. Use: tiny, base, small, medium, or large"
}
```

### Test 8: File Too Large

**Setup:**
- Method: `POST`
- URL: `http://localhost:3000/transcribe`
- Body (form-data):
  - `audio`: [Upload a file larger than 100MB]

**Expected Response (400 Bad Request):**
```json
{
  "error": "File too large"
}
```

### Test 9: Whisper.cpp Not Installed

**Setup:**
- Method: `POST`
- URL: `http://localhost:3000/transcribe`
- Body (form-data):
  - `audio`: [Upload an audio file]
- **Note:** This occurs when whisper.cpp is not properly installed

**Expected Response (500 Internal Server Error):**
```json
{
  "error": "Failed to start transcription process",
  "details": "Make sure whisper.cpp is installed and accessible"
}
```

## Model Performance Comparison Tests

### Test 10: Speed vs Accuracy Comparison

Create multiple requests with the same audio file but different models:

1. **Tiny Model** (Fastest, least accurate)
   - `model`: `tiny`
   
2. **Base Model** (Balanced)
   - `model`: `base`
   
3. **Small Model** (Better accuracy)
   - `model`: `small`
   
4. **Medium Model** (High accuracy)
   - `model`: `medium`
   
5. **Large Model** (Highest accuracy, slowest)
   - `model`: `large`

## Postman Collection Setup

### Environment Variables
Create a Postman environment with:
- `base_url`: `http://localhost:3000`
- `transcribe_endpoint`: `{{base_url}}/transcribe`

### Pre-request Scripts
Add this to automatically set timestamps:
```javascript
pm.environment.set("timestamp", new Date().toISOString());
```

### Test Scripts
Add these test scripts to validate responses:

```javascript
// Test for successful response
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Test response structure
pm.test("Response has required fields", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('transcription');
    pm.expect(jsonData).to.have.property('model');
    pm.expect(jsonData).to.have.property('language');
    pm.expect(jsonData).to.have.property('originalFilename');
});

// Test transcription is not empty
pm.test("Transcription is not empty", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.transcription).to.not.be.empty;
});

// Test model validation
pm.test("Model is valid", function () {
    const jsonData = pm.response.json();
    const validModels = ['tiny', 'base', 'small', 'medium', 'large'];
    pm.expect(validModels).to.include(jsonData.model);
});
```

## Sample Audio Files for Testing

### Recommended Test Files:
1. **Short Speech** (10-30 seconds) - For quick testing
2. **Long Speech** (2-5 minutes) - For performance testing
3. **Multiple Languages** - For language detection testing
4. **Different Formats** - MP3, WAV, M4A, etc.
5. **Various Quality Levels** - High/low bitrate files

### Creating Test Audio Files:
You can use online text-to-speech services or record short audio clips for testing purposes.

## Troubleshooting

### Common Issues:

1. **Server Not Running**
   - Error: Connection refused
   - Solution: Start the server with `npm run dev`

2. **File Upload Issues**
   - Error: Various file-related errors
   - Solution: Ensure file is properly selected in form-data

3. **Whisper.cpp Issues**
   - Error: "Failed to start transcription process"
   - Solution: Follow WHISPER_SETUP.md instructions

4. **Large File Timeouts**
   - Error: Request timeout
   - Solution: Use smaller files or increase timeout settings

## Performance Benchmarking

### Metrics to Track:
- **Response Time** by model type
- **Accuracy** comparison between models
- **File Size** vs processing time
- **Memory Usage** during processing

### Postman Performance Testing:
1. Use Postman Runner for batch testing
2. Set up data files with different audio samples
3. Monitor response times across different models
4. Document accuracy vs speed trade-offs

## Integration with CI/CD

### Automated Testing:
```bash
# Run Postman collection via Newman
newman run transcribe-tests.postman_collection.json \
  -e production.postman_environment.json \
  --reporters cli,json \
  --reporter-json-export results.json
```

## Security Testing

### Test Cases:
1. **File Type Validation** - Upload malicious files
2. **File Size Limits** - Test boundary conditions
3. **Parameter Injection** - Test with special characters
4. **Rate Limiting** - Multiple rapid requests

This comprehensive guide should help you thoroughly test the transcribe endpoint using Postman across various scenarios and edge cases.