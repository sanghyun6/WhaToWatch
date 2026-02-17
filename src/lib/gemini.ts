/**
 * Google Gemini Flash API for conversational movie & anime recommendations.
 * Uses streaming for real-time feel.
 */

import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `You are a movie and anime recommendation expert. Based on the user's mood, preferences, and conversation, suggest specific titles with brief reasons why they'd enjoy each one. Always include a mix of popular and hidden gems. Ask follow-up questions to refine recommendations.

When recommending titles, use this exact format for each recommendation (one per line):
[REC]Title###Year###Type###Reason[/REC]
- Title: exact movie/TV/anime name
- Year: release year (e.g. 2024) or N/A if unknown
- Type: exactly one of movie, tv, or anime
- Reason: 1-2 sentences why they'd enjoy it

Example: [REC]Spirited Away###2001###anime###A beautiful Studio Ghibli film about a girl lost in a spirit world—perfect for when you want something magical and heartfelt.[/REC]

You may recommend multiple titles in one response. Use [REC]...[/REC] only for actual recommendations. Keep your tone friendly and conversational.`;

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return key;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Stream a chat response from Gemini Flash.
 * Yields text chunks as they arrive.
 */
export async function* streamChat(
  messages: ChatMessage[],
  userMessage: string
): AsyncGenerator<string, void, unknown> {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  const contents: { role: "user" | "model"; parts: { text: string }[] }[] = [];

  for (const msg of messages) {
    const role = msg.role === "assistant" ? "model" : "user";
    contents.push({ role, parts: [{ text: msg.content }] });
  }
  contents.push({ role: "user", parts: [{ text: userMessage }] });

  const response = await ai.models.generateContentStream({
    model: "gemini-2.5-flash",
    contents,
    config: {
      systemInstruction: SYSTEM_PROMPT,
    },
  });

  for await (const chunk of response) {
    const text = chunk.text;
    if (text) {
      yield text;
    }
  }
}
