# Whisper.cpp Integration Setup

This document explains how to set up whisper.cpp for the transcribe endpoint.

## Prerequisites

1. **Install whisper.cpp**
   ```bash
   git clone https://github.com/ggerganov/whisper.cpp.git
   cd whisper.cpp
   make
   ```

2. **Download Whisper Models**
   ```bash
   # Download the base model (recommended for general use)
   bash ./models/download-ggml-model.sh base
   
   # Or download other models as needed:
   # bash ./models/download-ggml-model.sh tiny    # Fastest, least accurate
   # bash ./models/download-ggml-model.sh small   # Good balance
   # bash ./models/download-ggml-model.sh medium  # Better accuracy
   # bash ./models/download-ggml-model.sh large   # Best accuracy, slowest
   ```

3. **Project Structure**
   Make sure your project structure looks like this:
   ```
   your-project/
   ├── whisper.cpp/
   │   ├── main (executable)
   │   └── models/
   │       ├── ggml-base.bin
   │       ├── ggml-tiny.bin
   │       └── ... (other model files)
   ├── uploads/ (created automatically)
   ├── app.js
   └── package.json
   ```

## API Usage

### Endpoint: POST /transcribe

**Parameters:**
- `audio` (file, required): Audio file to transcribe
- `model` (string, optional): Whisper model to use (tiny, base, small, medium, large). Default: 'base'
- `language` (string, optional): Language code (e.g., 'en', 'es', 'fr'). Auto-detect if not specified.

**Supported Audio Formats:**
- MP3, WAV, M4A, FLAC, OGG, WebM, MP4

**Example using curl:**
```bash
curl -X POST http://localhost:3000/transcribe \
  -F "audio=@your-audio-file.mp3" \
  -F "model=base" \
  -F "language=en"
```

**Example Response:**
```json
{
  "transcription": "Hello, this is a test transcription.",
  "model": "base",
  "language": "en",
  "originalFilename": "test-audio.mp3"
}
```

## Troubleshooting

1. **"Failed to start transcription process"**
   - Make sure whisper.cpp is compiled and the `main` executable exists
   - Verify the whisper.cpp directory is in the correct location

2. **"Transcription failed"**
   - Check if the specified model file exists in `whisper.cpp/models/`
   - Verify the audio file format is supported
   - Check server logs for detailed error messages

3. **File size limits**
   - Current limit is 100MB per file
   - For larger files, consider splitting them or increasing the limit in the code

## Performance Notes

- **tiny**: Fastest processing, lowest accuracy
- **base**: Good balance of speed and accuracy (recommended)
- **small**: Better accuracy, slower processing
- **medium**: High accuracy, significantly slower
- **large**: Best accuracy, slowest processing

Choose the model based on your accuracy vs. speed requirements.