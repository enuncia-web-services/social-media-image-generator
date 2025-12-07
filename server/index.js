import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/genai";

dotenv.config();

const app = express();

// 👇 Allow your GitHub Pages site to call this backend
app.use(
  cors({
    origin: "https://enuncia-web-services.github.io",
    methods: ["POST"],
    allowedHeaders: ["Content-Type"]
  })
);

app.use(express.json());

// 👇 IMPORTANT: key is read ONLY from environment variable
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey);

// Example endpoint: generate text / captions / whatever your app does
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing 'prompt' in request body" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

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
