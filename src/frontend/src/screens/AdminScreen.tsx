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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  CheckCircle,
  CheckCircle2,
  Lock,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserMinus,
  UserX,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  type PhonexUser,
  type SecurityEvent,
  adminDeleteUser,
  blockUser,
  clearSecurityEvents,
  getAllUsers,
  getSecurityEvents,
  restrictUser,
  unblockUser,
  unrestrictUser,
} from "../services/PhonexDB";

interface Props {
  onBack: () => void;
}

const ADMIN_EMAIL = "admin@phonex.app";

const AUTO_RULES = [
  {
    icon: Lock,
    label: "Auto-lock after 5 failed login attempts",
    color: "text-red-400",
  },
  {
    icon: Ban,
    label: "Block repeated failed login attempts",
    color: "text-orange-400",
  },
  {
    icon: ShieldAlert,
    label: "Log all suspicious activity in real-time",
    color: "text-yellow-400",
  },
  {
    icon: Zap,
    label: "Instant account lock on security breach detection",
    color: "text-blue-400",
  },
  {
    icon: ShieldCheck,
    label: "Monitor all login events 24/7",
    color: "text-green-400",
  },
];

const EVENT_TYPE_CONFIG: Record<
  SecurityEvent["type"],
  { label: string; color: string; bg: string }
> = {
  failed_login: {
    label: "Failed Login",
    color: "text-yellow-300",
    bg: "bg-yellow-500/20",
  },
  blocked_attempt: {
    label: "Blocked Attempt",
    color: "text-red-300",
    bg: "bg-red-500/20",
  },
  suspicious_activity: {
    label: "Suspicious",
    color: "text-orange-300",
    bg: "bg-orange-500/20",
  },
  account_locked: {
    label: "Account Locked",
    color: "text-purple-300",
    bg: "bg-purple-500/20",
  },
};

export default function AdminScreen({ onBack }: Props) {
  const [activeTab, setActiveTab] = useState<"users" | "security">("users");
  const [users, setUsers] = useState<PhonexUser[]>([]);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<PhonexUser | null>(null);

  const refresh = () => {
    setUsers(getAllUsers());
    setEvents(getSecurityEvents());
  };

  useEffect(() => {
    setUsers(getAllUsers());
    setEvents(getSecurityEvents());
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.displayName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const blockedUsers = users.filter((u) => u.blocked).length;
  const now = Date.now();
  const recentAlerts = events.filter(
    (e) => now - e.timestamp < 86400000,
  ).length;

  const handleBlock = (user: PhonexUser) => {
    if (user.blocked) unblockUser(user.paymentId);
    else blockUser(user.paymentId);
    refresh();
  };

  const handleRestrict = (user: PhonexUser) => {
    if (user.restricted) unrestrictUser(user.paymentId);
    else restrictUser(user.paymentId);
    refresh();
  };

  const handleDelete = () => {
    if (deleteTarget) {
      adminDeleteUser(deleteTarget.paymentId);
      setDeleteTarget(null);
      refresh();
    }
  };

  const handleClearEvents = () => {
    clearSecurityEvents();
    refresh();
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ background: "#0d1117" }}
    >
      {/* Header */}
      <header
        className="px-4 py-4 flex items-center gap-3"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          borderBottom: "1px solid rgba(59,130,246,0.3)",
          boxShadow: "0 0 20px rgba(59,130,246,0.15)",
        }}
      >
        <button
          type="button"
          data-ocid="admin.close_button"
          onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-blue-400" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Shield className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm leading-tight">
              Phonex Admin Portal
            </h1>
            <p className="text-blue-400/70 text-[10px]">
              Administrative Control System
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 text-[10px] font-medium">LIVE</span>
        </div>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 px-4 py-3">
        {(() => {
          const suspendedUsers = users.filter((u) => u.restricted).length;
          const complaintsRaw = localStorage.getItem("phonex_complaints");
          const complaintsCount = (() => {
            try {
              return JSON.parse(complaintsRaw || "[]").length;
            } catch {
              return 0;
            }
          })();
          const today = new Date().toDateString();
          const failedLoginsToday = events.filter(
            (e) =>
              e.type === "failed_login" &&
              new Date(e.timestamp).toDateString() === today,
          ).length;
          return [
            {
              label: "Users",
              value: users.length,
              icon: Users,
              color: "#3b82f6",
            },
            {
              label: "Blocked",
              value: blockedUsers,
              icon: UserX,
              color: "#ef4444",
            },
            {
              label: "Suspended",
              value: suspendedUsers,
              icon: UserMinus,
              color: "#f97316",
            },
            {
              label: "Sec Events",
              value: recentAlerts,
              icon: ShieldAlert,
              color: "#f59e0b",
            },
            {
              label: "Complaints",
              value: complaintsCount,
              icon: AlertTriangle,
              color: "#a855f7",
            },
            {
              label: "Failed/Today",
              value: failedLoginsToday,
              icon: Lock,
              color: "#ec4899",
            },
          ];
        })().map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-2.5 flex flex-col items-center gap-1"
              style={{
                background: "rgba(30,41,59,0.8)",
                border: `1px solid ${stat.color}40`,
                boxShadow: `0 0 10px ${stat.color}20`,
              }}
            >
              <Icon style={{ color: stat.color }} className="w-4 h-4" />
              <span className="text-white font-bold text-lg leading-none">
                {stat.value}
              </span>
              <span className="text-slate-400 text-[9px]">{stat.label}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Tab Bar */}
      <div
        className="mx-4 mb-3 flex rounded-xl overflow-hidden"
        style={{
          background: "rgba(30,41,59,0.6)",
          border: "1px solid rgba(59,130,246,0.2)",
        }}
      >
        {(["users", "security"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            data-ocid={`admin.${tab}.tab`}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-2.5 text-xs font-medium transition-all"
            style={{
              background:
                activeTab === tab ? "rgba(59,130,246,0.3)" : "transparent",
              color: activeTab === tab ? "#93c5fd" : "#64748b",
              borderBottom:
                activeTab === tab
                  ? "2px solid #3b82f6"
                  : "2px solid transparent",
            }}
          >
            {tab === "users" ? "👥 Users" : "🛡️ Security Agent"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden px-4 pb-4">
        {activeTab === "users" && (
          <div className="flex flex-col h-full gap-3">
            <Input
              data-ocid="admin.search_input"
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-sm"
              style={{
                background: "rgba(30,41,59,0.8)",
                border: "1px solid rgba(59,130,246,0.3)",
                color: "#e2e8f0",
              }}
            />
            <ScrollArea className="flex-1">
              {filteredUsers.length === 0 ? (
                <div
                  data-ocid="admin.users.empty_state"
                  className="flex flex-col items-center justify-center py-16 gap-3"
                >
                  <Users className="w-12 h-12 text-slate-600" />
                  <p className="text-slate-500 text-sm">No users found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map((user, idx) => {
                    const isAdminAccount = user.email === ADMIN_EMAIL;
                    return (
                      <motion.div
                        key={user.paymentId}
                        data-ocid={`admin.users.item.${idx + 1}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="rounded-xl p-3"
                        style={{
                          background: "rgba(30,41,59,0.8)",
                          border: user.blocked
                            ? "1px solid rgba(239,68,68,0.4)"
                            : user.restricted
                              ? "1px solid rgba(245,158,11,0.4)"
                              : "1px solid rgba(59,130,246,0.2)",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                            style={{
                              background: user.blocked
                                ? "rgba(239,68,68,0.2)"
                                : "rgba(59,130,246,0.2)",
                              color: user.blocked ? "#fca5a5" : "#93c5fd",
                            }}
                          >
                            {user.avatarUrl ? (
                              <img
                                src={user.avatarUrl}
                                alt=""
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              getInitials(user.displayName)
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-white text-xs font-semibold truncate">
                                {user.displayName}
                              </span>
                              {user.blocked && (
                                <Badge className="text-[9px] px-1 py-0 bg-red-500/20 text-red-300 border-red-500/30">
                                  Blocked
                                </Badge>
                              )}
                              {user.restricted && !user.blocked && (
                                <Badge className="text-[9px] px-1 py-0 bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                                  Restricted
                                </Badge>
                              )}
                              {!user.blocked && !user.restricted && (
                                <Badge className="text-[9px] px-1 py-0 bg-green-500/20 text-green-300 border-green-500/30">
                                  Active
                                </Badge>
                              )}
                            </div>
                            <p className="text-slate-400 text-[10px] truncate">
                              {user.email}
                            </p>
                            <p className="text-slate-600 text-[9px]">
                              {user.paymentId}
                            </p>
                          </div>
                        </div>
                        {!isAdminAccount && (
                          <div className="flex gap-1.5 mt-2.5">
                            <button
                              type="button"
                              data-ocid={`admin.users.toggle.${idx + 1}`}
                              onClick={() => handleBlock(user)}
                              className="flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all flex items-center justify-center gap-1"
                              style={{
                                background: user.blocked
                                  ? "rgba(34,197,94,0.2)"
                                  : "rgba(239,68,68,0.2)",
                                color: user.blocked ? "#86efac" : "#fca5a5",
                                border: user.blocked
                                  ? "1px solid rgba(34,197,94,0.3)"
                                  : "1px solid rgba(239,68,68,0.3)",
                              }}
                            >
                              {user.blocked ? (
                                <UserCheck className="w-3 h-3" />
                              ) : (
                                <UserMinus className="w-3 h-3" />
                              )}
                              {user.blocked ? "Unblock" : "Block"}
                            </button>
                            <button
                              type="button"
                              data-ocid={`admin.users.secondary_button.${idx + 1}`}
                              onClick={() => handleRestrict(user)}
                              className="flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all flex items-center justify-center gap-1"
                              style={{
                                background: user.restricted
                                  ? "rgba(59,130,246,0.2)"
                                  : "rgba(245,158,11,0.2)",
                                color: user.restricted ? "#93c5fd" : "#fcd34d",
                                border: user.restricted
                                  ? "1px solid rgba(59,130,246,0.3)"
                                  : "1px solid rgba(245,158,11,0.3)",
                              }}
                            >
                              {user.restricted ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : (
                                <Ban className="w-3 h-3" />
                              )}
                              {user.restricted ? "Unrestrict" : "Restrict"}
                            </button>
                            <button
                              type="button"
                              data-ocid={`admin.users.delete_button.${idx + 1}`}
                              onClick={() => setDeleteTarget(user)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                              style={{
                                background: "rgba(239,68,68,0.15)",
                                border: "1px solid rgba(239,68,68,0.3)",
                                color: "#fca5a5",
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        )}

        {activeTab === "security" && (
          <div className="flex flex-col gap-3">
            {/* Agent Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-4"
              style={{
                background:
                  "linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(59,130,246,0.1) 100%)",
                border: "1px solid rgba(34,197,94,0.3)",
                boxShadow: "0 0 20px rgba(34,197,94,0.1)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(34,197,94,0.2)" }}
                >
                  <ShieldCheck className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm">
                      Cyber Security Agent
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-green-400 text-[10px] font-medium">
                        AUTO-DEFENSIVE MODE: ON
                      </span>
                    </span>
                  </div>
                  <p className="text-slate-400 text-[10px] mt-0.5">
                    Monitors login attempts, detects suspicious patterns, and
                    auto-locks accounts.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Auto Rules */}
            <div
              className="rounded-xl p-3"
              style={{
                background: "rgba(30,41,59,0.8)",
                border: "1px solid rgba(59,130,246,0.2)",
              }}
            >
              <p className="text-slate-300 text-xs font-semibold mb-2">
                🔒 Active Protection Rules
              </p>
              <div className="space-y-2">
                {AUTO_RULES.map((rule) => {
                  const Icon = rule.icon;
                  return (
                    <div key={rule.label} className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                      <Icon
                        className={`w-3.5 h-3.5 flex-shrink-0 ${rule.color}`}
                      />
                      <span className="text-slate-300 text-[10px]">
                        {rule.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Security Events */}
            <div className="flex items-center justify-between">
              <p className="text-slate-300 text-xs font-semibold">
                Security Events ({events.length})
              </p>
              {events.length > 0 && (
                <Button
                  size="sm"
                  data-ocid="admin.security.delete_button"
                  variant="ghost"
                  onClick={handleClearEvents}
                  className="text-[10px] h-6 px-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  Clear Events
                </Button>
              )}
            </div>

            <ScrollArea className="h-64">
              {events.length === 0 ? (
                <div
                  data-ocid="admin.security.empty_state"
                  className="flex flex-col items-center justify-center py-12 gap-3"
                >
                  <CheckCircle className="w-12 h-12 text-green-600" />
                  <p className="text-slate-500 text-sm">
                    No security events detected
                  </p>
                  <p className="text-slate-600 text-xs text-center">
                    Your app is clean and secure
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {events.map((event, idx) => {
                    const cfg = EVENT_TYPE_CONFIG[event.type];
                    return (
                      <motion.div
                        key={event.id}
                        data-ocid={`admin.security.item.${idx + 1}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.02 }}
                        className="rounded-lg p-2.5 flex gap-2.5"
                        style={{
                          background: "rgba(30,41,59,0.8)",
                          border: "1px solid rgba(59,130,246,0.15)",
                        }}
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}
                            >
                              {cfg.label}
                            </span>
                            <span className="text-slate-400 text-[9px]">
                              {new Date(event.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-slate-300 text-[10px] mt-0.5 truncate">
                            {event.email}
                          </p>
                          <p className="text-slate-500 text-[9px] mt-0.5 line-clamp-1">
                            {event.details}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent
          data-ocid="admin.delete.dialog"
          style={{
            background: "#1e293b",
            border: "1px solid rgba(239,68,68,0.4)",
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Delete User Account?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This will permanently delete{" "}
              <strong className="text-white">
                {deleteTarget?.displayName}
              </strong>
              's account and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="admin.delete.cancel_button"
              className="bg-slate-700 text-white border-slate-600 hover:bg-slate-600"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="admin.delete.confirm_button"
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
