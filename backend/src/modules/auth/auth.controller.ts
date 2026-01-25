
import { AuthService } from './auth.service';
const authService = new AuthService();

export const login = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json({
      token: result.token,
      user: result.user
    });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};
