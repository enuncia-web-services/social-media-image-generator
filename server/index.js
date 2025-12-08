app.post("/api/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing 'prompt' in request body" });
    }

    console.log("📝 Received prompt:", prompt.substring(0, 80) + "...");

    // Use an image-capable model
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash", // 👈 key change
      contents: [prompt],
      config: {
        // Newer image models don't always need explicit imageConfig,
        // but we can keep it if supported. If this still errors, remove this config block.
        responseModalities: ["IMAGE"],
      },
    });

    let base64Image = null;
    const parts = result?.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {
      if (part.inlineData?.data) {
        base64Image = part.inlineData.data;
        break;
      }
    }

    if (!base64Image) {
      console.error("❌ No inlineData image returned by Gemini:", JSON.stringify(result, null, 2));
      return res.status(500).json({
        error:
          "No image returned from Gemini API. It may have been filtered or the model had an issue.",
      });
    }

    const imageUrl = `data:image/png;base64,${base64Image}`;
    return res.json({ imageUrl });
  } catch (err) {
    console.error("❌ Generation Error:", err?.response?.data || err.message || err);
    return res.status(500).json({
      error: "Generation failed. Check backend logs.",
      details: err?.message,
    });
  }
});
