
import { Request, Response } from 'express';
import { PostRepository } from '../repos/PostRepository';

const repo = new PostRepository();

export const getPosts = async (req: Request, res: Response) => {
  const posts = await repo.findAll();
  res.json(posts);
};

export const createPost = async (req: Request, res: Response) => {
  try {
    const post = await repo.create({
      content: req.body.content,
      platform: req.body.platforms[0], // MVP: Single platform
      status: req.body.status,
      scheduledFor: req.body.scheduledFor,
      metricsJson: {},
    });
    res.json(post);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};
