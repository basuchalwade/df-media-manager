
import { Request, Response } from 'express';
import { mockDb } from '../data/mockDb';
import { v4 as uuidv4 } from 'uuid';

export const getMedia = (req: Request, res: Response) => {
  res.json(mockDb.media);
};

export const uploadMedia = (req: Request, res: Response) => {
  // Mock upload logic
  const newMedia = {
    id: uuidv4(),
    url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0',
    type: 'image',
    size: 500000,
    governance: { status: 'pending' },
    createdAt: new Date().toISOString()
  };
  mockDb.media.unshift(newMedia);
  res.status(201).json(newMedia);
};
