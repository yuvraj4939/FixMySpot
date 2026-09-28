import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem("fixmyspot_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem("fixmyspot_user");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("fixmyspot_token");
    if (!token) {
      setLoading(false);
      return;
    }

    api.me()
      .then(({ user: currentUser }) => {
        setUser(currentUser);
        localStorage.setItem("fixmyspot_user", JSON.stringify(currentUser));
      })
      .catch(() => {
        localStorage.removeItem("fixmyspot_token");
        localStorage.removeItem("fixmyspot_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    localStorage.setItem("fixmyspot_token", data.token);
    localStorage.setItem("fixmyspot_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const data = await api.register(payload);
    localStorage.setItem("fixmyspot_token", data.token);
    localStorage.setItem("fixmyspot_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("fixmyspot_token");
    localStorage.removeItem("fixmyspot_user");
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
