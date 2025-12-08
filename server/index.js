import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "https://enuncia-web-services.github.io", // GitHub Pages frontend
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// -------------------------------
// 🔑 Load API Key from environment
// -------------------------------
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ GEMINI_API_KEY is NOT set in Render environment variables!");
} else {
  console.log("✅ GEMINI_API_KEY loaded. Length:", apiKey.length);
}

// Initialize Gemini client
const ai = new GoogleGenAI({ apiKey });

// -------------------------------
// 🌐 Health Check Route
// -------------------------------
app.get("/", (req, res) => {
  res.send("✅ Enuncia backend is running. Use POST /api/generate");
});

// -------------------------------
// 🔍 Debug: Check Key Presence
// -------------------------------
app.get("/debug-key", (req, res) => {
  if (!apiKey) {
    return res.json({ hasKey: false, length: 0 });
  }
  res.json({ hasKey: true, length: apiKey.length });
});

// -------------------------------
// 🎨 MAIN ROUTE: Generate Image
// -------------------------------
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing 'prompt' in request body" });
    }

    console.log("📝 Received prompt:", prompt.substring(0, 50) + "...");

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    // Extract base64 image from response
    let base64Image = null;
    const parts = result?.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {
      if (part.inlineData?.data) {
        base64Image = part.inlineData.data;
        break;
      }
    }

    if (!base64Image) {
      console.error("❌ No inlineData returned by Gemini");
      return res.status(500).json({
        error:
          "No image returned from Gemini API. It may have been filtered or the model had an issue.",
      });
    }

    const imageUrl = `data:image/png;base64,${base64Image}`;
    return res.json({ imageUrl });

  } catch (err) {
    console.error("❌ Generation Error:", err.response?.data || err.message || err);
    return res.status(500).json({
      error: "Generation failed. Check backend logs.",
      details: err.message,
    });
  }
});

// -------------------------------
// 🚀 Start Server
// -------------------------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
