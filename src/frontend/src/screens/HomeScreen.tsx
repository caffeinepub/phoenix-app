import {
  BookOpen,
  Briefcase,
  LogOut,
  Mail,
  MessageCircle,
  Moon,
  Sun,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import ChatsTab from "../tabs/ChatsTab";
import ClassTab from "../tabs/ClassTab";
import EmailTab from "../tabs/EmailTab";
import JobsTab from "../tabs/JobsTab";

interface Props {
  onLogout: () => void;
  onNavigateProfile: () => void;
}

const TABS = [
  { id: "chats", label: "Chats", icon: MessageCircle },
  { id: "class", label: "Class", icon: BookOpen },
  { id: "email", label: "Email", icon: Mail },
  { id: "jobs", label: "Jobs", icon: Briefcase },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function HomeScreen({ onLogout, onNavigateProfile }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("chats");
  const { currentUser } = useAuth();
  const { toggleTheme, isDark } = useTheme();

  const tabContent: Record<TabId, React.ReactNode> = {
    chats: <ChatsTab />,
    class: <ClassTab />,
    email: <EmailTab />,
    jobs: <JobsTab />,
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="phoenix-gradient px-4 shadow-lg">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <img
              src="/assets/uploads/Phonex-1.jpg"
              alt="Phoenix Logo"
              className="w-8 h-8 rounded-xl object-cover"
            />
            <h1 className="font-display text-xl font-black text-primary-foreground tracking-tight">
              Phoenix
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
              <User className="w-4 h-4 text-white" />
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
                  className={`w-5 h-5 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}
                />
                <span
                  className={`text-xs font-body transition-colors ${isActive ? "text-primary font-semibold" : "text-muted-foreground"}`}
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
