import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

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

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ GEMINI_API_KEY is not set in environment variables");
}

const ai = new GoogleGenAI({ apiKey });

app.post("/api/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing 'prompt' in request body" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // or your MODEL_NAME if you prefer
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    let base64 = null;

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) {
        base64 = part.inlineData.data;
        break;
      }
    }

    if (!base64) {
      console.error("No image inlineData returned from Gemini:", response);
      return res
        .status(500)
        .json({ error: "No image generated (possibly filtered by safety checks)." });
    }

    const imageUrl = `data:image/png;base64,${base64}`;
    res.json({ imageUrl });
  } catch (err) {
    console.error("Generation error:", err);
    res.status(500).json({ error: "Generation failed" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Backend server running on port ${PORT}`);
});
