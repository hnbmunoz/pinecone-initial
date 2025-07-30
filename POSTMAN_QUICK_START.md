# Postman Quick Start Guide for Transcribe API

## 🚀 Quick Setup (5 minutes)

### 1. Import Collection
1. Open Postman
2. Click **Import** button
3. Select **Upload Files**
4. Choose `transcribe-api-tests.postman_collection.json`
5. Click **Import**

### 2. Set Base URL
The collection uses `http://localhost:3000` by default. If your server runs on a different port, update the `base_url` variable:
1. Click on the collection name
2. Go to **Variables** tab
3. Update `base_url` value if needed

### 3. Test Server Connection
Run the **Health Check** request first to ensure your server is running:
- Expected response: `{"status": "OK", "application": "PineCone App", ...}`

## 📁 Test Audio Files

### Quick Test Files
You can use these online resources for test audio:
- **Short Speech**: Record a 10-second voice memo on your phone
- **Sample Audio**: Download from [freesound.org](https://freesound.org) (free account required)
- **Text-to-Speech**: Use online TTS services to generate test audio

### Supported Formats
✅ MP3, WAV, M4A, FLAC, OGG, WEBM, MP4  
❌ PDF, TXT, JPG, PNG (will return error)

## 🧪 Essential Tests to Run

### Test 1: Basic Functionality
**Request:** `1. Basic Transcription (Minimal Parameters)`
- Upload any audio file
- Leave other fields empty
- Should return transcription with default settings

### Test 2: Error Handling
**Request:** `5. Missing Audio File`
- Don't upload any file
- Should return 400 error: "No audio file provided"

### Test 3: Model Validation
**Request:** `6. Invalid Model`
- Upload audio file
- Set model to "invalid_model"
- Should return 400 error about invalid model

## 📊 Expected Responses

### ✅ Success Response (200)
```json
{
  "transcription": "Your transcribed text here...",
  "model": "base",
  "language": "auto-detect",
  "originalFilename": "your-file.mp3"
}
```

### ❌ Error Responses (400/500)
```json
{
  "error": "No audio file provided"
}
```

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| Connection refused | Start server: `npm run dev` |
| File upload fails | Ensure file is selected in form-data |
| 500 error with whisper | Whisper.cpp not installed (see WHISPER_SETUP.md) |
| Timeout | Use smaller audio files (<5MB) |

## ⚡ Quick Test Sequence

1. **Health Check** → Verify server is running
2. **Basic Transcription** → Test core functionality
3. **Missing Audio File** → Test error handling
4. **Invalid Model** → Test validation

## 🎯 Performance Testing

### Model Speed Comparison (same audio file):
- **Tiny**: ~5-15 seconds (fastest)
- **Base**: ~10-30 seconds (balanced)
- **Large**: ~30-120 seconds (most accurate)

### File Size Guidelines:
- **Small files** (<1MB): All models work well
- **Medium files** (1-10MB): Use base or smaller models
- **Large files** (>10MB): Consider using tiny model first

## 📝 Notes

- **Without whisper.cpp**: You'll get installation error messages
- **With whisper.cpp**: You'll get actual transcriptions
- **File cleanup**: Server automatically deletes uploaded files after processing
- **Rate limiting**: No built-in limits, but be mindful of server resources

## 🔗 Related Files

- [`POSTMAN_TESTING_GUIDE.md`](POSTMAN_TESTING_GUIDE.md) - Comprehensive testing guide
- [`WHISPER_SETUP.md`](WHISPER_SETUP.md) - Whisper.cpp installation instructions
- [`TRANSCRIBE_EXAMPLE.md`](TRANSCRIBE_EXAMPLE.md) - cURL examples and expected outputs

---

**Ready to test?** Import the collection and start with the Health Check! 🎉