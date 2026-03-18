import {
  blockUser,
  deleteUserAccount,
  generatePaymentId,
  getAllUsers,
  getUser,
  incrementFailedLogin,
  logSecurityEvent,
  loginUser,
  registerUser,
  resetFailedLogins,
  resetPassword,
  updateUser,
} from "@/services/PhonexDB";
import type { PhonexUser } from "@/services/PhonexDB";
import { type ReactNode, createContext, useContext, useState } from "react";

const ADMIN_EMAIL = "admin@phonex.app";
const ADMIN_PASSWORD = "admin123";

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
  isAdmin: boolean;
  login: (email: string, password: string) => boolean;
  register: (user: Omit<UserData, "paymentId">) => void;
  logout: () => void;
  deleteAccount: () => void;
  updateProfile: (data: Partial<UserData>) => void;
  forgotPassword: (email: string) => boolean;
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

const ADMIN_USER_DATA: UserData = {
  paymentId: "ADMIN-001",
  email: ADMIN_EMAIL,
  phone: "+92300000000",
  countryCode: "+92",
  displayName: "Admin",
  password: ADMIN_PASSWORD,
  avatarUrl: "",
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserData | null>(loadSession);

  const isAdmin = currentUser?.email === ADMIN_EMAIL;

  const login = (email: string, password: string): boolean => {
    // Admin hardcoded login
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setCurrentUser(ADMIN_USER_DATA);
      saveSession(ADMIN_USER_DATA);
      resetFailedLogins(email);
      return true;
    }

    // Regular user login
    const user = loginUser(email, password);
    if (user) {
      if (user.blocked) {
        logSecurityEvent({
          id: `evt_${Date.now()}`,
          type: "blocked_attempt",
          email,
          timestamp: Date.now(),
          details: `Blocked user attempted login: ${email}`,
        });
        return false;
      }
      const ud = dbUserToUserData(user);
      setCurrentUser(ud);
      saveSession(ud);
      resetFailedLogins(email);
      return true;
    }

    // Failed login
    const failedCount = incrementFailedLogin(email);
    logSecurityEvent({
      id: `evt_${Date.now()}`,
      type: "failed_login",
      email,
      timestamp: Date.now(),
      details: `Failed login attempt #${failedCount} for ${email}`,
    });

    if (failedCount >= 5) {
      // Auto-lock the account
      const users = getAllUsers();
      const target = users.find((u) => u.email === email);
      if (target) {
        blockUser(target.paymentId);
        logSecurityEvent({
          id: `evt_${Date.now() + 1}`,
          type: "account_locked",
          email,
          timestamp: Date.now(),
          details: `Account auto-locked after ${failedCount} failed login attempts`,
        });
      } else {
        logSecurityEvent({
          id: `evt_${Date.now() + 1}`,
          type: "suspicious_activity",
          email,
          timestamp: Date.now(),
          details: `${failedCount} failed login attempts for unknown account: ${email}`,
        });
      }
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

  const forgotPassword = (email: string): boolean => {
    const users = getAllUsers();
    const user = users.find((u) => u.email === email);
    if (!user) return false;
    return resetPassword(email, user.phone);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        login,
        register,
        logout,
        deleteAccount,
        updateProfile,
        forgotPassword,
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
