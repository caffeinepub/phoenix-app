import {
  deleteUserAccount,
  generatePaymentId,
  getUser,
  loginUser,
  registerUser,
  updateUser,
} from "@/services/PhonexDB";
import type { PhonexUser } from "@/services/PhonexDB";
import { type ReactNode, createContext, useContext, useState } from "react";

// Legacy shape kept for backward compat with existing screens
export interface UserData {
  paymentId: string;
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
  login: (email: string, password: string) => boolean;
  register: (user: Omit<UserData, "paymentId">) => void;
  logout: () => void;
  deleteAccount: () => void;
  updateProfile: (data: Partial<UserData>) => void;
  // also expose paymentId helper
  paymentId: string | null;
}

const SESSION_KEY = "phonex_session_v2";

function loadSession(): UserData | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as UserData) : null;
  } catch {
    return null;
  }
}

function saveSession(user: UserData | null) {
  try {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch {}
}

function dbUserToUserData(u: PhonexUser): UserData {
  return {
    paymentId: u.paymentId,
    email: u.email,
    phone: u.phone,
    countryCode: "+92",
    displayName: u.displayName,
    password: u.password,
    bankName: u.bankName,
    ibanNumber: u.bankAccount,
    avatarUrl: u.avatarUrl,
  };
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserData | null>(loadSession);

  const login = (email: string, password: string): boolean => {
    const user = loginUser(email, password);
    if (user) {
      const ud = dbUserToUserData(user);
      setCurrentUser(ud);
      saveSession(ud);
      return true;
    }
    return false;
  };

  const register = (user: Omit<UserData, "paymentId">) => {
    const paymentId = generatePaymentId();
    const dbUser: PhonexUser = {
      paymentId,
      username: user.email.split("@")[0],
      password: user.password,
      email: user.email,
      phone: user.phone,
      displayName: user.displayName || user.email.split("@")[0],
      bankName: user.bankName || "",
      bankAccount: user.ibanNumber || "",
      pocketPin: "",
      avatarUrl: user.avatarUrl || "",
      createdAt: Date.now(),
    };
    registerUser(dbUser);
    const ud = dbUserToUserData(dbUser);
    setCurrentUser(ud);
    saveSession(ud);
  };

  const logout = () => {
    setCurrentUser(null);
    saveSession(null);
  };

  const deleteAccount = () => {
    if (currentUser) {
      deleteUserAccount(currentUser.paymentId);
      setCurrentUser(null);
      saveSession(null);
    }
  };

  const updateProfile = (data: Partial<UserData>) => {
    if (currentUser) {
      const updated = { ...currentUser, ...data };
      updateUser(currentUser.paymentId, {
        displayName: updated.displayName,
        email: updated.email,
        phone: updated.phone,
        bankName: updated.bankName,
        bankAccount: updated.ibanNumber,
        avatarUrl: updated.avatarUrl,
      });
      setCurrentUser(updated);
      saveSession(updated);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        register,
        logout,
        deleteAccount,
        updateProfile,
        paymentId: currentUser?.paymentId ?? null,
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
