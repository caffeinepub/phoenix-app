import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import {
  Bluetooth,
  Check,
  Copy,
  Edit2,
  MessageCircle,
  Radio,
  Save,
  Send,
  Signal,
  Star,
  User,
  Users,
  Wifi,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type SmartSubTab = "smart" | "peers" | "chat" | "blast" | "account" | "billing";
type BillingStep = 1 | 2 | 3 | 4;

// ── Persistent storage keys ──────────────────────────────────────────────────
const BLE_KEY = "phonex_ble_on";
const PRO_KEY = "phonex_smart_pro";
const PRO_EXPIRY_KEY = "phonex_smart_pro_expiry";
const NOTES_KEY = "phonex_smart_notes";
const NOTES_DATE_KEY = "phonex_smart_notes_date";

const NOTES_FREE_LIMIT = 20;

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function getNotesState(): { used: number } {
  const today = getTodayStr();
  const savedDate = localStorage.getItem(NOTES_DATE_KEY);
  if (savedDate !== today) {
    localStorage.setItem(NOTES_DATE_KEY, today);
    localStorage.setItem(NOTES_KEY, "0");
    return { used: 0 };
  }
  return { used: Number(localStorage.getItem(NOTES_KEY) ?? "0") };
}

function incrementNotes(): number {
  const today = getTodayStr();
  localStorage.setItem(NOTES_DATE_KEY, today);
  const next = getNotesState().used + 1;
  localStorage.setItem(NOTES_KEY, String(next));
  return next;
}

// ── Peer data ────────────────────────────────────────────────────────────────
const ALL_PEERS = [
  {
    id: "p1",
    name: "Alice",
    initials: "AL",
    signal: 4,
    hop: 1,
    dist: "0.3km",
    color: "bg-blue-500",
    hex: "#3b82f6",
    angle: 45,
  },
  {
    id: "p2",
    name: "Bob",
    initials: "BO",
    signal: 3,
    hop: 2,
    dist: "1.2km",
    color: "bg-emerald-500",
    hex: "#10b981",
    angle: 135,
  },
  {
    id: "p3",
    name: "Charlie",
    initials: "CH",
    signal: 3,
    hop: 1,
    dist: "2.8km",
    color: "bg-violet-500",
    hex: "#8b5cf6",
    angle: 210,
  },
  {
    id: "p4",
    name: "Diana",
    initials: "DI",
    signal: 2,
    hop: 3,
    dist: "3.5km",
    color: "bg-rose-500",
    hex: "#f43f5e",
    angle: 310,
  },
];

const RELAYS = [
  { id: "r1", name: "Relay Node 1", dist: "1.8km" },
  { id: "r2", name: "Relay Node 2", dist: "3.1km" },
];

// Distance 0.3km → ~15% radius, 3.5km → ~85% radius
function distToRadius(dist: string): number {
  const km = Number.parseFloat(dist);
  return 0.12 + (km / 4) * 0.73;
}

// ── Signal Bars ──────────────────────────────────────────────────────────────
function SignalBars({ bars }: { bars: number }) {
  return (
    <div className="flex items-end gap-[2px] h-4">
      {[1, 2, 3, 4].map((b) => (
        <div
          key={b}
          className={`w-1 rounded-sm transition-all ${
            b <= bars ? "bg-emerald-400" : "bg-muted"
          }`}
          style={{ height: `${b * 4}px` }}
        />
      ))}
    </div>
  );
}

// ── Sub-tab pill ─────────────────────────────────────────────────────────────
function SubTab({
  id,
  label,
  active,
  onClick,
}: { id: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      data-ocid={`smart.${id}.tab`}
      onClick={onClick}
      className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
        active
          ? "bg-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.5)]"
          : "bg-card text-muted-foreground border border-border hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

// ── Radar Canvas ─────────────────────────────────────────────────────────────
function RadarCanvas({
  bleOn,
  visiblePeers,
}: { bleOn: boolean; visiblePeers: typeof ALL_PEERS }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sweepRef = useRef(0);
  const rafRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const R = Math.min(cx, cy) - 4;

    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = "#0a0f1a";
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();

    // Rings
    const ringLabels = ["1km", "2km", "4km"];
    [0.25, 0.5, 1].forEach((fraction, i) => {
      ctx.beginPath();
      ctx.arc(cx, cy, R * fraction, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(34,197,94,0.2)";
      ctx.lineWidth = 1;
      ctx.stroke();
      // Label
      ctx.fillStyle = "rgba(34,197,94,0.4)";
      ctx.font = "9px sans-serif";
      ctx.fillText(ringLabels[i], cx + R * fraction + 3, cy - 3);
    });

    // Crosshairs
    ctx.strokeStyle = "rgba(34,197,94,0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, cy - R);
    ctx.lineTo(cx, cy + R);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - R, cy);
    ctx.lineTo(cx + R, cy);
    ctx.stroke();

    if (bleOn) {
      // Sweep
      const sweep = sweepRef.current;
      const sweepEnd = sweep;
      const sweepStart = sweepEnd - 0.8;
      // Draw sweep as arc sector
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, sweepStart, sweepEnd);
      ctx.closePath();
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
      grd.addColorStop(0, "rgba(34,197,94,0)");
      grd.addColorStop(1, "rgba(34,197,94,0.25)");
      ctx.fillStyle = grd;
      ctx.fill();
      ctx.restore();

      // Sweep line
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweep) * R, cy + Math.sin(sweep) * R);
      ctx.strokeStyle = "rgba(34,197,94,0.9)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      sweepRef.current += 0.025;

      // Peer dots
      for (const peer of visiblePeers) {
        const angleRad = (peer.angle * Math.PI) / 180;
        const r = distToRadius(peer.dist) * R;
        const px = cx + Math.cos(angleRad) * r;
        const py = cy + Math.sin(angleRad) * r;

        // Glow
        const glow = ctx.createRadialGradient(px, py, 0, px, py, 8);
        glow.addColorStop(0, `${peer.hex}cc`);
        glow.addColorStop(1, `${peer.hex}00`);
        ctx.beginPath();
        ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Dot
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = peer.hex;
        ctx.fill();

        // Label
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.font = "bold 9px sans-serif";
        ctx.fillText(peer.name, px + 6, py - 4);
      }
    }

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fillStyle = bleOn ? "#22c55e" : "#475569";
    ctx.fill();

    rafRef.current = requestAnimationFrame(draw);
  }, [bleOn, visiblePeers]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={220}
      height={220}
      className="rounded-full border border-green-500/20"
      style={{ background: "#0a0f1a" }}
    />
  );
}

// ── Smart sub-tab ────────────────────────────────────────────────────────────
function SmartSubTabView({
  bleOn,
  setBleOn,
  isPro,
  notesUsed,
  onNavigate,
  visiblePeers,
}: {
  bleOn: boolean;
  setBleOn: (v: boolean) => void;
  isPro: boolean;
  notesUsed: number;
  onNavigate: (t: SmartSubTab) => void;
  visiblePeers: typeof ALL_PEERS;
}) {
  return (
    <div className="p-4 space-y-5 overflow-y-auto pb-6">
      {/* BLE Orb */}
      <div className="flex flex-col items-center gap-3 pt-2">
        <motion.button
          type="button"
          data-ocid="smart.ble.toggle"
          onClick={() => {
            const next = !bleOn;
            setBleOn(next);
            localStorage.setItem(BLE_KEY, String(next));
          }}
          animate={
            bleOn
              ? {
                  boxShadow: [
                    "0 0 20px rgba(59,130,246,0.6), 0 0 60px rgba(59,130,246,0.3)",
                    "0 0 40px rgba(99,102,241,0.8), 0 0 80px rgba(99,102,241,0.4)",
                    "0 0 20px rgba(59,130,246,0.6), 0 0 60px rgba(59,130,246,0.3)",
                  ],
                  scale: [1, 1.05, 1],
                }
              : { boxShadow: "0 0 0px rgba(0,0,0,0)", scale: 1 }
          }
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className={`w-28 h-28 rounded-full flex flex-col items-center justify-center gap-1.5 font-bold text-white transition-all ${
            bleOn
              ? "bg-gradient-to-br from-blue-500 to-indigo-600"
              : "bg-gradient-to-br from-slate-600 to-slate-700"
          }`}
          style={{
            border: bleOn
              ? "2px solid rgba(99,102,241,0.6)"
              : "2px solid rgba(100,116,139,0.4)",
          }}
        >
          <Bluetooth className="w-8 h-8" />
          <span className="text-xs">{bleOn ? "ON" : "OFF"}</span>
        </motion.button>
        <div className="text-center">
          <p
            className="text-sm font-semibold"
            style={{ color: bleOn ? "#60a5fa" : undefined }}
          >
            Smart Mode: {bleOn ? "Active" : "Offline"}
          </p>
          {isPro && (
            <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full px-2 py-0.5 font-bold">
              ★ Smart Pro Active
            </span>
          )}
        </div>
      </div>

      {/* Stats bar */}
      {bleOn && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-4 gap-2"
        >
          {[
            {
              label: "Peers",
              value: String(visiblePeers.length),
              color: "#60a5fa",
            },
            { label: "Range", value: "4km", color: "#34d399" },
            { label: "Relays", value: "2", color: "#a78bfa" },
            { label: "Hops", value: "1–4", color: "#f97316" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl p-2.5 bg-card border border-border flex flex-col items-center gap-1"
            >
              <span className="text-base font-black" style={{ color: s.color }}>
                {s.value}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {s.label}
              </span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Radar */}
      {bleOn && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-center"
        >
          <RadarCanvas bleOn={bleOn} visiblePeers={visiblePeers} />
        </motion.div>
      )}

      {/* Capability cards when off */}
      {!bleOn && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 gap-3"
        >
          {[
            {
              icon: Wifi,
              title: "Mesh Network",
              desc: "Connect with peers up to 4km away via BLE relay nodes without internet.",
            },
            {
              icon: MessageCircle,
              title: "Offline Chat",
              desc: "Send messages and notes when both parties are in range — no server needed.",
            },
            {
              icon: Radio,
              title: "Broadcast",
              desc: "Send a blast to all mesh nodes in range simultaneously.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-card border border-border rounded-2xl p-4 flex gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Daily notes */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Daily Notes</p>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              isPro
                ? "bg-amber-500/20 text-amber-400"
                : "bg-muted/60 text-muted-foreground"
            }`}
          >
            {isPro ? "Pro Plan" : "Free Plan"}
          </span>
        </div>
        <Progress
          value={isPro ? 0 : (notesUsed / NOTES_FREE_LIMIT) * 100}
          className="h-2"
        />
        <p className="text-xs text-muted-foreground">
          {isPro
            ? "Unlimited notes"
            : `${notesUsed} / ${NOTES_FREE_LIMIT} Notes Used Today`}
        </p>
        {!isPro && (
          <Button
            size="sm"
            data-ocid="smart.upgrade.button"
            onClick={() => onNavigate("billing")}
            className="w-full mt-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 hover:opacity-90"
          >
            <Star className="w-3.5 h-3.5 mr-1.5" />
            Upgrade to Pro — PKR 1,000/year
          </Button>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          data-ocid="smart.peers.button"
          onClick={() => onNavigate("peers")}
          className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
        >
          <Users className="w-5 h-5 text-blue-400" />
          <span className="text-xs text-blue-400 font-semibold">Peers</span>
        </button>
        <button
          type="button"
          data-ocid="smart.broadcast.button"
          onClick={() => onNavigate("blast")}
          className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/20 transition-colors"
        >
          <Radio className="w-5 h-5 text-violet-400" />
          <span className="text-xs text-violet-400 font-semibold">
            Broadcast
          </span>
        </button>
        <button
          type="button"
          data-ocid="smart.btcall.button"
          onClick={() => {
            if (isPro) {
              toast.info("BT Call feature launching soon!");
            } else {
              onNavigate("billing");
            }
          }}
          className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-colors ${
            isPro
              ? "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20"
              : "bg-muted/60 border-border hover:bg-muted/80"
          }`}
        >
          <Signal
            className={`w-5 h-5 ${isPro ? "text-emerald-400" : "text-muted-foreground"}`}
          />
          <span
            className={`text-[10px] font-semibold ${isPro ? "text-emerald-400" : "text-muted-foreground"}`}
          >
            BT Call
          </span>
          {!isPro && (
            <span className="text-[9px] text-amber-500 -mt-1">Pro Only</span>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Peers sub-tab ────────────────────────────────────────────────────────────
function PeersSubTabView({
  bleOn,
  visiblePeers,
  onChat,
}: {
  bleOn: boolean;
  visiblePeers: typeof ALL_PEERS;
  onChat: (peer: (typeof ALL_PEERS)[0]) => void;
}) {
  if (!bleOn) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
        <Bluetooth className="w-12 h-12 text-muted-foreground/40" />
        <p className="text-sm font-semibold text-foreground">
          Smart Mode is off
        </p>
        <p className="text-xs text-muted-foreground">
          Enable Smart Mode from the Smart tab to discover nearby peers.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 overflow-y-auto pb-6">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Live Peers
      </p>
      <div className="space-y-2">
        {visiblePeers.map((peer, idx) => (
          <motion.div
            key={peer.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.08 }}
            data-ocid={`smart.peer.item.${idx + 1}`}
            className="flex items-center gap-3 p-3 bg-card rounded-2xl border border-border hover:bg-accent/40 transition-colors"
          >
            <div
              className={`w-10 h-10 rounded-full ${peer.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
            >
              {peer.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground">
                {peer.name}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <SignalBars bars={peer.signal} />
                <span className="text-[10px] text-muted-foreground">
                  Hop {peer.hop} · {peer.dist}
                </span>
              </div>
            </div>
            <Button
              size="sm"
              data-ocid={`smart.peer.chat_button.${idx + 1}`}
              onClick={() => onChat(peer)}
              className="bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 h-8 px-3 text-xs"
            >
              <MessageCircle className="w-3 h-3 mr-1" />
              Chat
            </Button>
          </motion.div>
        ))}

        {visiblePeers.length === 0 && (
          <div className="text-center py-10">
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.4, repeat: Number.POSITIVE_INFINITY }}
            >
              <Bluetooth className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            </motion.div>
            <p className="text-sm text-muted-foreground">
              Scanning for peers...
            </p>
          </div>
        )}
      </div>

      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4">
        Relay Nodes
      </p>
      <div className="space-y-2">
        {RELAYS.map((relay, idx) => (
          <div
            key={relay.id}
            data-ocid={`smart.relay.item.${idx + 1}`}
            className="flex items-center gap-3 p-3 bg-card rounded-2xl border border-border"
          >
            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-orange-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-foreground">
                {relay.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {relay.dist} · Active
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Chat sub-tab ─────────────────────────────────────────────────────────────
type ChatMsg = {
  id: string;
  text: string;
  side: "sent" | "recv";
  delivered: boolean;
};

function ChatSubTabView({
  selectedPeer,
  bleOn,
  isPro,
  notesUsed,
  onNoteSent,
  onNavigate,
}: {
  selectedPeer: (typeof ALL_PEERS)[0] | null;
  bleOn: boolean;
  isPro: boolean;
  notesUsed: number;
  onNoteSent: () => void;
  onNavigate: (t: SmartSubTab) => void;
}) {
  const chatKey = selectedPeer ? `phonex_ble_chat_${selectedPeer.id}` : null;
  const [messages, setMessages] = useState<ChatMsg[]>(() => {
    if (!chatKey) return [];
    try {
      return JSON.parse(localStorage.getItem(chatKey) ?? "[]") as ChatMsg[];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const limitReached = !isPro && notesUsed >= NOTES_FREE_LIMIT;

  useEffect(() => {
    if (chatKey) {
      try {
        const saved = JSON.parse(
          localStorage.getItem(chatKey) ?? "[]",
        ) as ChatMsg[];
        setMessages(saved);
      } catch {
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, [chatKey]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional scroll on message change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function persistMsgs(msgs: ChatMsg[]) {
    if (chatKey) localStorage.setItem(chatKey, JSON.stringify(msgs));
  }

  function sendMsg() {
    if (!input.trim() || limitReached || !selectedPeer) return;
    const newMsg: ChatMsg = {
      id: Date.now().toString(),
      text: input.trim(),
      side: "sent",
      delivered: false,
    };
    const updated = [...messages, newMsg];
    setMessages(updated);
    persistMsgs(updated);
    setInput("");
    onNoteSent();

    // Simulate delivery tick
    setTimeout(() => {
      setMessages((prev) => {
        const next = prev.map((m) =>
          m.id === newMsg.id ? { ...m, delivered: true } : m,
        );
        persistMsgs(next);
        return next;
      });
    }, 900);

    // Simulate reply
    setTimeout(() => {
      const reply: ChatMsg = {
        id: (Date.now() + 2).toString(),
        text: ["Got it! 👋", "Sure thing!", "On my way!", "Roger that 📡"][
          Math.floor(Math.random() * 4)
        ],
        side: "recv",
        delivered: true,
      };
      setMessages((prev) => {
        const next = [...prev, reply];
        persistMsgs(next);
        return next;
      });
    }, 1600);
  }

  if (!bleOn) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
        <Bluetooth className="w-12 h-12 text-muted-foreground/40" />
        <p className="text-sm font-semibold text-foreground">
          Smart Mode is off
        </p>
        <p className="text-xs text-muted-foreground">
          Enable Smart Mode to start BLE chatting.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-3">
        {selectedPeer ? (
          <>
            <div
              className={`w-8 h-8 rounded-full ${selectedPeer.color} flex items-center justify-center text-white text-xs font-bold`}
            >
              {selectedPeer.initials}
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                {selectedPeer.name}
              </p>
              <p className="text-[10px] text-muted-foreground">
                BLE · Hop {selectedPeer.hop} · {selectedPeer.dist}
              </p>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Select a peer from the Peers tab
          </p>
        )}
      </div>

      {/* Daily limit */}
      {!isPro && (
        <div className="px-3 py-2 border-b border-border/50">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-muted-foreground">
              Daily messages: {notesUsed}/{NOTES_FREE_LIMIT}
            </span>
            {limitReached && (
              <button
                type="button"
                onClick={() => onNavigate("billing")}
                className="text-[10px] text-amber-500 font-semibold underline"
              >
                Upgrade to Pro!
              </button>
            )}
          </div>
          <Progress
            value={(notesUsed / NOTES_FREE_LIMIT) * 100}
            className="h-1"
          />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {messages.length === 0 ? (
          <div className="text-center py-12" data-ocid="smart.chat.empty_state">
            <MessageCircle className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {selectedPeer
                ? `Start chatting with ${selectedPeer.name}`
                : "Select a peer to start chatting"}
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.side === "sent" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[72%] rounded-2xl px-3 py-2 text-sm ${
                  msg.side === "sent"
                    ? "bg-blue-500 text-white"
                    : "bg-card border border-border text-foreground"
                }`}
              >
                {msg.text}
                {msg.side === "sent" && (
                  <span className="ml-1.5 text-[10px] opacity-70">
                    {msg.delivered ? "✓✓" : "✓"}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-2 border-t border-border flex gap-2">
        <Input
          data-ocid="smart.chat.input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMsg()}
          placeholder={
            limitReached
              ? "Daily limit reached — Upgrade"
              : "Message via BLE..."
          }
          disabled={!selectedPeer || limitReached}
          className="flex-1"
        />
        <Button
          size="icon"
          data-ocid="smart.chat.submit_button"
          onClick={sendMsg}
          disabled={!input.trim() || !selectedPeer || limitReached}
          className="bg-blue-500 hover:bg-blue-600 text-white border-0 flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ── Blast sub-tab ────────────────────────────────────────────────────────────
function BlastSubTabView({ bleOn }: { bleOn: boolean }) {
  const [msg, setMsg] = useState("");
  const [history, setHistory] = useState<{ text: string; ts: number }[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("phonex_blast_history") ?? "[]");
    } catch {
      return [];
    }
  });

  function handleBlast() {
    if (!msg.trim() || !bleOn) return;
    const item = { text: msg.trim(), ts: Date.now() };
    const updated = [item, ...history].slice(0, 20);
    setHistory(updated);
    localStorage.setItem("phonex_blast_history", JSON.stringify(updated));
    setMsg("");
    toast.success("Broadcast sent to 4 peers! 📡");
  }

  if (!bleOn) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
        <Radio className="w-12 h-12 text-muted-foreground/40" />
        <p className="text-sm font-semibold text-foreground">
          Smart Mode is off
        </p>
        <p className="text-xs text-muted-foreground">
          Enable Smart Mode to broadcast messages.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 overflow-y-auto pb-6">
      <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
        <p className="text-sm font-bold text-foreground flex items-center gap-2">
          <Radio className="w-4 h-4 text-violet-400" /> Broadcast to All Peers
        </p>
        <Textarea
          data-ocid="smart.blast.textarea"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="Type your broadcast message..."
          rows={3}
          className="resize-none"
        />
        <Button
          data-ocid="smart.blast.submit_button"
          onClick={handleBlast}
          disabled={!msg.trim()}
          className="w-full bg-violet-500 hover:bg-violet-600 text-white border-0"
        >
          <Radio className="w-4 h-4 mr-2" /> Broadcast
        </Button>
      </div>

      {history.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Past Broadcasts
          </p>
          {history.map((h, idx) => (
            <div
              key={`blast-${h.ts}`}
              data-ocid={`smart.blast.item.${idx + 1}`}
              className="bg-card border border-border rounded-xl px-4 py-3"
            >
              <p className="text-sm text-foreground">{h.text}</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {new Date(h.ts).toLocaleTimeString()} · Sent to 4 peers
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Account sub-tab ──────────────────────────────────────────────────────────
function AccountSubTabView({
  bleOn,
  isPro,
  proExpiry,
  notesUsed,
  onBilling,
}: {
  bleOn: boolean;
  isPro: boolean;
  proExpiry: string;
  notesUsed: number;
  onBilling: () => void;
}) {
  const { currentUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(currentUser?.displayName || "");
  const [editEmail, setEditEmail] = useState(currentUser?.email || "");

  const name = currentUser?.displayName || "User";
  const email = currentUser?.email || "";
  const initial = name.charAt(0).toUpperCase();

  function saveEdit() {
    // Persist to PhonexDB if needed — simplified here
    setEditing(false);
    toast.success("Profile updated");
  }

  const subscriptionRows = isPro
    ? [
        { label: "Plan", value: "Smart Pro" },
        { label: "Price", value: "PKR 1,000/year" },
        { label: "Notes", value: "Unlimited" },
        { label: "Expires", value: proExpiry },
      ]
    : [
        { label: "Plan", value: "Free" },
        { label: "Price", value: "PKR 0/month" },
        { label: "Notes Used", value: `${notesUsed} / ${NOTES_FREE_LIMIT}` },
        { label: "Expiry", value: "—" },
      ];

  return (
    <div className="p-4 space-y-4 overflow-y-auto pb-6">
      {/* Profile card */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-black">
              {initial}
            </div>
            <div>
              {editing ? (
                <div className="space-y-1.5">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Display name"
                    className="h-7 text-sm"
                  />
                  <Input
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="Email"
                    className="h-7 text-sm"
                  />
                </div>
              ) : (
                <>
                  <p className="font-bold text-foreground">{name}</p>
                  <p className="text-xs text-muted-foreground">{email}</p>
                </>
              )}
            </div>
          </div>
          <button
            type="button"
            data-ocid="smart.account.edit.button"
            onClick={() => (editing ? saveEdit() : setEditing(true))}
            className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-colors"
          >
            {editing ? (
              <Save className="w-3.5 h-3.5 text-primary" />
            ) : (
              <Edit2 className="w-3.5 h-3.5 text-primary" />
            )}
          </button>
        </div>
        {editing && (
          <Button
            size="sm"
            onClick={() => setEditing(false)}
            variant="outline"
            className="w-full"
          >
            <X className="w-3.5 h-3.5 mr-1" /> Cancel
          </Button>
        )}
      </div>

      {/* Subscription card */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-foreground">Subscription</p>
          {isPro && (
            <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full px-2 py-0.5 font-bold">
              ★ Pro
            </span>
          )}
        </div>
        {subscriptionRows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between py-1 border-b border-border/40 last:border-0"
          >
            <span className="text-sm text-foreground">{row.label}:</span>
            <span
              className={`text-sm font-semibold ${
                row.label === "Plan" && isPro
                  ? "text-amber-400"
                  : "text-muted-foreground"
              }`}
            >
              {row.value}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-foreground">Smart Mode:</span>
          <span
            className={`text-sm font-semibold ${bleOn ? "text-emerald-400" : "text-muted-foreground"}`}
          >
            {bleOn ? "Active" : "Offline"}
          </span>
        </div>
      </div>

      {!isPro && (
        <Button
          data-ocid="smart.account.upgrade_button"
          onClick={onBilling}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 hover:opacity-90"
        >
          <Star className="w-4 h-4 mr-2" /> Upgrade to Pro — PKR 1,000/year
        </Button>
      )}
    </div>
  );
}

// ── Billing sub-tab ──────────────────────────────────────────────────────────
function BillingSubTabView({
  isPro,
  onProActivated,
}: {
  isPro: boolean;
  onProActivated: () => void;
}) {
  const [step, setStep] = useState<BillingStep>(1);
  const [txId, setTxId] = useState("");
  const [jazzNumber, setJazzNumber] = useState("");

  function copy(text: string, label: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    toast.success(`${label} copied!`);
  }

  function CopyField({ label, value }: { label: string; value: string }) {
    return (
      <div className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
        <div>
          <p className="text-[10px] text-muted-foreground">{label}</p>
          <p className="text-base font-bold text-foreground">{value}</p>
        </div>
        <button
          type="button"
          data-ocid={`smart.billing.copy.${label.toLowerCase().replace(/ /g, "_")}.button`}
          onClick={() => copy(value, label)}
          className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-colors"
        >
          <Copy className="w-3.5 h-3.5 text-primary" />
        </button>
      </div>
    );
  }

  if (isPro) {
    const expiry = localStorage.getItem(PRO_EXPIRY_KEY) || "—";
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="p-6 flex flex-col items-center gap-4 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center">
          <Check className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-xl font-black text-foreground">
          Smart Pro Active!
        </h2>
        <p className="text-muted-foreground text-sm">Expires: {expiry}</p>
        <div className="flex flex-col gap-1 text-sm">
          <p className="text-foreground font-semibold">✓ Unlimited Notes</p>
          <p className="text-foreground font-semibold">✓ BT Calls Enabled</p>
          <p className="text-foreground font-semibold">
            ✓ Priority Relay Nodes
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="p-4 space-y-4 overflow-y-auto pb-6">
      {/* Step indicators */}
      <div className="flex items-center gap-2 justify-center">
        {([1, 2, 3, 4] as BillingStep[]).map((s) => (
          <div
            key={s}
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step >= s
                ? "bg-blue-500 text-white"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {s}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="s1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-card border border-border rounded-2xl p-4 space-y-1"
          >
            <p className="text-sm font-bold text-foreground mb-3">
              Send Payment via JazzCash
            </p>
            <CopyField label="JazzCash Number" value="0300-3257502" />
            <CopyField label="Account Name" value="Phonex App" />
            <CopyField label="Amount" value="PKR 1,000" />
            <div className="pt-3 space-y-1.5">
              {[
                "1. Open JazzCash app",
                "2. Go to Send Money",
                "3. Enter number above",
                "4. Send PKR 1,000",
                "5. Copy the Transaction ID",
              ].map((s) => (
                <p key={s} className="text-xs text-muted-foreground">
                  {s}
                </p>
              ))}
            </div>
            <Button
              data-ocid="smart.billing.step1.button"
              onClick={() => setStep(2)}
              className="w-full mt-3 bg-blue-500 text-white border-0"
            >
              I've Sent the Money →
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="s2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-card border border-border rounded-2xl p-4 space-y-3"
          >
            <p className="text-sm font-bold text-foreground">
              Enter Transaction Details
            </p>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Transaction ID
              </Label>
              <Input
                data-ocid="smart.billing.txid.input"
                value={txId}
                onChange={(e) => setTxId(e.target.value)}
                placeholder="e.g. TXN123456789"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Your JazzCash Number
              </Label>
              <Input
                data-ocid="smart.billing.jazznumber.input"
                value={jazzNumber}
                onChange={(e) => setJazzNumber(e.target.value)}
                placeholder="03XX-XXXXXXX"
              />
            </div>
            <Button
              data-ocid="smart.billing.step2.button"
              onClick={() => setStep(3)}
              disabled={!txId.trim() || !jazzNumber.trim()}
              className="w-full bg-blue-500 text-white border-0"
            >
              Submit for Review →
            </Button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="s3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-card border border-border rounded-2xl p-4 space-y-3"
          >
            <p className="text-sm font-bold text-foreground">
              Review Your Submission
            </p>
            {[
              { label: "JazzCash To", value: "0300-3257502" },
              { label: "Account", value: "Phonex App" },
              { label: "Amount", value: "PKR 1,000" },
              { label: "Transaction ID", value: txId },
              { label: "Your JazzCash #", value: jazzNumber },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0"
              >
                <span className="text-xs text-muted-foreground">
                  {row.label}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {row.value}
                </span>
              </div>
            ))}
            <Button
              data-ocid="smart.billing.simulate.button"
              onClick={() => {
                const expiry = new Date();
                expiry.setFullYear(expiry.getFullYear() + 1);
                const expiryStr = expiry.toLocaleDateString("en-PK", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });
                localStorage.setItem(PRO_KEY, "true");
                localStorage.setItem(PRO_EXPIRY_KEY, expiryStr);
                setStep(4);
                onProActivated();
                toast.success("Smart Pro activated! 🎉");
              }}
              className="w-full bg-emerald-500 text-white border-0 hover:bg-emerald-600"
            >
              <Check className="w-4 h-4 mr-2" /> Simulate Approval (Demo)
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main SmartTab ─────────────────────────────────────────────────────────────
export default function SmartTab() {
  const [activeTab, setActiveTab] = useState<SmartSubTab>("smart");

  // Persistent BLE + Pro state
  const [bleOn, setBleOn] = useState(
    () => localStorage.getItem(BLE_KEY) === "true",
  );
  const [isPro, setIsPro] = useState(
    () => localStorage.getItem(PRO_KEY) === "true",
  );
  const proExpiry = localStorage.getItem(PRO_EXPIRY_KEY) || "—";

  // Daily notes counter
  const [notesUsed, setNotesUsed] = useState(() => getNotesState().used);

  // Visible peers — appear one-by-one after BLE on, cleared when BLE off
  const [visiblePeerCount, setVisiblePeerCount] = useState(0);
  const scanTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [selectedPeer, setSelectedPeer] = useState<
    (typeof ALL_PEERS)[0] | null
  >(null);

  // Sync with AppSettings Smart Mode toggle
  useEffect(() => {
    const syncSmartMode = () => {
      const appSetting = localStorage.getItem("phonex_smart_mode") === "true";
      if (appSetting !== bleOn) {
        setBleOn(appSetting);
        localStorage.setItem(BLE_KEY, String(appSetting));
      }
    };
    window.addEventListener("storage", syncSmartMode);
    return () => window.removeEventListener("storage", syncSmartMode);
  }, [bleOn]);

  // Peer scan animation
  useEffect(() => {
    if (bleOn) {
      setVisiblePeerCount(0);
      let count = 0;
      const addPeer = () => {
        count += 1;
        setVisiblePeerCount(count);
        if (count < ALL_PEERS.length) {
          scanTimerRef.current = setTimeout(addPeer, 900);
        }
      };
      scanTimerRef.current = setTimeout(addPeer, 600);
    } else {
      if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
      setVisiblePeerCount(0);
    }
    return () => {
      if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
    };
  }, [bleOn]);

  const visiblePeers = ALL_PEERS.slice(0, visiblePeerCount);

  function handleBleToggle(v: boolean) {
    setBleOn(v);
    localStorage.setItem(BLE_KEY, String(v));
    // Also sync with AppSettings key
    localStorage.setItem("phonex_smart_mode", String(v));
  }

  function handleProActivated() {
    setIsPro(true);
  }

  function handleNoteSent() {
    const next = incrementNotes();
    setNotesUsed(next);
  }

  function handlePeerChat(peer: (typeof ALL_PEERS)[0]) {
    setSelectedPeer(peer);
    setActiveTab("chat");
  }

  const subTabs: { id: SmartSubTab; label: string }[] = [
    { id: "smart", label: "Smart" },
    { id: "peers", label: "Peers" },
    { id: "chat", label: "Chat" },
    { id: "blast", label: "Blast" },
    { id: "account", label: "Account" },
    { id: "billing", label: "Billing" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Sub-nav */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide border-b border-border/50">
        {subTabs.map((t) => (
          <SubTab
            key={t.id}
            id={t.id}
            label={t.label}
            active={activeTab === t.id}
            onClick={() => setActiveTab(t.id)}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="h-full overflow-y-auto"
          >
            {activeTab === "smart" && (
              <SmartSubTabView
                bleOn={bleOn}
                setBleOn={handleBleToggle}
                isPro={isPro}
                notesUsed={notesUsed}
                onNavigate={setActiveTab}
                visiblePeers={visiblePeers}
              />
            )}
            {activeTab === "peers" && (
              <PeersSubTabView
                bleOn={bleOn}
                visiblePeers={visiblePeers}
                onChat={handlePeerChat}
              />
            )}
            {activeTab === "chat" && (
              <ChatSubTabView
                selectedPeer={selectedPeer}
                bleOn={bleOn}
                isPro={isPro}
                notesUsed={notesUsed}
                onNoteSent={handleNoteSent}
                onNavigate={setActiveTab}
              />
            )}
            {activeTab === "blast" && <BlastSubTabView bleOn={bleOn} />}
            {activeTab === "account" && (
              <AccountSubTabView
                bleOn={bleOn}
                isPro={isPro}
                proExpiry={proExpiry}
                notesUsed={notesUsed}
                onBilling={() => setActiveTab("billing")}
              />
            )}
            {activeTab === "billing" && (
              <BillingSubTabView
                isPro={isPro}
                onProActivated={handleProActivated}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
