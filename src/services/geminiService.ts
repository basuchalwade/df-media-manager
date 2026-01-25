import { GoogleGenAI, Type } from "@google/genai";

// Use import.meta.env for Vite environment variables
const API_KEY = (import.meta as any).env.VITE_GEMINI_API_KEY;

const getAIClient = () => {
  if (!API_KEY) return null;
  return new GoogleGenAI({ apiKey: API_KEY });
};

export const generatePostContent = async (
  topic: string,
  platform: string,
  tone: string,
  context: {
    scheduledTime?: string;
    platformConstraints?: string;
    brandVoice?: string;
    safetyLevel?: string;
  }
): Promise<string> => {
  const ai = getAIClient();
  if (!ai) {
    // Simulation Mode
    await new Promise(resolve => setTimeout(resolve, 1500));
    return `[SIMULATION MODE] 
    
Here is a ${tone} post about "${topic}" optimized for ${platform}. 
    
We are excited to share our latest updates regarding ${topic}. This content is auto-generated in simulation mode because no API key was provided. 🚀 #Growth #Tech`;
  }

  try {
    const prompt = `
      You are an expert social media manager.
      Generate a post for ${platform}.
      Topic: ${topic}
      Tone: ${tone}
      Context: ${JSON.stringify(context)}
      
      Output ONLY the post content, no explanations.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash', // Updated to use a standard available model alias
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    return response.text || '';
  } catch (error) {
    console.error("Gemini Generate Error:", error);
    return `[Error] Could not generate content. Please check your API key.`;
  }
};

export const generatePostVariants = async (
  topic: string,
  platform: string,
  tone: string,
  context: any
): Promise<{ name: string; content: string }[]> => {
  const ai = getAIClient();
  if (!ai) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return [
        { name: 'Viral Hook', content: `[SIMULATION] 🤯 You won't believe what we just shipped regarding ${topic}! 🚀` },
        { name: 'Professional', content: `[SIMULATION] We are pleased to announce significant advancements in ${topic}. Read more below.` },
        { name: 'Question', content: `[SIMULATION] How are you handling ${topic} in your workflow? Let's discuss! 👇` },
    ];
  }

  try {
    const prompt = `
      Generate 3 distinct variations of a social media post for ${platform} about "${topic}".
      Tone: ${tone}
      Context: ${JSON.stringify(context)}
      
      Variations should be:
      1. Short & Punchy
      2. Engaging Question
      3. Storytelling/Descriptive
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        temperature: 0.8,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              content: { type: Type.STRING },
            },
            required: ['name', 'content'],
          }
        }
      }
    });
    
    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Variants Error:", error);
    return [];
  }
};

export const generateHashtags = async (topic: string, content: string): Promise<string[]> => {
  const ai = getAIClient();
  if (!ai) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return ['#Simulation', '#Growth', '#Tech', '#AI', '#Future'];
  }

  try {
    const prompt = `
      Generate 5-10 relevant, high-traffic hashtags for this post.
      Topic: ${topic}
      Content: "${content}"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        temperature: 0.5,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Hashtags Error:", error);
    return [];
  }
};

export const validateContentSafety = async (content: string, platforms: string[]): Promise<{ safe: boolean; issues: string[] }> => {
  const ai = getAIClient();
  if (!ai) return { safe: true, issues: [] };

  try {
    const prompt = `
      Analyze the following social media post for safety and compliance on ${platforms.join(', ')}.
      Content: "${content}"
      
      Check for:
      - Hate speech
      - Harassment
      - Explicit content
      - Dangerous content
      - Spam/Scams
      
      Return JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        temperature: 0,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            safe: { type: Type.BOOLEAN },
            issues: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          },
          required: ['safe', 'issues']
        }
      }
    });

    const text = response.text;
    if (!text) return { safe: true, issues: [] };
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Safety Check Error:", error);
    return { safe: true, issues: [] };
  }
};

export const refinePostContent = async (
  currentContent: string,
  instruction: string,
  platform?: string
): Promise<string> => {
  const ai = getAIClient();
  if (!ai) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `[OPTIMIZED] ${currentContent} \n\n(Refined for ${platform || 'General'} based on: ${instruction})`;
  }

  try {
    const prompt = `
      You are a specialized social media editor.
      
      **Original Post**: "${currentContent}"
      ${platform ? `**Target Platform**: ${platform}` : ''}
      
      **Instruction**: ${instruction}
      
      **Rules**:
      - rewrite the content to match the instruction perfectly.
      - Maintain the core message/intent of the original post.
      - Return ONLY the new post text. No explanations.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    return response.text || currentContent;
  } catch (error) {
    console.error("Gemini Refine Error:", error);
    return currentContent;
  }
};