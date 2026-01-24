
import { Request, Response } from 'express';
import * as PrismaPkg from '@prisma/client';
import { StorageService } from '../services/StorageService';

const { PrismaClient } = PrismaPkg as any;
const prisma = new PrismaClient();
const storage = new StorageService();

export const getMedia = async (req: Request, res: Response) => {
  const media = await prisma.mediaAsset.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(media);
};

export const uploadMedia = async (req: Request, res: Response) => {
  try {
    if (!req.file) throw new Error('No file uploaded');
    
    const url = await storage.uploadFile(req.file);
    const type = req.file.mimetype.startsWith('video') ? 'Video' : 'Image';

    const asset = await prisma.mediaAsset.create({
      data: {
        url,
        type,
        size: req.file.size,
        width: 0, // In prod, use sharp to get dims
        height: 0,
        thumbnailUrl: type === 'Image' ? url : null // Simple mock for now
      }
    });

    res.json(asset);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};