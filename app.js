const express = require("express");
const swaggerUi = require("swagger-ui-express");
const { Pinecone } = require("@pinecone-database/pinecone");
const { OpenAI } = require("openai");
const { CohereClient } = require("cohere-ai");


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
  // controllerHostUrl: process.env.PINECONE_HOST,
});
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


const index = pinecone.Index("sample-movies");

app.use(express.json());

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
    }

  },
};

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));



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

    // Query Pinecone index
    // const queryResponse = await index.query({
    //   topK: 10,
    //   vector,
    //   includeMetadata: true,
    // });
    if (!vector) {
      res.status(500).json({ errors: `"No embedding vector returned."` });
      return
      // throw new Error("No embedding vector returned.");
    }

    const queryResponse = await index.query({
      topK: 10,
      // vector: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8],
      vector: vector,
      includeValues: false,
      includeMetadata: true,
    });
    console.log("Just Log1")
    res.json(queryResponse);
  } catch (error) {
    console.error("Error querying Pinecone:", error);
    res.status(500).json({ errors: `${error}` });
  }
});

app.get("/healthcheck", (req, res) => {
  // const response = await cohere.embed({
  //   texts: ["Test String"],
  //   model: 'embed-english-v3.0', // or embed-english-light-v3.1
  //   inputType: 'search_document', // or 'search_query', depending on use case
  // });
  res.status(200).send({
    status: "OK",
    application: "PineCone App",
    timeStamp: new Date()
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
