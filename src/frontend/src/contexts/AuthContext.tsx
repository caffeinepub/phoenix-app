import { type ReactNode, createContext, useContext, useState } from "react";

export interface UserData {
  email: string;
  phone: string;
  countryCode: string;
  displayName: string;
  password: string;
}

interface AuthContextType {
  currentUser: UserData | null;
  registeredUsers: UserData[];
  login: (email: string, password: string) => boolean;
  register: (user: UserData) => void;
  logout: () => void;
  updateProfile: (data: Partial<UserData>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<UserData[]>([]);

  const login = (email: string, password: string): boolean => {
    const user = registeredUsers.find(
      (u) => u.email === email && u.password === password,
    );
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const register = (user: UserData) => {
    setRegisteredUsers((prev) => [
      ...prev.filter((u) => u.email !== user.email),
      user,
    ]);
    setCurrentUser(user);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateProfile = (data: Partial<UserData>) => {
    if (currentUser) {
      const updated = { ...currentUser, ...data };
      setCurrentUser(updated);
      setRegisteredUsers((prev) =>
        prev.map((u) => (u.email === currentUser.email ? updated : u)),
      );
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        registeredUsers,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
