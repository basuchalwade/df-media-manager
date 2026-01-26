
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export class WorkerAiService {
  /**
   * Generates a single social media post based on topics.
   */
  async generateDraft(topics: string[], platform: string) {
    if (!process.env.GEMINI_API_KEY) return "AI Key missing. Simulation draft.";

    try {
      const topic = topics[Math.floor(Math.random() * topics.length)] || 'Industry Trends';
      
      const prompt = `
        Act as a professional social media manager.
        Platform: ${platform}
        Topic: ${topic}
        
        Write a single, engaging post (max 280 chars for Twitter/X, longer for LinkedIn).
        Include 2-3 relevant hashtags.
        Output ONLY the post content.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
        config: {
          temperature: 0.8,
        }
      });

      return response.text || '';
    } catch (error) {
      console.error('Worker AI Error:', error);
      return `Failed to generate content about ${topics[0]}`;
    }
  }
}
