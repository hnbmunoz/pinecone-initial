# Transcribe Endpoint Example

This document shows a complete example of using the `/transcribe` endpoint with the JFK audio file.

## Test Request

```bash
curl -X POST http://localhost:3000/transcribe \
  -F "audio=@uploads/jfk.mp3" \
  -F "model=base" \
  -F "language=en"
```

## Expected Response (when whisper.cpp is properly installed)

```json
{
  "transcription": "And so, my fellow Americans, ask not what your country can do for you, ask what you can do for your country. My fellow citizens of the world, ask not what America will do for you, but what together we can do for the freedom of man.",
  "model": "base",
  "language": "en",
  "originalFilename": "jfk.mp3"
}
```

## Current Response (without whisper.cpp installed)

```json
{
  "error": "Failed to start transcription process",
  "details": "Make sure whisper.cpp is installed and accessible"
}
```

## Testing with Different Models

### Using tiny model (fastest, less accurate):
```bash
curl -X POST http://localhost:3000/transcribe \
  -F "audio=@uploads/jfk.mp3" \
  -F "model=tiny"
```

Expected response:
```json
{
  "transcription": "And so my fellow Americans ask not what your country can do for you ask what you can do for your country.",
  "model": "tiny",
  "language": "auto-detect",
  "originalFilename": "jfk.mp3"
}
```

### Using large model (most accurate, slowest):
```bash
curl -X POST http://localhost:3000/transcribe \
  -F "audio=@uploads/jfk.mp3" \
  -F "model=large" \
  -F "language=en"
```

Expected response:
```json
{
  "transcription": "And so, my fellow Americans, ask not what your country can do for you—ask what you can do for your country. My fellow citizens of the world, ask not what America will do for you, but what together we can do for the freedom of man.",
  "model": "large",
  "language": "en",
  "originalFilename": "jfk.mp3"
}
```

## Error Scenarios

### Invalid file format:
```bash
curl -X POST http://localhost:3000/transcribe \
  -F "audio=@uploads/document.pdf"
```

Response:
```json
{
  "error": "Only audio files are allowed!"
}
```

### Invalid model:
```bash
curl -X POST http://localhost:3000/transcribe \
  -F "audio=@uploads/jfk.mp3" \
  -F "model=invalid"
```

Response:
```json
{
  "error": "Invalid model. Use: tiny, base, small, medium, or large"
}
```

### Missing audio file:
```bash
curl -X POST http://localhost:3000/transcribe \
  -F "model=base"
```

Response:
```json
{
  "error": "No audio file provided"
}
```

## Setup Required

To get the actual transcription results, you need to:

1. Install whisper.cpp following the instructions in `WHISPER_SETUP.md`
2. Download the required model files
3. Ensure the whisper.cpp executable is accessible from the project directory

Once properly set up, the endpoint will return accurate transcriptions of the JFK speech audio file.