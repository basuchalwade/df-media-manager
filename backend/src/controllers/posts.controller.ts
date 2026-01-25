
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
    const post = await postService.createPost(req.organizationId, req.body);
    res.json(post);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const updatePost = async (req: any, res: any) => {
    try {
        const post = await postService.updatePost(req.organizationId, req.params.id, req.body);
        res.json(post);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};

export const deletePost = async (req: any, res: any) => {
    try {
        await postService.deletePost(req.organizationId, req.params.id);
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};
