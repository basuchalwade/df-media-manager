
export const isAuthenticated = () => {
  return localStorage.getItem('cc_auth_token') === 'mock-token-valid';
};

export const login = async (email: string, pass: string) => {
  // Mock login delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  if (email && pass) {
    localStorage.setItem('cc_auth_token', 'mock-token-valid');
    localStorage.setItem('postmaster_user', JSON.stringify({
        id: '1',
        name: 'Admin User',
        email: email,
        role: 'Admin'
    }));
    return true;
  }
  return false;
};

export const logout = () => {
  localStorage.removeItem('cc_auth_token');
  window.location.reload();
};
