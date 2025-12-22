import React, { createContext, useEffect, useState } from "react";
import { loginApi } from "../api/auth.api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // cookie based → assume logged out initially
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    await loginApi(credentials);

    // backend cookie set kar deta hai
    setUser({ isAuthenticated: true });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}
