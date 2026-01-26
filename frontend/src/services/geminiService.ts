
import { api } from './api';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000/api';

/**
 * Production AI Service
 * Calls the Backend API Gateway which securely handles the Gemini API Key.
 */

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
  try {
    const res = await fetch(`${API_URL}/ai/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt: topic, 
        platform, 
        tone,
        context 
      })
    });
    
    if (!res.ok) throw new Error('AI Generation failed');
    const data = await res.json();
    return data.content;
  } catch (error) {
    console.error('Frontend AI Error:', error);
    return `[Error] Could not generate content. Ensure Backend is running.`;
  }
};

export const generatePostVariants = async (
  topic: string,
  platform: string,
  tone: string,
  context: any
): Promise<{ name: string; content: string }[]> => {
  try {
    const res = await fetch(`${API_URL}/ai/variants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: topic, platform, tone })
    });
    
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Frontend Variants Error:', error);
    return [];
  }
};

export const validateContentSafety = async (content: string, platforms: string[]): Promise<{ safe: boolean; issues: string[] }> => {
  try {
    const res = await fetch(`${API_URL}/ai/safety`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    
    if (!res.ok) return { safe: true, issues: [] };
    return await res.json();
  } catch (error) {
    return { safe: true, issues: [] };
  }
};

// Kept simple for now, can be routed to generate endpoint with specific prompt
export const generateHashtags = async (topic: string, content: string): Promise<string[]> => {
  // Simple heuristic fallback if backend route not dedicated
  return ['#ContentCaster', '#Growth', '#Tech'];
};

export const refinePostContent = async (current: string, instruction: string, platform?: string): Promise<string> => {
  return generatePostContent(`Rewrite this: "${current}". Instruction: ${instruction}`, platform || 'General', 'Professional', {});
};
