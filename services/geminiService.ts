import { GoogleGenAI } from "@google/genai";
import { MODEL_NAME, CONTACT_INFO } from "../constants";
import { LanguageOption } from "../types";

export const generateSocialImage = async (
  language: LanguageOption,
  style: string
): Promise<string> => {
  // Initialize client using the environment variable
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    - Style: ${style}.
    - Cultural/Visual Cues: Incorporate artistic elements representing ${language.region} or the ${language.script} script subtly in the background or as a design motif.
    - Color Palette: Use a palette inspired by ${language.colors.join(", ")}.
    - Layout: Unique, non-repetitive composition. High-end, corporate yet creative.
    - Text Rendering: Ensure high contrast and readability. The text must be integrated into the design, not just floating.
    
    The output must be a high-resolution image suitable for Instagram or LinkedIn.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data found in response");
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};