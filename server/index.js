import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai"; // 👈 FIXED NAME

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "https://enuncia-web-services.github.io", // your GitHub Pages origin
    methods: ["POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// 👇 Read API key from environment (Render env var)
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenAI({
  apiKey,       // your Gemini key
  vertexai: false, // using Gemini Developer API, not Vertex
});

// POST /api/generate  — adjust logic as per your app needs
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing 'prompt' in request body" });
    }

    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    // `response.text` is a function in the new SDK
    const text = response.text;

    // Some versions expose it as a method: if needed, use
    // const text = response.text();

    res.json({ text });
  } catch (err) {
    console.error("Generation error:", err);
    res.status(500).json({ error: "Generation failed" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Backend server running on port ${PORT}`);
});
