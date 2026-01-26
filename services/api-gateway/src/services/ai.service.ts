
import { GoogleGenAI, Type } from "@google/genai";
import { Buffer } from "buffer";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export class AiService {
  
  async generateContent(prompt: string, platform: string, tone: string) {
    const systemInstruction = `
      You are an expert social media manager.
      Platform: ${platform}
      Tone: ${tone}
      
      Generate engaging post content based on the user prompt. 
      Output ONLY the post text. No introductory filler.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || '';
  }

  async generateVariants(prompt: string, platform: string) {
    const fullPrompt = `
      Generate 3 distinct variations of a social media post for ${platform} about "${prompt}".
      Variations should be:
      1. Short & Punchy
      2. Engaging Question
      3. Storytelling/Descriptive
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: fullPrompt,
      config: {
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

    return JSON.parse(response.text || '[]');
  }

  async checkSafety(content: string) {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this social media post for safety/policy issues: "${content}". Return JSON.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            safe: { type: Type.BOOLEAN },
            issues: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          }
        }
      }
    });

    return JSON.parse(response.text || '{"safe": true, "issues": []}');
  }

  // --- Image Generation (Gemini 3 Pro Image) ---
  async generateImage(prompt: string, aspectRatio: string = "1:1", imageSize: "1K" | "2K" | "4K" = "1K") {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: imageSize
        }
      }
    });

    // Extract Base64 from response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  }

  // --- Image Editing (Gemini 2.5 Flash Image - "Banana") ---
  async editImage(imageBase64: string, prompt: string) {
    // Strip header if present
    const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|webp);base64,/, "");
    const mimeType = imageBase64.match(/^data:(image\/[a-z]+);base64,/)?.[1] || 'image/png';

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          { text: prompt }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No edited image returned");
  }

  // --- Video Generation (Veo) ---
  async generateVideo(imageBase64: string | undefined, prompt: string, aspectRatio: '16:9' | '9:16' = '16:9') {
    let operation;

    if (imageBase64) {
        // Image-to-Video
        const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|webp);base64,/, "");
        const mimeType = imageBase64.match(/^data:(image\/[a-z]+);base64,/)?.[1] || 'image/png';

        operation = await ai.models.generateVideos({
          model: 'veo-3.1-fast-generate-preview',
          prompt: prompt || "Animate this image cinematically",
          image: {
            imageBytes: base64Data,
            mimeType: mimeType
          },
          config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio
          }
        });
    } else {
        // Text-to-Video
        operation = await ai.models.generateVideos({
          model: 'veo-3.1-fast-generate-preview',
          prompt: prompt, 
          config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio
          }
        });
    }

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("Video generation failed");

    // Fetch the actual bytes (requires API Key)
    const videoResponse = await fetch(`${videoUri}&key=${process.env.GEMINI_API_KEY}`);
    const videoBuffer = await videoResponse.arrayBuffer();
    const videoBase64 = Buffer.from(videoBuffer).toString('base64');
    
    return `data:video/mp4;base64,${videoBase64}`;
  }

  // --- Chat (Gemini 3 Pro) ---
  async chat(message: string, history: any[]) {
    // Basic chat implementation
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [...history, { role: 'user', parts: [{ text: message }] }],
    });
    return response.text;
  }
}
