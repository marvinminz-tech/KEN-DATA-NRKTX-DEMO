import React, { createContext, useContext, useState, ReactNode } from "react";
import { User, UserRole, USERS } from "@/data/mockData";

interface AuthContextType {
  currentUser: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
  isManager: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  login: () => {},
  logout: () => {},
  isManager: false,
  isAdmin: false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const login = (role: UserRole) => {
    const user = USERS.find((u) => u.role === role) || USERS[0];
    setCurrentUser(user);
  };

  const logout = () => setCurrentUser(null);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout,
        isManager: currentUser?.role === "Manager",
        isAdmin: currentUser?.role === "Admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
