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
  ShoppingBag,
  Star,
  Sun,
  TrendingUp,
  User,
  Video,
  Wallet,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
const phonexLogo = "/assets/uploads/Phonex-Icon-1-1.jpg";
import { useAuth } from "../contexts/AuthContext";
import { useSyncStatus } from "../contexts/SyncContext";
import { useTheme } from "../contexts/ThemeContext";
import {
  getBizUser,
  getSellerMonthlyStats,
  getSellerSubscriptionInfo,
  getTopBrands,
  seedDemoDataIfEmpty,
} from "../services/PhoenixBusinessDB";
import CallsTab from "../tabs/CallsTab";
import ChatsTab from "../tabs/ChatsTab";
import EmailTab from "../tabs/EmailTab";
import PocketTab from "../tabs/PocketTab";
import SalesTab from "../tabs/SalesTab";

interface Props {
  onLogout: () => void;
  onNavigateProfile: () => void;
  onNavigateAdmin: () => void;
}

const TABS = [
  { id: "home", label: "Home", icon: Home },
  { id: "chats", label: "Chats", icon: MessageCircle },
  { id: "sales", label: "Sales", icon: ShoppingBag },
  { id: "email", label: "Email", icon: Mail },
  { id: "pocket", label: "Pocket", icon: Wallet },
  { id: "calls", label: "Calls", icon: Phone },
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

// ── Buyer Dashboard ────────────────────────────────────────────────────────────
function BuyerDashboard({ userName }: { userName: string }) {
  const { isDark } = useTheme();
  const [topBrands, setTopBrands] = useState<ReturnType<typeof getTopBrands>>(
    [],
  );
  const [stats, setStats] = useState({ emails: 0, calls: 0, chats: 0 });

  useEffect(() => {
    seedDemoDataIfEmpty();
    setTopBrands(getTopBrands(10));
    setStats({
      emails: getStatCount("phonex_emails"),
      calls: getStatCount("phonex_calls"),
      chats: getStatCount("phonex_messages"),
    });
  }, []);

  const statTiles = [
    { label: "Emails", value: stats.emails, icon: Mail, color: "#f97316" },
    { label: "Calls", value: stats.calls, icon: Phone, color: "#14b8a6" },
    {
      label: "Chats",
      value: stats.chats,
      icon: MessageSquare,
      color: "#3b82f6",
    },
  ];

  const BRAND_COLORS = [
    "#6366f1",
    "#0ea5e9",
    "#f97316",
    "#ec4899",
    "#22c55e",
    "#eab308",
    "#8b5cf6",
    "#14b8a6",
    "#ef4444",
    "#84cc16",
  ];

  return (
    <div className="overflow-y-auto h-full pb-6">
      {/* Logo + Greeting */}
      <div className="flex flex-col items-center pt-8 pb-4">
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
          className="text-sm mt-1 opacity-90"
          style={{
            color: isDark ? "rgba(255,255,255,0.65)" : "rgba(15,45,107,0.65)",
          }}
        >
          Welcome, <span className="font-semibold">{userName}</span>!
        </motion.p>
      </div>

      {/* Top Brands Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mx-4 rounded-2xl overflow-hidden mb-4"
        style={{
          background: isDark ? "rgba(30,41,59,0.8)" : "rgba(255,255,255,0.95)",
          border: isDark
            ? "1px solid rgba(96,165,250,0.3)"
            : "1px solid rgba(15,45,107,0.12)",
          boxShadow: isDark
            ? "0 0 30px rgba(96,165,250,0.08)"
            : "0 2px 16px rgba(15,45,107,0.08)",
        }}
      >
        <div
          className="px-4 py-3"
          style={{
            background: isDark
              ? "linear-gradient(90deg, rgba(99,102,241,0.2) 0%, rgba(236,72,153,0.1) 100%)"
              : "linear-gradient(90deg, rgba(99,102,241,0.06) 0%, rgba(236,72,153,0.04) 100%)",
            borderBottom: isDark
              ? "1px solid rgba(96,165,250,0.2)"
              : "1px solid rgba(15,45,107,0.08)",
          }}
        >
          <p
            className="text-sm font-bold flex items-center gap-2"
            style={{ color: isDark ? "#93c5fd" : "#0f2d6b" }}
          >
            <Star className="w-4 h-4" />
            Top Brands
          </p>
        </div>
        {topBrands.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <ShoppingBag className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No brands yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 p-3">
            {topBrands.map((brand, idx) => {
              const color = BRAND_COLORS[idx % BRAND_COLORS.length];
              return (
                <motion.div
                  key={brand.sellerId}
                  data-ocid={`dashboard.brands.item.${idx + 1}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + idx * 0.04 }}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl"
                  style={{
                    background: `linear-gradient(135deg, ${color}18 0%, ${color}08 100%)`,
                    border: `1px solid ${color}25`,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm"
                    style={{ background: `${color}25`, color }}
                  >
                    {brand.brandName.charAt(0).toUpperCase()}
                  </div>
                  <p className="font-bold text-xs text-foreground text-center leading-tight line-clamp-1">
                    {brand.brandName}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {brand.category}
                  </p>
                  <p className="text-[10px] font-semibold" style={{ color }}>
                    {brand.totalOrders} orders
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="mx-4 rounded-2xl overflow-hidden"
        style={{
          background: isDark ? "rgba(30,41,59,0.8)" : "rgba(255,255,255,0.95)",
          border: isDark
            ? "1px solid rgba(96,165,250,0.3)"
            : "1px solid rgba(15,45,107,0.12)",
          boxShadow: isDark
            ? "0 0 30px rgba(96,165,250,0.08)"
            : "0 2px 16px rgba(15,45,107,0.08)",
        }}
      >
        <div
          className="px-4 py-3"
          style={{
            background: isDark
              ? "linear-gradient(90deg, rgba(59,130,246,0.2) 0%, rgba(168,85,247,0.1) 100%)"
              : "linear-gradient(90deg, rgba(15,45,107,0.06) 0%, rgba(168,85,247,0.04) 100%)",
            borderBottom: isDark
              ? "1px solid rgba(96,165,250,0.2)"
              : "1px solid rgba(15,45,107,0.08)",
          }}
        >
          <p
            className="text-sm font-bold"
            style={{ color: isDark ? "#93c5fd" : "#0f2d6b" }}
          >
            {userName}'s Summary
          </p>
        </div>
        <div className="grid grid-cols-3 gap-px p-0.5">
          {statTiles.map((tile, idx) => {
            const Icon = tile.icon;
            return (
              <motion.div
                key={tile.label}
                data-ocid={`dashboard.stats.item.${idx + 1}`}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + idx * 0.06 }}
                className="flex flex-col items-center gap-1.5 py-4 rounded-xl cursor-default"
                style={{
                  background: `linear-gradient(135deg, ${tile.color}20 0%, ${tile.color}08 100%)`,
                  border: `1px solid ${tile.color}30`,
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: `${tile.color}25`,
                    boxShadow: `0 0 10px 3px ${tile.color}40`,
                    animation: "pulseGlowOuter 2s ease-in-out infinite",
                    animationDelay: `${idx * 0.3}s`,
                  }}
                >
                  <Icon style={{ color: tile.color }} className="w-5 h-5" />
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

// ── Seller Dashboard ───────────────────────────────────────────────────────────
function SellerDashboard({
  userId,
  brandName,
}: { userId: string; brandName: string }) {
  const { isDark } = useTheme();
  const [monthlyStats, setMonthlyStats] = useState<ReturnType<
    typeof getSellerMonthlyStats
  > | null>(null);
  const [subInfo, setSubInfo] = useState<ReturnType<
    typeof getSellerSubscriptionInfo
  > | null>(null);

  useEffect(() => {
    seedDemoDataIfEmpty();
    const stats = getSellerMonthlyStats(userId);
    setMonthlyStats(stats);
    const seller = getBizUser(userId);
    if (seller) setSubInfo(getSellerSubscriptionInfo(seller));
  }, [userId]);

  const metricCards = [
    {
      label: "Balance (PKR)",
      value: monthlyStats?.balance?.toFixed(0) ?? "0",
      icon: Wallet,
      color: "#3b82f6",
    },
    {
      label: "Revenue (30d)",
      value: monthlyStats?.monthlyRevenue?.toFixed(0) ?? "0",
      icon: TrendingUp,
      color: "#22c55e",
    },
    {
      label: "Orders (30d)",
      value: monthlyStats?.monthlyOrders ?? 0,
      icon: ShoppingBag,
      color: "#f97316",
    },
    {
      label: "Active Posts",
      value: monthlyStats?.activePosts ?? 0,
      icon: Star,
      color: "#a855f7",
    },
  ];

  return (
    <div className="overflow-y-auto h-full pb-6">
      {/* Logo + Greeting */}
      <div className="flex flex-col items-center pt-8 pb-4">
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
          className="mt-3 font-black text-2xl tracking-tight"
          style={{ color: isDark ? "#ffffff" : "#0f2d6b" }}
        >
          {brandName}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-sm mt-1 opacity-90"
          style={{
            color: isDark ? "rgba(255,255,255,0.65)" : "rgba(15,45,107,0.65)",
          }}
        >
          Seller Dashboard
        </motion.p>
        {subInfo && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className={`mt-2 text-xs px-3 py-1 rounded-full font-semibold border ${
              subInfo.canPost
                ? "bg-green-500/15 text-green-700 border-green-500/30"
                : "bg-red-500/15 text-red-700 border-red-500/30"
            }`}
          >
            {subInfo.status}
          </motion.span>
        )}
      </div>

      {/* Metrics Grid */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mx-4 rounded-2xl overflow-hidden mb-4"
        style={{
          background: isDark ? "rgba(30,41,59,0.8)" : "rgba(255,255,255,0.95)",
          border: isDark
            ? "1px solid rgba(96,165,250,0.3)"
            : "1px solid rgba(15,45,107,0.12)",
          boxShadow: isDark
            ? "0 0 30px rgba(96,165,250,0.08)"
            : "0 2px 16px rgba(15,45,107,0.08)",
        }}
      >
        <div
          className="px-4 py-3"
          style={{
            background: isDark
              ? "linear-gradient(90deg, rgba(59,130,246,0.2) 0%, rgba(168,85,247,0.1) 100%)"
              : "linear-gradient(90deg, rgba(15,45,107,0.06) 0%, rgba(168,85,247,0.04) 100%)",
            borderBottom: isDark
              ? "1px solid rgba(96,165,250,0.2)"
              : "1px solid rgba(15,45,107,0.08)",
          }}
        >
          <p
            className="text-sm font-bold"
            style={{ color: isDark ? "#93c5fd" : "#0f2d6b" }}
          >
            Monthly Overview
          </p>
        </div>
        <div className="grid grid-cols-2 gap-px p-0.5">
          {metricCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                data-ocid={`dashboard.seller.item.${idx + 1}`}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + idx * 0.06 }}
                className="flex flex-col items-center gap-1.5 py-4 rounded-xl"
                style={{
                  background: `linear-gradient(135deg, ${card.color}20 0%, ${card.color}08 100%)`,
                  border: `1px solid ${card.color}30`,
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: `${card.color}25`,
                    boxShadow: `0 0 10px 3px ${card.color}40`,
                    animation: "pulseGlowOuter 2s ease-in-out infinite",
                    animationDelay: `${idx * 0.3}s`,
                  }}
                >
                  <Icon style={{ color: card.color }} className="w-5 h-5" />
                </div>
                <span
                  className="text-2xl font-black leading-none"
                  style={{ color: card.color }}
                >
                  {card.value}
                </span>
                <span
                  className="text-[10px] font-medium"
                  style={{
                    color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
                  }}
                >
                  {card.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Post Breakdown */}
      {monthlyStats && monthlyStats.postBreakdown.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mx-4 rounded-2xl overflow-hidden"
          style={{
            background: isDark
              ? "rgba(30,41,59,0.8)"
              : "rgba(255,255,255,0.95)",
            border: isDark
              ? "1px solid rgba(96,165,250,0.3)"
              : "1px solid rgba(15,45,107,0.12)",
          }}
        >
          <div
            className="px-4 py-3"
            style={{
              background: isDark
                ? "linear-gradient(90deg, rgba(34,197,94,0.2) 0%, rgba(59,130,246,0.1) 100%)"
                : "linear-gradient(90deg, rgba(34,197,94,0.06) 0%, rgba(59,130,246,0.04) 100%)",
              borderBottom: isDark
                ? "1px solid rgba(96,165,250,0.2)"
                : "1px solid rgba(15,45,107,0.08)",
            }}
          >
            <p
              className="text-sm font-bold"
              style={{ color: isDark ? "#93c5fd" : "#0f2d6b" }}
            >
              Posts Performance
            </p>
          </div>
          <div className="divide-y divide-border">
            {monthlyStats.postBreakdown.map((post, idx) => (
              <div
                key={post.postId}
                data-ocid={`dashboard.posts.item.${idx + 1}`}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">
                    {post.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {post.orders} orders
                  </p>
                </div>
                <span className="font-bold text-sm text-emerald-600">
                  PKR {post.revenue.toFixed(0)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function HomeScreen({
  onLogout,
  onNavigateProfile,
  onNavigateAdmin,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [logoutOpen, setLogoutOpen] = useState(false);
  const { currentUser, isAdmin } = useAuth();
  const { toggleTheme, isDark, darkNameColor } = useTheme();

  const isSeller = currentUser?.role === "seller";

  const tabContent: Record<TabId, React.ReactNode> = {
    home: isSeller ? (
      <SellerDashboard
        userId={currentUser?.id ?? ""}
        brandName={
          currentUser?.brandName || currentUser?.displayName || "Brand"
        }
      />
    ) : (
      <BuyerDashboard userName={currentUser?.displayName || "User"} />
    ),
    chats: <ChatsTab />,
    sales: <SalesTab />,
    calls: <CallsTab />,
    email: <EmailTab />,
    pocket: <PocketTab />,
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="phoenix-gradient px-4 shadow-lg">
        <div className="flex items-center justify-between py-3.5">
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
                className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center hover:bg-blue-500/50 active:scale-[0.97] transition-all"
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
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 active:scale-[0.97] transition-all"
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
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 active:scale-[0.97] transition-all relative"
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
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-red-400/50 active:scale-[0.97] transition-all"
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
            transition={{ duration: 0.18 }}
            className="h-full overflow-y-auto"
          >
            {tabContent[activeTab]}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Tab Bar */}
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
                className="flex-1 min-w-[46px] flex flex-col items-center gap-0.5 py-2 relative transition-colors active:scale-[0.95]"
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 phoenix-gradient rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
                  />
                )}
                <div
                  style={
                    isActive
                      ? {
                          background: "rgba(59,130,246,0.15)",
                          borderRadius: "12px",
                          padding: "4px 8px",
                        }
                      : { padding: "4px 8px" }
                  }
                  className="flex flex-col items-center gap-0.5"
                >
                  <Icon
                    className={`w-[18px] h-[18px] transition-colors ${
                      isActive
                        ? tab.id === "sales"
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
                    className={`text-[9px] font-body transition-colors leading-none ${
                      isActive
                        ? tab.id === "sales"
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
                </div>
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
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-[0.97] transition-transform"
            >
              Log Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
