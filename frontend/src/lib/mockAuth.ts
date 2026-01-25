
import { api } from '../services/api';

export const isAuthenticated = () => {
  return !!localStorage.getItem('cc_auth_token');
};

export const login = async (email: string, pass: string) => {
  try {
    const data = await api.login(email, pass);
    if (data.token) {
        localStorage.setItem('cc_auth_token', data.token);
        localStorage.setItem('postmaster_user', JSON.stringify(data.user));
        return true;
    }
    return false;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const logout = () => {
  localStorage.removeItem('cc_auth_token');
  localStorage.removeItem('postmaster_user');
  window.location.reload();
};
