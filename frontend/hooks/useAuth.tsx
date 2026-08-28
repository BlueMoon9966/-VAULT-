import { useEffect, useState } from 'react';
import api, { setAuthToken } from '../lib/api';

export default function useAuth() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      setAuthToken(token);
      // Optionally decode or fetch /me endpoint later
      setUser({ token });
    }
  }, []);

  function saveToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
      setAuthToken(token);
      setUser({ token });
    }
  }

  function logout() {
    localStorage.removeItem('accessToken');
    setAuthToken(null);
    // call backend logout to clear refresh cookie
    api.post('/api/auth/logout').catch(() => {});
    setUser(null);
  }

  return { user, saveToken, logout };
}
