const express = require("express");
const swaggerUi = require("swagger-ui-express");
const { Pinecone } = require("@pinecone-database/pinecone");
const { OpenAI } = require("openai");
const { CohereClient } = require("cohere-ai");
const multer = require("multer");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
const port = 3000;
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

// Pinecone configuration
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API,
});
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


const index = pinecone.Index("sample-movies");

app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/') ||
        file.originalname.match(/\.(mp3|wav|m4a|flac|ogg|webm|mp4)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Swagger setup
const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Pinecone API",
    version: "1.0.0",
    description: "API to interact with Pinecone database",
  },
  paths: {
    "/movies": {
      get: {
        summary: "Get all movies",
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      title: { type: "string" },
                      genre: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/healthcheck": {
      get: {
        summary: "Get all health check",
        tags: ["System"],
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "string",
                  
                },
              },
            },
          },
        },
      }
    },
    "/transcribe": {
      post: {
        summary: "Transcribe audio file using whisper.cpp",
        tags: ["Audio"],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  audio: {
                    type: "string",
                    format: "binary",
                    description: "Audio file to transcribe (mp3, wav, m4a, flac, ogg, webm, mp4)"
                  },
                  model: {
                    type: "string",
                    description: "Whisper model to use (optional, defaults to 'base')",
                    enum: ["tiny", "base", "small", "medium", "large"]
                  },
                  language: {
                    type: "string",
                    description: "Language code (optional, auto-detect if not specified)"
                  }
                },
                required: ["audio"]
              }
            }
          }
        },
        responses: {
          200: {
            description: "Successful transcription",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    transcription: { type: "string" },
                    duration: { type: "number" },
                    model: { type: "string" },
                    language: { type: "string" }
                  }
                }
              }
            }
          },
          400: {
            description: "Bad request - invalid file or parameters"
          },
          500: {
            description: "Internal server error"
          }
        }
      }
    }

  },
};

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));



// Transcribe endpoint
app.post("/transcribe", upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    const audioFile = req.file;
    const model = req.body.model || 'base';
    const language = req.body.language;
    
    // Validate model
    const validModels = ['tiny', 'base', 'small', 'medium', 'large'];
    if (!validModels.includes(model)) {
      // Clean up uploaded file
      fs.unlinkSync(audioFile.path);
      return res.status(400).json({ error: "Invalid model. Use: tiny, base, small, medium, or large" });
    }

    // Get whisper executable path from environment or use default
    const whisperPath = process.env.WHISPER_PATH || './whisper.cpp/bin/whisper-cli';
    const modelsPath = process.env.WHISPER_MODELS_PATH || './whisper.cpp/models';
    
    // Build whisper command
    const whisperArgs = [
      '-m', path.join(modelsPath, `ggml-${model}.bin`), // Model path
      '-f', audioFile.path, // Input file
      '--output-txt', // Output as text
      '--no-timestamps' // Remove timestamps for cleaner output
    ];

    // Add language if specified
    if (language) {
      whisperArgs.push('-l', language);
    }

    // Execute whisper.cpp
    const whisperProcess = spawn(whisperPath, whisperArgs);
    
    let transcription = '';
    let errorOutput = '';

    whisperProcess.stdout.on('data', (data) => {
      transcription += data.toString();
    });

    whisperProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    whisperProcess.on('close', (code) => {
      // Clean up uploaded file
      fs.unlinkSync(audioFile.path);
      
      // Also clean up any generated text files
      const txtFile = audioFile.path + '.txt';
      if (fs.existsSync(txtFile)) {
        const fileContent = fs.readFileSync(txtFile, 'utf8');
        transcription = fileContent.trim();
        fs.unlinkSync(txtFile);
      }

      if (code === 0) {
        res.json({
          transcription: transcription.trim(),
          model: model,
          language: language || 'auto-detect',
          originalFilename: audioFile.originalname
        });
      } else {
        console.error('Whisper error:', errorOutput);
        res.status(500).json({
          error: "Transcription failed",
          details: errorOutput || "Unknown error occurred"
        });
      }
    });

    whisperProcess.on('error', (error) => {
      console.error('Failed to start whisper process:', error);
      // Clean up uploaded file
      fs.unlinkSync(audioFile.path);
      res.status(500).json({
        error: "Failed to start transcription process",
        details: "Make sure whisper.cpp is installed and accessible"
      });
    });

  } catch (error) {
    console.error('Transcription error:', error);
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

app.get("/movies", async (req, res) => {
  // Test this next
  //   So if you're using:

  // OpenAI (text-embedding-3-small) → dimension 1536

  // Gemini (embedding-001) → dimension 768

  // Cohere → usually 768 or 1024

  // You must configure Pinecone's index to match the model you're embedding with.

  try {
    // Generate vector embedding using OpenAI
    // const embeddingResponse = await openai.embeddings.create({
    //   model: "text-embedding-3-small", // or whatever matches your index dimension
    //   input: "",
    // });

    // const vector = embeddingResponse.data[0].embedding;
    // const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });
    // const embeddingResponse = await embeddingModel.embedContent({
    //   content: { parts: [{ text: "" }] },
    // });

    // const vector = embeddingResponse.embedding.values;

    const movieRecord = {
      id: "13",
      title: "Barbie",
      year: 2023,
      genre: "Fantasy/Adventure",
      boxOffice: 1441724962,
      summary:
        "A live-action film centered around Barbie and her adventures in the real world, after being expelled from Barbieland for not being perfect enough. Margot Robbie stars as the iconic doll.",
    };
    
    const movieText = `
    Title: ${movieRecord.title}
    Year: ${movieRecord.year}
    Genre: ${movieRecord.genre}
    Box Office: $${movieRecord.boxOffice}
    Summary: ${movieRecord.summary}
    `.trim();
    
    const response = await cohere.embed({
      texts: [movieText],
      model: 'embed-english-v3.0', // or embed-english-light-v3.1
      inputType: 'search_document', // or 'search_query', depending on use case
    });
  
    console.log('response ', response?.body)
    const vector = response?.embeddings[0]; 

   
    if (!vector) {
      res.status(500).json({ errors: `"No embedding vector returned."` });
      return
    }

    const queryResponse = await index.query({
      topK: 10,
      vector: vector,
      includeValues: false,
      includeMetadata: true,
    });
    res.json(queryResponse);
  } catch (error) {
    console.error("Error querying Pinecone:", error);
    res.status(500).json({ errors: `${error}` });
  }
});

app.get("/healthcheck", (req, res) => {
  res.status(200).send({
    status: "OK",
    application: "PineCone App",
    timeStamp: new Date()
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
