import { type ReactNode, createContext, useContext, useState } from "react";

export interface UserData {
  email: string;
  phone: string;
  countryCode: string;
  displayName: string;
  password: string;
  bankName?: string;
  ibanNumber?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  currentUser: UserData | null;
  registeredUsers: UserData[];
  login: (email: string, password: string) => boolean;
  register: (user: UserData) => void;
  logout: () => void;
  deleteAccount: () => void;
  updateProfile: (data: Partial<UserData>) => void;
}

const STORAGE_KEY = "phoenix_users";
const SESSION_KEY = "phoenix_session";

function loadUsers(): UserData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UserData[]) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: UserData[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch {}
}

function loadSession(): UserData | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as UserData) : null;
  } catch {
    return null;
  }
}

function saveSession(user: UserData | null) {
  try {
    if (user) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  } catch {}
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [registeredUsers, setRegisteredUsers] = useState<UserData[]>(loadUsers);
  const [currentUser, setCurrentUser] = useState<UserData | null>(loadSession);

  const login = (email: string, password: string): boolean => {
    const users = loadUsers();
    const user = users.find(
      (u) => u.email === email && u.password === password,
    );
    if (user) {
      setCurrentUser(user);
      saveSession(user);
      return true;
    }
    return false;
  };

  const register = (user: UserData) => {
    const existing = loadUsers();
    const updated = [...existing.filter((u) => u.email !== user.email), user];
    saveUsers(updated);
    setRegisteredUsers(updated);
    setCurrentUser(user);
    saveSession(user);
  };

  const logout = () => {
    setCurrentUser(null);
    saveSession(null);
  };

  const deleteAccount = () => {
    if (currentUser) {
      const users = loadUsers();
      const updated = users.filter((u) => u.email !== currentUser.email);
      saveUsers(updated);
      setRegisteredUsers(updated);
      setCurrentUser(null);
      saveSession(null);
    }
  };

  const updateProfile = (data: Partial<UserData>) => {
    if (currentUser) {
      const updated = { ...currentUser, ...data };
      const users = loadUsers();
      const updatedUsers = users.map((u) =>
        u.email === currentUser.email ? updated : u,
      );
      saveUsers(updatedUsers);
      setRegisteredUsers(updatedUsers);
      setCurrentUser(updated);
      saveSession(updated);
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
        deleteAccount,
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
