import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(nextToken = token) {
    if (!nextToken) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await api.profile(nextToken);
      // depending on your backend shape: {user: {...}} or direct user
      setUser(data.user || data);
    } catch {
      // token invalid/expired
      localStorage.removeItem("token");
      setToken("");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email, password) {
    const data = await api.login({ email, password });
    const nextToken = data.access_token;
    localStorage.setItem("token", nextToken);
    setToken(nextToken);
    setUser(data.user);
  }

  async function register(payload) {
    const data = await api.register(payload);
    const nextToken = data.access_token;
    localStorage.setItem("token", nextToken);
    setToken(nextToken);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
  }

  const value = useMemo(
    () => ({ token, user, loading, login, register, logout, loadProfile }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
