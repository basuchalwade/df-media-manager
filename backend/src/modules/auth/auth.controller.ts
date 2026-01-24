
import { Request, Response } from 'express';
import { AuthService } from './auth.service';

const authService = new AuthService();

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    
    // Return standardized User object to frontend
    res.json({
      token: result.token,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        organizationId: result.user.organizationId
      }
    });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};
