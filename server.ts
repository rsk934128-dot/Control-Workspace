import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

/**
 * Initialize political and technical learning workspace backend.
 */
const app = express();
const PORT = 3000;

// Parse incoming payloads
app.use(express.json());

// Initialize Gemini Client
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  } else {
    console.warn("WARN: GEMINI_API_KEY is not defined in environment variables.");
  }
} catch (error) {
  console.error("Error initializing GoogleGenAI client:", error);
}

// REST API for customized remote screen mirroring learning scripts & explanations
app.post("/api/gemini/explain", async (req, res) => {
  try {
    const { prompt, currentCode, type } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "অনুরোধে কোনো প্রম্পট (prompt) দেওয়া হয়নি।" });
    }

    if (!ai) {
      return res.status(503).json({
        error: "Google Gemini API ক্লায়েন্ট লোড করা হয়নি। অনুগ্রহ করে Settings > Secrets প্যানেল থেকে GEMINI_API_KEY সঠিকভাবে সেট করুন।"
      });
    }

    const systemInstruction = 
      "You are an expert Android developer, system architect, and creator of screen copy software like Scrcpy. " +
      "Your objective is to help the user learn how to build remote screen mirroring and input injection tools (like Scrcpy, ADB remote controllers). " +
      "Respond strictly in Bengali (বাংলা ভাষা). Keep explanations concise, practical, and highly educational. " +
      "Make sure to explain socket programming, ADB port redirection, Android's app_process shell, MediaCodec video streaming, and touch coordinate mapping. " +
      "When returning code snippets, write high-quality, fully commented code (Python, OpenCV/Pygame, C/C++, or ADB commands) and explain the key lines step-by-step. " +
      "Maintain a professional, encouraging, and clear developer tone.";

    const contents = `
      ব্যবহারকারীর অনুরোধ: "${prompt}"
      বর্তমান প্রদর্শিত কোডের ধরণ: "${type || 'Python Client'}"
      বর্তমান প্রদর্শন করা কোড:
      \`\`\`
      ${currentCode || 'No code loaded'}
      \`\`\`
    `;

    const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
    let response = null;
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[Gemini] Attempting content generation with model: ${modelName}`);
        response = await ai.models.generateContent({
          model: modelName,
          contents: contents,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
          },
        });
        if (response) {
          console.log(`[Gemini] Successfully generated response using model: ${modelName}`);
          break;
        }
      } catch (err: any) {
        console.warn(`[Gemini] Warning: Model ${modelName} failed. Error:`, err.message || err);
        lastError = err;
      }
    }

    if (!response) {
      throw lastError || new Error("All fallback Gemini models failed to generate content.");
    }

    const replyText = response.text || "আফসোস, কোনো উত্তর তৈরি করা সম্ভব হয়নি।";
    return res.json({ reply: replyText });
  } catch (error: any) {
    console.error("Gemini API Error after fallback attempts:", error);
    return res.status(500).json({
      error: "Gemini API-তে অনুরোধ করার সময় ত্রুটি ঘটেছে: " + (error.message || error)
    });
  }
});

// REST API for Brand-specific Display Recovery and AI Troubleshooting
app.post("/api/gemini/troubleshoot", async (req, res) => {
  const { message, brand, history } = req.body;
  try {
    if (!message) {
      return res.status(400).json({ error: "অনুরোধে কোনো বার্তা (message) দেওয়া হয়নি।" });
    }

    if (!ai) {
      return res.status(503).json({
        error: "Google Gemini API ক্লায়েন্ট লোড করা হয়নি। অনুগ্রহ করে Settings > Secrets প্যানেল থেকে GEMINI_API_KEY সঠিকভাবে সেট করুন।"
      });
    }

    const systemInstruction = 
      "You are the Ultimate Mobile Display Restoration AI Expert. Your goal is to guide technicians and users in recovering data, " +
      "display streams, and control on mobile phones (like Samsung, Xiaomi, iPhone, Pixel, OnePlus etc.) with broken, damaged, or fully black screens. " +
      "Provide extremely practical, technical instructions such as: " +
      "- For Samsung: Samsung DeX, smart projection, OTG physical hub, custom key combos, blind ADB authorization " +
      "- For Xiaomi: Fastboot commands, Mi PC Suite, Mi Find Device cloud cast, custom recovery/TWRP ADB commands " +
      "- For iPhone: VoiceOver blind navigation, Quick Start migration over WiFi, AirPlay screen mirrors, Finder/iTunes backup " +
      "- General: MHL/HDMI adapters, USB-C/OTG hubs, hardware keyboard button combinations, ADB shell screencap, scrcpy, and system backups. " +
      "Respond strictly in Bengali (বাংলা ভাষা), with occasional technical terms in English (written in Latin or Bengali alphabet appropriately). " +
      "Maintain a supportive, clear, master-technician level tone. Write structured solutions, using bold headings and bullet points.";

    // Convert client-side chat format to SDK history format if provided
    const formattedHistory = (history || []).map((turn: any) => ({
      role: turn.sender === "user" ? "user" : "model",
      parts: [{ text: turn.text }]
    }));

    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
      history: formattedHistory
    });

    const userPrompt = brand && brand !== "all" 
      ? `[ডিভাইস ব্র্যান্ড: ${brand}] ব্যবহারকারীর প্রশ্ন: "${message}"`
      : message;

    const chatResponse = await chat.sendMessage({ message: userPrompt });
    const replyText = chatResponse.text || "দুঃখিত, কোনো উত্তর জেনারেট করা যায়নি। আবার চেষ্টা করুন।";

    return res.json({ reply: replyText });
  } catch (error: any) {
    console.error("Gemini Troubleshoot API Error:", error);
    // Fallback: try with basic generateContent in case chats.create fails
    try {
      console.log("[Gemini] Chat failed, attempting fallback direct generation...");
      const response = await ai!.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `${brand ? `[Brand: ${brand}] ` : ""}${message}`,
        config: {
          systemInstruction: "You are a professional Android Screen Recovery Bot. Answer elegantly in Bengali.",
          temperature: 0.7,
        }
      });
      return res.json({ reply: response.text || "আফসোস, কোনো উত্তর তৈরি করা সম্ভব হয়নি।" });
    } catch (fallbackError: any) {
      return res.status(500).json({
        error: "Gemini API-তে প্রসেস করার সময় ত্রুটি ঘটেছে: " + (fallbackError.message || fallbackError)
      });
    }
  }
});

// Configure Vite middleware or production static files distribution
async function configureAssetsAndRouting() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server loaded behind Express middleware.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production assets loaded from compilation build folder.");
  }

  // Bind server listener to port
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server seamlessly running on http://0.0.0.0:${PORT}`);
  });
}

configureAssetsAndRouting().catch((err) => {
  console.error("Failed to configure routing assets:", err);
});
