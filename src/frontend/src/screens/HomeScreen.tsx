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
  Home,
  LogOut,
  Mail,
  MessageCircle,
  MessageSquare,
  Mic,
  Moon,
  Phone,
  Shield,
  Sparkles,
  Sun,
  User,
  Video,
  Wallet,
  Wifi,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
const phonexLogo = "/assets/uploads/Phonex-Icon-1-1.jpg";
import { useAuth } from "../contexts/AuthContext";
import { useSyncStatus } from "../contexts/SyncContext";
import { useTheme } from "../contexts/ThemeContext";
import CallsTab from "../tabs/CallsTab";
import ChatsTab from "../tabs/ChatsTab";
import EmailTab from "../tabs/EmailTab";
import FeelsTab from "../tabs/FeelsTab";
import PocketTab from "../tabs/PocketTab";
import SmartTab from "../tabs/SmartTab";

interface Props {
  onLogout: () => void;
  onNavigateProfile: () => void;
  onNavigateAdmin: () => void;
}

const TABS = [
  { id: "home", label: "Home", icon: Home },
  { id: "chats", label: "Chats", icon: MessageCircle },
  { id: "feels", label: "Feels", icon: Sparkles },
  { id: "email", label: "Email", icon: Mail },
  { id: "pocket", label: "Pocket", icon: Wallet },
  { id: "calls", label: "Calls", icon: Phone },
  { id: "smart", label: "Smart", icon: Wifi },
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

// ── Stat count helper ──────────────────────────────────────────────────────────
function getStatCount(key: string, filterFn?: (item: any) => boolean): number {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return 0;
    const items = JSON.parse(raw);
    if (!Array.isArray(items)) return 0;
    return filterFn ? items.filter(filterFn).length : items.length;
  } catch {
    return 0;
  }
}

// ── Dashboard Tab ──────────────────────────────────────────────────────────────
function DashboardTab({
  userName,
}: {
  userName: string;
}) {
  const { isDark } = useTheme();
  const [stats, setStats] = useState({
    textNotes: 0,
    voiceNotes: 0,
    videoNotes: 0,
    emails: 0,
    feels: 0,
    calls: 0,
  });

  useEffect(() => {
    setStats({
      textNotes: getStatCount(
        "phonex_messages",
        (m) => m.messageType === "text" || m.type === "text",
      ),
      voiceNotes: getStatCount(
        "phonex_messages",
        (m) => m.messageType === "voice" || m.type === "voice",
      ),
      videoNotes: getStatCount(
        "phonex_messages",
        (m) => m.messageType === "video" || m.type === "video",
      ),
      emails: getStatCount("phonex_emails"),
      feels: getStatCount("phonex_feels"),
      calls: getStatCount("phonex_calls"),
    });
  }, []);

  const statTiles = [
    {
      label: "Text Notes",
      value: stats.textNotes,
      icon: MessageSquare,
      color: "#3b82f6",
      bg: "rgba(59,130,246,0.15)",
    },
    {
      label: "Voice Notes",
      value: stats.voiceNotes,
      icon: Mic,
      color: "#22c55e",
      bg: "rgba(34,197,94,0.15)",
    },
    {
      label: "Video Notes",
      value: stats.videoNotes,
      icon: Video,
      color: "#a855f7",
      bg: "rgba(168,85,247,0.15)",
    },
    {
      label: "Emails",
      value: stats.emails,
      icon: Mail,
      color: "#f97316",
      bg: "rgba(249,115,22,0.15)",
    },
    {
      label: "Feels",
      value: stats.feels,
      icon: Sparkles,
      color: "#ec4899",
      bg: "rgba(236,72,153,0.15)",
    },
    {
      label: "Calls",
      value: stats.calls,
      icon: Phone,
      color: "#14b8a6",
      bg: "rgba(20,184,166,0.15)",
    },
  ];

  return (
    <div className="overflow-y-auto h-full pb-6">
      {/* Large Logo Section */}
      <div className="flex flex-col items-center pt-8 pb-6">
        <motion.div
          className="relative"
          animate={{
            filter: [
              "drop-shadow(0 0 12px #60a5fa) drop-shadow(0 0 24px #60a5fa)",
              "drop-shadow(0 0 16px #a78bfa) drop-shadow(0 0 32px #a78bfa)",
              "drop-shadow(0 0 14px #34d399) drop-shadow(0 0 28px #34d399)",
              "drop-shadow(0 0 16px #f472b6) drop-shadow(0 0 30px #f472b6)",
              "drop-shadow(0 0 12px #60a5fa) drop-shadow(0 0 24px #60a5fa)",
            ],
            scale: [1, 1.04, 1, 1.04, 1],
          }}
          transition={{
            duration: 5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <img
            src={phonexLogo}
            alt="Phonex Logo"
            className="w-24 h-24 rounded-full object-cover"
            style={{
              border: "3px solid rgba(96,165,250,0.5)",
              boxShadow: "inset 0 0 20px rgba(96,165,250,0.1)",
            }}
          />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-3 font-black text-3xl tracking-tight"
          style={{ color: isDark ? "#ffffff" : "#0f2d6b" }}
        >
          Phonex
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-sm mt-1"
          style={{
            color: isDark ? "rgba(255,255,255,0.6)" : "rgba(15,45,107,0.6)",
          }}
        >
          Welcome, <span className="font-semibold">{userName}</span>
        </motion.p>
      </div>

      {/* User Summary Board */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mx-4 rounded-2xl overflow-hidden"
        style={{
          background: isDark ? "rgba(30,41,59,0.8)" : "rgba(255,255,255,0.9)",
          border: isDark
            ? "1px solid rgba(96,165,250,0.3)"
            : "1px solid rgba(15,45,107,0.15)",
          boxShadow: isDark
            ? "0 0 30px rgba(96,165,250,0.1), inset 0 1px 0 rgba(255,255,255,0.05)"
            : "0 4px 20px rgba(15,45,107,0.1)",
        }}
      >
        <div
          className="px-4 py-3"
          style={{
            background: isDark
              ? "linear-gradient(90deg, rgba(59,130,246,0.2) 0%, rgba(168,85,247,0.1) 100%)"
              : "linear-gradient(90deg, rgba(15,45,107,0.08) 0%, rgba(168,85,247,0.05) 100%)",
            borderBottom: isDark
              ? "1px solid rgba(96,165,250,0.2)"
              : "1px solid rgba(15,45,107,0.1)",
          }}
        >
          <p
            className="text-sm font-bold"
            style={{ color: isDark ? "#93c5fd" : "#0f2d6b" }}
          >
            {userName}'s Summary Board
          </p>
        </div>
        <div className="grid grid-cols-2 gap-px p-0.5">
          {statTiles.map((tile, idx) => {
            const Icon = tile.icon;
            return (
              <motion.div
                key={tile.label}
                data-ocid={`dashboard.stats.item.${idx + 1}`}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + idx * 0.06 }}
                className="flex flex-col items-center gap-1.5 py-4 rounded-xl"
                style={{ background: tile.bg }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: `${tile.color}30` }}
                >
                  <Icon style={{ color: tile.color }} className="w-4 h-4" />
                </div>
                <span
                  className="text-2xl font-black leading-none"
                  style={{ color: tile.color }}
                >
                  {tile.value}
                </span>
                <span
                  className="text-[10px] font-medium"
                  style={{
                    color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
                  }}
                >
                  {tile.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

// ── Main HomeScreen ────────────────────────────────────────────────────────────
export default function HomeScreen({
  onLogout,
  onNavigateProfile,
  onNavigateAdmin,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [logoutOpen, setLogoutOpen] = useState(false);
  const { currentUser, isAdmin } = useAuth();
  const { toggleTheme, isDark, darkNameColor } = useTheme();

  const tabContent: Record<TabId, React.ReactNode> = {
    home: <DashboardTab userName={currentUser?.displayName || "User"} />,
    chats: <ChatsTab />,
    feels: <FeelsTab />,
    calls: <CallsTab />,
    email: <EmailTab />,
    pocket: <PocketTab />,
    smart: <SmartTab />,
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="phoenix-gradient px-4 shadow-lg">
        <div className="flex items-center justify-between py-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <motion.img
                src={phonexLogo}
                alt="Phonex Logo"
                className="w-8 h-8 object-contain rounded-full"
                animate={{
                  filter: [
                    "drop-shadow(0 0 4px #60a5fa) drop-shadow(0 0 8px #60a5fa)",
                    "drop-shadow(0 0 8px #a78bfa) drop-shadow(0 0 16px #a78bfa)",
                    "drop-shadow(0 0 6px #34d399) drop-shadow(0 0 12px #34d399)",
                    "drop-shadow(0 0 8px #f472b6) drop-shadow(0 0 14px #f472b6)",
                    "drop-shadow(0 0 4px #60a5fa) drop-shadow(0 0 8px #60a5fa)",
                  ],
                  scale: [1, 1.05, 1, 1.05, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
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
            {isAdmin && (
              <button
                type="button"
                data-ocid="home.admin.button"
                onClick={onNavigateAdmin}
                className="w-9 h-9 rounded-full bg-blue-500/30 flex items-center justify-center hover:bg-blue-500/50 transition-colors"
                aria-label="Admin Portal"
                title="Admin Portal"
              >
                <Shield className="w-4 h-4 text-blue-200" />
              </button>
            )}
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
            <div className="flex flex-col items-center gap-0.5">
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
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
              </button>
              <span className="text-[9px] text-white/90 font-medium leading-tight max-w-[44px] truncate text-center">
                {currentUser?.displayName ||
                  (currentUser as any)?.name ||
                  "User"}
              </span>
            </div>
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
                className="flex-1 min-w-[52px] flex flex-col items-center gap-1 py-3 relative transition-colors"
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
                          : tab.id === "home"
                            ? "text-blue-500"
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
                          : tab.id === "home"
                            ? "text-blue-500 font-semibold"
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
