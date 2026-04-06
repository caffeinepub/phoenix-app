import {
  type BizUser,
  type UserRole,
  blockBizUser,
  deleteBizUser,
  generateId,
  getAllBizUsers,
  getBizUser,
  loadBizSession,
  loginBizUser,
  registerBizUser,
  resetBizPassword,
  saveBizSession,
  seedDemoDataIfEmpty,
  updateBizUser,
} from "@/services/PhoenixBusinessDB";
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const ADMIN_EMAIL = "admin@phonex.app";
const ADMIN_PASSWORD = "admin123";
const FAILED_LOGINS_KEY = "phoenix_failed_logins";

export interface UserData {
  id: string;
  paymentId: string;
  email: string;
  phone: string;
  displayName: string;
  password: string;
  role: UserRole;
  brandName?: string;
  category?: string;
  balance?: number;
  countryCode?: string;
  bankName?: string;
  ibanNumber?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  currentUser: UserData | null;
  isAdmin: boolean;
  login: (email: string, password: string) => boolean;
  register: (user: Omit<UserData, "id" | "paymentId">) => void;
  logout: () => void;
  deleteAccount: () => void;
  updateProfile: (data: Partial<UserData>) => void;
  forgotPassword: (email: string) => boolean;
  paymentId: string | null;
}

const ADMIN_USER_DATA: UserData = {
  id: "admin-001",
  paymentId: "ADMIN-001",
  email: ADMIN_EMAIL,
  phone: "+92300000000",
  displayName: "Admin",
  password: ADMIN_PASSWORD,
  role: "buyer",
  avatarUrl: "",
};

function incrementFailedLogin(email: string): number {
  try {
    const raw = localStorage.getItem(FAILED_LOGINS_KEY);
    const data = raw ? JSON.parse(raw) : {};
    data[email] = (data[email] || 0) + 1;
    localStorage.setItem(FAILED_LOGINS_KEY, JSON.stringify(data));
    return data[email];
  } catch {
    return 1;
  }
}

function resetFailedLogins(email: string): void {
  try {
    const raw = localStorage.getItem(FAILED_LOGINS_KEY);
    const data = raw ? JSON.parse(raw) : {};
    delete data[email];
    localStorage.setItem(FAILED_LOGINS_KEY, JSON.stringify(data));
  } catch {}
}

function bizUserToUserData(u: BizUser): UserData {
  return {
    id: u.id,
    paymentId: u.paymentId,
    email: u.email,
    phone: u.phone,
    displayName: u.displayName,
    password: u.password,
    role: u.role,
    brandName: u.brandName,
    category: u.category,
    balance: u.balance,
    avatarUrl: u.avatarUrl,
  };
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserData | null>(() => {
    const session = loadBizSession();
    if (session) return bizUserToUserData(session);
    return null;
  });

  useEffect(() => {
    seedDemoDataIfEmpty();
  }, []);

  const isAdmin = currentUser?.email === ADMIN_EMAIL;

  const login = (email: string, password: string): boolean => {
    // Admin hardcoded login
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setCurrentUser(ADMIN_USER_DATA);
      saveBizSession({
        id: ADMIN_USER_DATA.id,
        paymentId: ADMIN_USER_DATA.paymentId,
        email: ADMIN_USER_DATA.email,
        phone: ADMIN_USER_DATA.phone,
        displayName: ADMIN_USER_DATA.displayName,
        password: ADMIN_USER_DATA.password,
        role: ADMIN_USER_DATA.role,
        balance: 0,
        subscriptionStatus: "active",
        subscriptionStart: Date.now(),
        totalRevenue: 0,
        totalOrders: 0,
        postsCount: 0,
        createdAt: Date.now(),
      });
      resetFailedLogins(email);
      return true;
    }

    // Regular user login
    const user = loginBizUser(email, password);
    if (user) {
      if (user.blocked) {
        return false;
      }
      const ud = bizUserToUserData(user);
      setCurrentUser(ud);
      saveBizSession(user);
      resetFailedLogins(email);
      return true;
    }

    // Failed login tracking
    const failedCount = incrementFailedLogin(email);
    if (failedCount >= 5) {
      const users = getAllBizUsers();
      const target = users.find((u) => u.email === email);
      if (target) {
        blockBizUser(target.id);
      }
    }

    return false;
  };

  const register = (user: Omit<UserData, "id" | "paymentId">) => {
    const id = generateId("USR");
    const paymentId = generateId("PHX");
    const bizUser: BizUser = {
      id,
      paymentId,
      email: user.email,
      phone: user.phone,
      displayName: user.displayName || user.email.split("@")[0],
      password: user.password,
      role: user.role || "buyer",
      brandName: user.brandName,
      category: user.category,
      balance: 0,
      subscriptionStatus: "free",
      subscriptionStart: Date.now(),
      totalRevenue: 0,
      totalOrders: 0,
      postsCount: 0,
      avatarUrl: user.avatarUrl || "",
      createdAt: Date.now(),
    };
    registerBizUser(bizUser);
    const ud = bizUserToUserData(bizUser);
    setCurrentUser(ud);
    saveBizSession(bizUser);
  };

  const logout = () => {
    setCurrentUser(null);
    saveBizSession(null);
  };

  const deleteAccount = () => {
    if (currentUser) {
      deleteBizUser(currentUser.id);
      setCurrentUser(null);
      saveBizSession(null);
    }
  };

  const updateProfile = (data: Partial<UserData>) => {
    if (currentUser) {
      const updated = { ...currentUser, ...data };
      updateBizUser(currentUser.id, {
        displayName: updated.displayName,
        email: updated.email,
        phone: updated.phone,
        avatarUrl: updated.avatarUrl,
        brandName: updated.brandName,
        category: updated.category,
      });
      setCurrentUser(updated);
      // Update session with latest bizUser data
      const freshUser = getBizUser(currentUser.id);
      if (freshUser) saveBizSession(freshUser);
    }
  };

  const forgotPassword = (email: string): boolean => {
    const users = getAllBizUsers();
    const user = users.find((u) => u.email === email);
    if (!user) return false;
    return resetBizPassword(email, user.phone);
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
