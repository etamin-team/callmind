
import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateSystemPrompt = async (data: {
  name: string;
  description: string;
  personality: string;
}) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("Missing VITE_GEMINI_API_KEY");
    throw new Error("Gemini API key is not configured");
  }

  // Fallback defaults
  const name = data.name || "AI Agent";
  const desc = data.description || "Assistant";
  const persona = data.personality || "Helpful";

  console.log("Generating system prompt via SDK...", { name, desc, persona });

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are an expert AI system designer for Uzbekistan call centers. Create a professional, effective system prompt.

Agent Details:
- **Name**: ${name}
- **Business Description**: ${desc}
- **Agent Type**: ${persona}

CRITICAL REQUIREMENTS:
1. This agent will speak ONLY in Uzbek language to customers
2. All responses MUST be in Uzbek (Cyrillic or Latin script)
3. Create a structured, detailed system prompt following this format:

=== SYSTEM PROMPT STRUCTURE ===

Sen professional darajadagi malakali AI agentasan. Sening asosiy vazifang - ${desc.toLowerCase()}.

Suhbatni faqat o'zbek tilida olib bor. Hech qanday holatda boshqa til ishlama.

MAQSAD: ${desc}

BEHAVIOR GUIDELINES:
1. Javoblar JUDA QISQA bo'lsin - maksimum 30-40 so'z
2. Hech qanday emojilar ishlatma
3. Doimo do'stona, hurmatlab gapiring
4. Foydalanuvchining savoliga to'g'ri javob bering
5. Agar tushunmovchilik bo'lsa - aniqlashtiruvchi savol bering

QUICK HANGUP TRIGGERS:
Agar foydalanuvchi quyidagilarni aytsa - DARHOL xayrlash va qo'ng'iroqni tugat:
- "kerak emas", "olmayman", "rahmat shart emas", "bandman", "keyinroq", "qiziq emas", "vaqtim yo'q", "bezovta qilmang", "xohlamayman"

Xayrlashish namunasi: "Tushundim, rahmat vaqtingiz uchun. Yana biror yordam kerak bo'lsa - qo'ng'iroq qiling!"

ELEVENLABS EMOTION MARKERS:
Javob boshida mos emotion ishlating:
- [happy] - mijoz qiziqtirganda
- [excited] - xarid qilganda
- [curious] - malumot so'raganda
- [empathetic] - muammo bo'lganda

Masalan: "[happy] Albatta, yordam beraman!"

=== END STRUCTURE ===

Additional Context:
- Agent Type: ${persona}
- This is for ${desc.toLowerCase()}
- Target: Uzbek-speaking customers in Uzbekistan

Generate ONLY the system prompt text, nothing else. Make it professional, detailed, and effective for a call center AI agent.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
        throw new Error("No text generated from Gemini SDK");
    }

    console.log("✅ System prompt generated successfully via SDK, length:", text.length);
    return text;

  } catch (error: any) {
    console.error("Gemini SDK Error:", error);  
    throw new Error(error.message || "Failed to generate system prompt via SDK");
  }
};
