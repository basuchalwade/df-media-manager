
import { Request, Response } from 'express';
import { PostService } from '../services/post.service';

const postService = new PostService();

export const getPosts = async (req: any, res: any) => {
  try {
    const posts = await postService.findAll(req.organizationId);
    res.json(posts);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const createPost = async (req: any, res: any) => {
  try {
    const post = await postService.createPost(req.organizationId, {
      content: req.body.content,
      platform: req.body.platforms[0], 
      status: req.body.status,
      scheduledFor: req.body.scheduledFor,
      metricsJson: {},
      botId: req.body.botId
    });
    res.json(post);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};
