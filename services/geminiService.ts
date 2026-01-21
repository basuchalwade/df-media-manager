import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

// Initialize client securely
const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generatePostContent = async (
  topic: string,
  platform: string,
  tone: string = 'Professional'
): Promise<string> => {
  if (!API_KEY) {
    console.warn("Gemini API Key missing. Returning mock data.");
    return `[MOCK] This is a simulated AI post about ${topic} for ${platform} with a ${tone} tone. Please configure API_KEY in .env to use real Gemini AI.`;
  }

  try {
    const prompt = `
      You are an expert social media manager using the PostMaster platform.
      Task: Write a ${tone.toLowerCase()} social media post about "${topic}".
      Platform: ${platform}.
      
      Constraints:
      - Language: English only
      - Tone: Positive, Motivational, Friendly
      - Topics allowed: Technology, Space, Sports, Movies
      - Length: Optimized for ${platform}
      - Include 2-3 relevant hashtags.
      - Do not include introductory text, just the post content.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }, // Disable thinking for faster content generation
      }
    });

    return response.text || "Failed to generate content.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating content. Please try again.";
  }
};

export const refinePostContent = async (
  currentContent: string,
  instruction: string
): Promise<string> => {
  if (!API_KEY) return `[MOCK] Refined: ${currentContent} | Instruction: ${instruction}`;

  try {
    const prompt = `
      Original Post: "${currentContent}"
      
      Instruction: Rewrite this post to be ${instruction}.
      Keep the core message but adjust the style/length/tone accordingly.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || currentContent;
  } catch (error) {
    console.error("Gemini Refine Error:", error);
    return currentContent;
  }
};
