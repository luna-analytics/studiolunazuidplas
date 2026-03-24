import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  credits: number;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async (token: string) => {
    const res = await fetch(`${BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Sessie verlopen");
    return (await res.json()) as AuthUser;
  };

  const refreshUser = async () => {
    const token = localStorage.getItem("sl_token");
    if (!token) { setUser(null); return; }
    try {
      const u = await fetchMe(token);
      setUser(u);
    } catch {
      localStorage.removeItem("sl_token");
      setUser(null);
    }
  };

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Inloggen mislukt");
    localStorage.setItem("sl_token", data.token);
    setUser(data.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await fetch(`${BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Registreren mislukt");
    localStorage.setItem("sl_token", data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("sl_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function getToken() {
  return localStorage.getItem("sl_token");
}
