import {
  LogOut,
  Mail,
  MessageCircle,
  Moon,
  Phone,
  Sparkles,
  Sun,
  User,
  Wallet,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
const phonexLogo =
  "/assets/generated/phonex-phoenix-logo-transparent.dim_512x512.png";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import CallsTab from "../tabs/CallsTab";
import ChatsTab from "../tabs/ChatsTab";
import EmailTab from "../tabs/EmailTab";
import FeelsTab from "../tabs/FeelsTab";
import PocketTab from "../tabs/PocketTab";

interface Props {
  onLogout: () => void;
  onNavigateProfile: () => void;
}

const TABS = [
  { id: "chats", label: "Chats", icon: MessageCircle },
  { id: "feels", label: "Feels", icon: Sparkles },
  { id: "email", label: "Email", icon: Mail },
  { id: "pocket", label: "Pocket", icon: Wallet },
  { id: "calls", label: "Calls", icon: Phone },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function HomeScreen({ onLogout, onNavigateProfile }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("chats");
  const { currentUser } = useAuth();
  const { toggleTheme, isDark, darkNameColor } = useTheme();

  const tabContent: Record<TabId, React.ReactNode> = {
    chats: <ChatsTab />,
    feels: <FeelsTab />,
    calls: <CallsTab />,
    email: <EmailTab />,
    pocket: <PocketTab />,
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="phoenix-gradient px-4 shadow-lg">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <img
              src={phonexLogo}
              alt="Phonex Logo"
              className="w-8 h-8 object-contain drop-shadow-md"
            />
            <h1
              className="font-display text-xl font-black tracking-tight"
              style={{
                color: isDark
                  ? darkNameColor === "maroon"
                    ? "#800000"
                    : "#ffffff"
                  : "#0f2d6b",
                textShadow: "0 1px 3px rgba(255,255,255,0.6)",
              }}
            >
              Phonex
            </h1>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              data-ocid="home.toggle"
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-white" />
              ) : (
                <Moon className="w-4 h-4 text-white" />
              )}
            </button>
            <button
              type="button"
              data-ocid="home.secondary_button"
              onClick={onNavigateProfile}
              className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors relative"
              aria-label="Profile"
            >
              {currentUser?.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt="avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
              {currentUser?.displayName && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
              )}
            </button>
            <button
              type="button"
              data-ocid="home.delete_button"
              onClick={onLogout}
              className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-red-400/50 transition-colors"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="h-full overflow-y-auto"
          >
            {tabContent[activeTab]}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="bg-card border-t border-border shadow-lg">
        <div className="flex">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                type="button"
                key={tab.id}
                data-ocid={`home.${tab.id}.tab`}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex flex-col items-center gap-1 py-3 relative transition-colors"
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 phoenix-gradient rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive
                      ? tab.id === "feels"
                        ? "text-pink-500"
                        : tab.id === "calls"
                          ? "text-emerald-500"
                          : "text-primary"
                      : "text-muted-foreground"
                  }`}
                />
                <span
                  className={`text-xs font-body transition-colors ${
                    isActive
                      ? tab.id === "feels"
                        ? "text-pink-500 font-semibold"
                        : tab.id === "calls"
                          ? "text-emerald-500 font-semibold"
                          : "text-primary font-semibold"
                      : "text-muted-foreground"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
