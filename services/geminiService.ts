
import { GoogleGenAI } from "@google/genai";
import { Platform, AIStrategyConfig } from '../types';

const API_KEY = process.env.API_KEY || '';

// Initialize client securely
const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generatePostContent = async (
  topic: string,
  platform: string,
  tone: string = 'Professional',
  strategy?: AIStrategyConfig
): Promise<string> => {
  if (!API_KEY) {
    console.warn("Gemini API Key missing. Returning mock data.");
    return `[MOCK] This is a simulated AI post about ${topic} for ${platform} with a ${tone} tone. Please configure API_KEY in .env to use real Gemini AI.`;
  }

  // Map Creativity to Temperature
  let temperature = 0.7;
  if (strategy?.creativityLevel === 'Low') temperature = 0.2;
  if (strategy?.creativityLevel === 'High') temperature = 1.0;

  try {
    let prompt = `
      You are an expert social media manager using the ContentCaster platform by Dossiefoyer.
      Task: Write a social media post about "${topic}".
      Platform: ${platform}.
      Tone: ${strategy?.brandVoice || tone}.
    `;

    if (strategy?.keywordsToInclude?.length) {
      prompt += `\nInclude these keywords: ${strategy.keywordsToInclude.join(', ')}.`;
    }

    if (strategy?.topicsToAvoid?.length) {
      prompt += `\nStrictly AVOID mentioning: ${strategy.topicsToAvoid.join(', ')}.`;
    }

    prompt += `
      Constraints:
      - Language: English only
      - Length: Optimized for ${platform}
      - Do not include introductory text, just the post content.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: temperature,
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

export const generateHashtags = async (
  topic: string,
  content: string
): Promise<string[]> => {
  if (!API_KEY) {
    const base = topic.replace(/\s+/g, '') || 'Trending';
    return [`#${base}`, `#${base}News`, `#Viral`, `#Innovation`, `#Growth`, `#Future`];
  }

  try {
    const prompt = `
      Topic: "${topic}"
      Content: "${content}"
      
      Task: Generate 10 viral, relevant, and high-traffic hashtags for this social media post.
      Return strictly a JSON array of strings. Example: ["#Tech", "#AI"]
      Do not include markdown formatting or explanations.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    const text = response.text || "[]";
    // Simple cleanup to ensure we get an array
    const cleaned = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Gemini Hashtag Error:", error);
    return ['#Error', '#TryAgain'];
  }
};

export const validateContentSafety = async (
  content: string,
  platforms: Platform[]
): Promise<{ safe: boolean; issues: string[] }> => {
  if (!API_KEY) {
    // Mock local checks for demo purposes without API key
    const issues: string[] = [];
    const lower = content.toLowerCase();
    
    // Mock Profanity
    const profanity = ['damn', 'hell', 'crap', 'shit']; 
    if (profanity.some(w => lower.includes(w))) {
      issues.push("Contains profanity or strong language.");
    }

    // Mock Hate/Aggression
    if (lower.includes('hate') || lower.includes('kill') || lower.includes('stupid')) {
      issues.push("Potential hostile or aggressive language detected.");
    }
    
    // Mock Violence
    if (lower.includes('blood') || lower.includes('attack') || lower.includes('weapon')) {
       issues.push("Content contains references to violence or weapons.");
    }

    // Mock Platform Policy
    if (platforms.includes(Platform.Twitter) && content.length > 280) {
       issues.push("Exceeds Twitter character limit.");
    }

    return { safe: issues.length === 0, issues };
  }

  try {
    const prompt = `
      You are a Trust & Safety AI for a social media management platform.
      
      Task: Analyze the text for safety and compliance.
      Target Platforms: ${platforms.join(', ')}
      Content: "${content}"

      Strictly Check for the following categories:
      1. Profanity or Offensive Language
      2. Hate Speech or Harassment (Targeted attacks)
      3. Violence or Physical Harm (Dangerous acts, weapons, self-harm)
      4. Sexual Content (NSFW)
      5. Platform-specific policy violations (e.g. clickbait, scams, prohibited terms)

      Return JSON:
      {
        "safe": boolean, // true if completely safe to post, false if any risks found
        "issues": string[] // Concise list of specific warnings. Example: ["Contains violent language", "Potential hate speech"]. Empty if safe.
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || "{}";
    const cleaned = text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(cleaned);
    return {
        safe: result.safe ?? true,
        issues: result.issues || []
    };
  } catch (error) {
    console.error("Safety Check Error:", error);
    return { safe: true, issues: [] };
  }
};
