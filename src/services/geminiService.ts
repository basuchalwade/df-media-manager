
import { GoogleGenAI } from "@google/genai";

// Access key from local storage or env
const getApiKey = () => localStorage.getItem('cc_gemini_key') || (import.meta as any).env.VITE_GEMINI_KEY;

export const generatePostContent = async (
  topic: string,
  platform: string,
  tone: string
): Promise<string> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    // Simulation Fallback
    await new Promise(r => setTimeout(r, 1500));
    return `[MOCK AI] Here is a ${tone} post about ${topic} optimized for ${platform}. #ContentCaster`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Write a ${tone} social media post for ${platform} about: ${topic}. strict character limit for the platform.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });
    
    return response.text || "Error generating text.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Failed to connect to AI service.";
  }
};
