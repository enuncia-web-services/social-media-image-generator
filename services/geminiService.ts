// src/services/geminiService.ts
import { CONTACT_INFO } from "../constants";
import { LanguageOption } from "../types";

// 👇 Put your Render backend URL here (no trailing slash)
const BACKEND_URL = "https://enuncia-social-backend.onrender.com";

type GenerateResponse = {
  imageUrl: string;
};

export const generateSocialImage = async (
  language: LanguageOption,
  style: string
): Promise<string> => {
  const prompt = `
    Create a professional, visually stunning social media image (1:1 aspect ratio) for a company called "${CONTACT_INFO.brand}".
    
    TEXT REQUIREMENTS (Must be visible and legible):
    1. Main Headline: "${language.name}" (Make this the largest, most dominant text).
    2. Sub-brand: "${CONTACT_INFO.brand}".
    3. Contact Details (Smaller, clean layout):
       - Phone: "${CONTACT_INFO.phone}"
       - Email: "${CONTACT_INFO.email}"
       - Website: "${CONTACT_INFO.website}"

    DESIGN DIRECTION:
    - Style: ${style || "Use a modern, social-media-friendly design."}.
    - Cultural/Visual Cues: Incorporate artistic elements representing ${language.region} or the ${language.script} script subtly in the background or as a design motif.
    - Color Palette: Use a palette inspired by ${language.colors.join(", ")}.
    - Layout: Unique, non-repetitive composition. High-end, corporate yet creative.
    - Text Rendering: Ensure high contrast and readability. The text must be integrated into the design, not just floating.
    
    The output must be a high-resolution image suitable for Instagram or LinkedIn.
  `;

  // 👇 USE the constant, do NOT hardcode the URL
  const response = await fetch(`${BACKEND_URL}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error("Backend error:", text);
    throw new Error(
      text || `Backend error: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as GenerateResponse;

  if (!data.imageUrl) {
    throw new Error("Backend did not return imageUrl.");
  }

  return data.imageUrl;
};
