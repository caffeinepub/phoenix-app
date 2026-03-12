import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Code2,
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
const phonexLogo = "/assets/uploads/Phonex-Icon-1-1.jpg";
import { useAuth } from "../contexts/AuthContext";
import { useSyncStatus } from "../contexts/SyncContext";
import { useTheme } from "../contexts/ThemeContext";
import CallsTab from "../tabs/CallsTab";
import ChatsTab from "../tabs/ChatsTab";
import CodingTab from "../tabs/CodingTab";
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
  { id: "coding", label: "Coding", icon: Code2 },
] as const;

type TabId = (typeof TABS)[number]["id"];

function SyncBadge() {
  const { syncStatus, lastSync } = useSyncStatus();
  const labels: Record<string, string> = {
    synced: "Cloud Synced",
    syncing: "Syncing...",
    offline: "Offline",
    error: "Sync Error",
  };
  const colors: Record<string, string> = {
    synced: "bg-green-400",
    syncing: "bg-yellow-400",
    offline: "bg-gray-400",
    error: "bg-red-400",
  };
  return (
    <span
      data-ocid="home.sync_status.button"
      title={
        lastSync
          ? `Last synced: ${new Date(lastSync).toLocaleTimeString()}`
          : labels[syncStatus]
      }
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium text-white ${colors[syncStatus]}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full bg-white/80 ${
          syncStatus === "syncing" ? "animate-pulse" : ""
        }`}
      />
      {labels[syncStatus]}
    </span>
  );
}

export default function HomeScreen({ onLogout, onNavigateProfile }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("chats");
  const [logoutOpen, setLogoutOpen] = useState(false);
  const { currentUser } = useAuth();
  const { toggleTheme, isDark, darkNameColor } = useTheme();

  const tabContent: Record<TabId, React.ReactNode> = {
    chats: <ChatsTab />,
    feels: <FeelsTab />,
    calls: <CallsTab />,
    email: <EmailTab />,
    pocket: <PocketTab />,
    coding: <CodingTab />,
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="phoenix-gradient px-4 shadow-lg">
        <div className="flex items-center justify-between py-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <img
                src={phonexLogo}
                alt="Phonex Logo"
                className="w-8 h-8 object-contain drop-shadow-md rounded-full"
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
            <div className="ml-10">
              <SyncBadge />
            </div>
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
              onClick={() => setLogoutOpen(true)}
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
        <div className="flex overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                type="button"
                key={tab.id}
                data-ocid={`home.${tab.id}.tab`}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 min-w-[56px] flex flex-col items-center gap-1 py-3 relative transition-colors"
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 phoenix-gradient rounded-full"
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
                          : tab.id === "coding"
                            ? "text-violet-500"
                            : "text-primary"
                      : "text-muted-foreground"
                  }`}
                />
                <span
                  className={`text-[10px] font-body transition-colors ${
                    isActive
                      ? tab.id === "feels"
                        ? "text-pink-500 font-semibold"
                        : tab.id === "calls"
                          ? "text-emerald-500 font-semibold"
                          : tab.id === "coding"
                            ? "text-violet-500 font-semibold"
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
      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent data-ocid="home.logout.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Log Out?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out of Phonex?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="home.logout.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="home.logout.confirm_button"
              onClick={onLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Log Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
