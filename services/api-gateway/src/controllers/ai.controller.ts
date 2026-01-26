
import { Request, Response } from 'express';
import { AiService } from '../services/ai.service';

const aiService = new AiService();

export const generate = async (req: any, res: any) => {
  try {
    const { prompt, platform, tone } = req.body;
    const result = await aiService.generateContent(prompt, platform, tone);
    res.json({ content: result });
  } catch (error: any) {
    console.error('AI Generate Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const variants = async (req: any, res: any) => {
  try {
    const { prompt, platform, tone } = req.body;
    const result = await aiService.generateVariants(prompt, platform);
    res.json(result);
  } catch (error: any) {
    console.error('AI Variants Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const safety = async (req: any, res: any) => {
  try {
    const { content } = req.body;
    const result = await aiService.checkSafety(content);
    res.json(result);
  } catch (error: any) {
    console.error('AI Safety Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const generateImage = async (req: any, res: any) => {
  try {
    const { prompt, aspectRatio, size } = req.body;
    const imageBase64 = await aiService.generateImage(prompt, aspectRatio, size);
    res.json({ url: imageBase64 });
  } catch (error: any) {
    console.error('AI Image Gen Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const editImage = async (req: any, res: any) => {
  try {
    const { image, prompt } = req.body;
    const imageBase64 = await aiService.editImage(image, prompt);
    res.json({ url: imageBase64 });
  } catch (error: any) {
    console.error('AI Image Edit Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const generateVideo = async (req: any, res: any) => {
  try {
    const { image, prompt, aspectRatio } = req.body;
    // Set timeout to 5 mins as video gen is slow
    req.setTimeout(300000); 
    const videoBase64 = await aiService.generateVideo(image, prompt, aspectRatio);
    res.json({ url: videoBase64 });
  } catch (error: any) {
    console.error('AI Video Gen Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const chat = async (req: any, res: any) => {
    try {
        const { message, history } = req.body;
        const response = await aiService.chat(message, history || []);
        res.json({ text: response });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
