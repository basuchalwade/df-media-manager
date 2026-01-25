
import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initialize Gemini
// Ensure GEMINI_API_KEY is set in .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const generateContent = async (req: any, res: any) => {
  try {
    const { prompt, tone, platform, context } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Step A: Configure Model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Construct a context-aware system prompt
    const fullPrompt = `
      Platform: ${platform || 'General'}
      Tone: ${tone || 'Professional'}
      Context: ${JSON.stringify(context || {})}
      
      Task: ${prompt}
    `;

    // Step B: Generate Text
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    // Step C: Governance & Audit Logging (Critical)
    // We must record exactly what was asked and what was returned before the user sees it.
    await prisma.decisionAudit.create({
      data: {
        source: 'AI_MODEL',
        reasoning: `Content generation request for ${platform} (${tone})`,
        snapshot: {
          input_prompt: fullPrompt,
          raw_user_prompt: prompt,
          ai_response: text,
          model_used: "gemini-1.5-flash"
        },
        approvalStatus: 'PENDING' // Default state requiring review or explicit acceptance
      }
    });

    // Step D: Return Response
    res.json({ text });

  } catch (error: any) {
    console.error('[AI Controller] Generation failed:', error);
    
    // Log failure attempt if possible, or just return 500
    res.status(500).json({ 
      error: 'AI Generation failed', 
      details: error.message 
    });
  }
};
