
import { Request, Response } from 'express';
import * as PrismaPkg from '@prisma/client';
import { StorageService } from '../services/StorageService';
import { mediaProcessorQueue } from '../queues';
import { v4 as uuidv4 } from 'uuid';

const { PrismaClient, Platform } = PrismaPkg as any;
const prisma = new PrismaClient();
const storage = new StorageService();

export const getMedia = async (req: any, res: any) => {
  const media = await prisma.mediaAsset.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(media);
};

export const uploadMedia = async (req: any, res: any) => {
  try {
    if (!req.file) throw new Error('No file uploaded');
    
    const url = await storage.uploadFile(req.file);
    const type = req.file.mimetype.startsWith('video') ? 'Video' : 'Image';

    const asset = await prisma.mediaAsset.create({
      data: {
        url,
        type,
        size: req.file.size,
        width: 0, 
        height: 0,
        thumbnailUrl: type === 'Image' ? url : null 
      }
    });

    // Enqueue Processing Job
    // We assume we want to process for all supported platforms
    if (req.organizationId) {
        await mediaProcessorQueue.add('process-new-upload', {
            tenantId: req.organizationId,
            mediaAssetId: asset.id,
            targetPlatforms: ['Twitter', 'LinkedIn', 'Instagram'], // Default target set
            traceId: uuidv4()
        });
    }

    res.json(asset);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};
