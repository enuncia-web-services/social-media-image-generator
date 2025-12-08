const MODEL = "gemini-2.5-flash-image"; // 👈 image-capable model

app.post("/api/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing 'prompt' in request body" });
    }

    console.log("📝 Received prompt:", prompt.substring(0, 80) + "...");
    console.log("🧠 Using model:", MODEL);

    // No aspect ratio / imageConfig here – let the model decide.
    const result = await ai.models.generateContent({
      model: MODEL,
      contents: [prompt],
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
      console.error(
        "❌ No inlineData image returned by Gemini:",
        JSON.stringify(result, null, 2)
      );
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
