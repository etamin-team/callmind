import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config/environment.js";

export interface TranscriptAnalysis {
  sentiment: "positive" | "negative" | "neutral";
  summary: string;
  callerName: string | null;
  topics: string[];
  status: "completed" | "missed" | "failed";
  notes: string;
}

export class TranscriptAnalysisService {
  private static genAI: GoogleGenerativeAI | null = null;

  private static getClient(): GoogleGenerativeAI {
    if (!this.genAI) {
      if (!config.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured");
      }
      this.genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
    }
    return this.genAI;
  }

  static async analyzeTranscript(
    transcript: string,
    duration?: number,
    agentName?: string,
  ): Promise<TranscriptAnalysis> {
    if (!transcript || transcript.trim().length === 0) {
      return {
        sentiment: "neutral",
        summary: "No transcript available",
        callerName: null,
        topics: [],
        status: "completed",
        notes: "",
      };
    }

    const genAI = this.getClient();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Analyze this call center transcript and extract structured information.

TRANSCRIPT:
"""
${transcript}
"""

${agentName ? `AGENT NAME: ${agentName}` : ""}

Analyze and respond with ONLY valid JSON (no markdown, no code blocks):
{
  "sentiment": "positive" | "negative" | "neutral",
  "summary": "Brief 1-2 sentence summary of what the call was about",
  "callerName": "Extracted caller name or null if not mentioned",
  "topics": ["array", "of", "main", "topics", "discussed"],
  "status": "completed" | "missed" | "failed",
  "notes": "Key points, action items, or important details from the call"
}

Rules:
- sentiment: overall emotional tone of the conversation
- status: "completed" if call ended normally, "missed" if caller hung up early, "failed" if there were issues
- topics: max 5 main topics
- notes: bullet points of important information, action items, or follow-ups needed
- If the caller seemed frustrated or angry, sentiment should be "negative"
- If the caller was happy or satisfied, sentiment should be "positive"
- Otherwise "neutral"

Respond with ONLY the JSON object, nothing else.`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in response");
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        sentiment: ["positive", "negative", "neutral"].includes(
          parsed.sentiment,
        )
          ? parsed.sentiment
          : "neutral",
        summary: parsed.summary || "No summary available",
        callerName: parsed.callerName || null,
        topics: Array.isArray(parsed.topics) ? parsed.topics.slice(0, 5) : [],
        status: ["completed", "missed", "failed"].includes(parsed.status)
          ? parsed.status
          : "completed",
        notes: parsed.notes || "",
      };
    } catch (error) {
      console.error("Transcript analysis error:", error);
      return {
        sentiment: "neutral",
        summary: "Failed to analyze transcript",
        callerName: null,
        topics: [],
        status: "completed",
        notes: "",
      };
    }
  }
}
