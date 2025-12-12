import { GoogleGenAI, Chat, GenerateContentResponse, Content } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { Message } from "../types";

let chatSession: Chat | null = null;

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

// Start a chat, optionally passing history to restore context
export const startChat = (historyMessages: Message[] = []) => {
  const ai = getClient();
  
  // Convert app specific Message type to Gemini API Content type
  const history: Content[] = historyMessages.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));

  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    history: history,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
    },
  });
};

export const sendMessageToGemini = async function* (message: string) {
  if (!chatSession) {
    startChat();
  }

  if (!chatSession) {
    throw new Error("Failed to initialize chat session.");
  }

  try {
    const result = await chatSession.sendMessageStream({ message });
    
    for await (const chunk of result) {
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        yield c.text;
      }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    yield "দুঃখিত, একটি যান্ত্রিক ত্রুটি হয়েছে। সংযোগ পরীক্ষা করুন।";
  }
};