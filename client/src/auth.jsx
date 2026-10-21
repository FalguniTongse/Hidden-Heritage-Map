import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api.js';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('hhm_user')); } catch { return null; } });
  const [users, setUsers] = useState([]);
  useEffect(() => { api.get('/users').then(setUsers).catch(() => {}); }, []);
  const login = async (userId) => { const u = await api.post('/login', { userId }); localStorage.setItem('hhm_user', JSON.stringify(u)); setUser(u); };
  const register = async (name) => { const u = await api.post('/register', { name }); localStorage.setItem('hhm_user', JSON.stringify(u)); setUser(u); setUsers(await api.get('/users')); };
  const logout = () => { localStorage.removeItem('hhm_user'); setUser(null); };
  return <Ctx.Provider value={{ user, users, login, register, logout }}>{children}</Ctx.Provider>;
}
