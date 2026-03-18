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
  MessageCircle,
  Radio,
  Send,
  Signal,
  Star,
  User,
  Users,
  Wifi,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

type SmartSubTab = "smart" | "peers" | "chat" | "blast" | "account" | "billing";
type BillingStep = 1 | 2 | 3 | 4;

const PEERS = [
  {
    id: "p1",
    name: "Alice",
    initials: "AL",
    signal: 4,
    hop: 1,
    dist: "0.3km",
    color: "bg-blue-500",
  },
  {
    id: "p2",
    name: "Bob",
    initials: "BO",
    signal: 3,
    hop: 2,
    dist: "1.2km",
    color: "bg-emerald-500",
  },
  {
    id: "p3",
    name: "Charlie",
    initials: "CH",
    signal: 3,
    hop: 1,
    dist: "2.8km",
    color: "bg-violet-500",
  },
  {
    id: "p4",
    name: "Diana",
    initials: "DI",
    signal: 2,
    hop: 3,
    dist: "3.5km",
    color: "bg-rose-500",
  },
];

const RELAYS = [
  { id: "r1", name: "Relay Node 1", dist: "1.8km" },
  { id: "r2", name: "Relay Node 2", dist: "3.1km" },
];

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

// ── Smart sub-tab ────────────────────────────────────────────────────────────
function SmartSubTabView({
  bleOn,
  setBleOn,
  onNavigate,
}: {
  bleOn: boolean;
  setBleOn: (v: boolean) => void;
  onNavigate: (t: SmartSubTab) => void;
}) {
  const notesUsed = 12;
  const notesTotal = 20;

  return (
    <div className="p-4 space-y-5 overflow-y-auto">
      {/* BLE Orb */}
      <div className="flex flex-col items-center gap-3 pt-4">
        <motion.button
          type="button"
          data-ocid="smart.ble.toggle"
          onClick={() => setBleOn(!bleOn)}
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
        <p
          className="text-sm font-semibold"
          style={{ color: bleOn ? "#60a5fa" : undefined }}
        >
          Smart Mode: {bleOn ? "Active" : "Offline"}
        </p>
      </div>

      {/* Stats */}
      {bleOn && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-4 gap-2"
        >
          {[
            { label: "Peers", value: "3", color: "#60a5fa" },
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

      {/* Daily Notes */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Daily Notes</p>
          <span className="text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
            Free Plan
          </span>
        </div>
        <Progress value={(notesUsed / notesTotal) * 100} className="h-2" />
        <p className="text-xs text-muted-foreground">
          {notesUsed} / {notesTotal} Notes Used
        </p>
        <Button
          size="sm"
          data-ocid="smart.upgrade.button"
          onClick={() => onNavigate("billing")}
          className="w-full mt-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 hover:opacity-90"
        >
          <Star className="w-3.5 h-3.5 mr-1.5" />
          Upgrade to Pro — PKR 1,000/year
        </Button>
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
          onClick={() => toast.info("Pro Only — Upgrade to access BT Calls")}
          className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-muted/60 border border-border hover:bg-muted/80 transition-colors"
        >
          <Signal className="w-5 h-5 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground font-semibold">
            BT Call
          </span>
          <span className="text-[9px] text-amber-500 -mt-1">Pro Only</span>
        </button>
      </div>
    </div>
  );
}

// ── Peers sub-tab ────────────────────────────────────────────────────────────
function PeersSubTabView({
  onChat,
}: { onChat: (peer: (typeof PEERS)[0]) => void }) {
  return (
    <div className="p-4 space-y-4 overflow-y-auto">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Live Peers
      </p>
      <div className="space-y-2">
        {PEERS.map((peer, idx) => (
          <motion.div
            key={peer.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.06 }}
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
function ChatSubTabView({
  selectedPeer,
}: { selectedPeer: (typeof PEERS)[0] | null }) {
  const [messages, setMessages] = useState<
    { id: string; text: string; side: "sent" | "recv" }[]
  >([]);
  const [input, setInput] = useState("");
  const notesUsed = 12;
  const notesTotal = 20;
  const limitReached = notesUsed >= notesTotal;

  function sendMsg() {
    if (!input.trim() || limitReached) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text: input.trim(), side: "sent" },
    ]);
    setInput("");
    // Simulate reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), text: "Got it! 👋", side: "recv" },
      ]);
    }, 800);
  }

  return (
    <div className="flex flex-col h-full">
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
          <p className="text-sm text-muted-foreground">Select a peer to chat</p>
        )}
      </div>

      <div className="px-3 py-2 border-b border-border/50">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-muted-foreground">
            Daily messages: {notesUsed}/{notesTotal}
          </span>
          {limitReached && (
            <span className="text-[10px] text-amber-500 font-semibold">
              Upgrade to Pro!
            </span>
          )}
        </div>
        <Progress value={(notesUsed / notesTotal) * 100} className="h-1" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {messages.length === 0 ? (
          <div className="text-center py-12" data-ocid="smart.chat.empty_state">
            <MessageCircle className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No messages yet</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.side === "sent" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm ${
                  msg.side === "sent"
                    ? "bg-blue-500 text-white"
                    : "bg-card border border-border text-foreground"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="px-3 py-2 border-t border-border flex gap-2">
        <Input
          data-ocid="smart.chat.input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMsg()}
          placeholder={
            limitReached ? "Daily limit reached" : "Message via BLE..."
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
function BlastSubTabView() {
  const [msg, setMsg] = useState("");
  const [history, setHistory] = useState<string[]>([]);

  function handleBlast() {
    if (!msg.trim()) return;
    setHistory((prev) => [msg.trim(), ...prev]);
    setMsg("");
    toast.success("Broadcast sent to 4 peers! 📡");
  }

  return (
    <div className="p-4 space-y-4">
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
              key={`blast-${idx}-${h.slice(0, 10)}`}
              data-ocid={`smart.blast.item.${idx + 1}`}
              className="bg-card border border-border rounded-xl px-4 py-3"
            >
              <p className="text-sm text-foreground">{h}</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Sent to 4 peers
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
  onBilling,
}: { bleOn: boolean; onBilling: () => void }) {
  const { currentUser } = useAuth();
  const name = currentUser?.displayName || "User";
  const email = currentUser?.email || "";
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="p-4 space-y-4">
      <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-black">
            {initial}
          </div>
          <div>
            <p className="font-bold text-foreground">{name}</p>
            <p className="text-xs text-muted-foreground">{email}</p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
        <p className="text-sm font-bold text-foreground">Subscription</p>
        {[
          "Plan: Free",
          "Price: PKR 0/month",
          "Notes Used: 12 / 20",
          "Expiry: —",
        ].map((line) => (
          <div
            key={line}
            className="flex items-center justify-between py-1 border-b border-border/40 last:border-0"
          >
            <span className="text-sm text-foreground">
              {line.split(":")[0]}:
            </span>
            <span className="text-sm text-muted-foreground">
              {line.split(":").slice(1).join(":").trim()}
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

      <Button
        data-ocid="smart.account.upgrade_button"
        onClick={onBilling}
        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 hover:opacity-90"
      >
        <Star className="w-4 h-4 mr-2" /> Upgrade to Pro — PKR 1,000/year
      </Button>
    </div>
  );
}

// ── Billing sub-tab ──────────────────────────────────────────────────────────
function BillingSubTabView() {
  const [step, setStep] = useState<BillingStep>(1);
  const [txId, setTxId] = useState("");
  const [jazzNumber, setJazzNumber] = useState("");
  const [proActive, setProActive] = useState(false);

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

  if (proActive) {
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
          Smart Pro Activated!
        </h2>
        <p className="text-muted-foreground text-sm">
          1 Year subscription active
        </p>
        <div className="flex flex-col gap-1 text-sm">
          <p className="text-foreground font-semibold">✓ Unlimited Notes</p>
          <p className="text-foreground font-semibold">✓ BT Calls Enabled</p>
          <p className="text-foreground font-semibold">
            ✓ Priority Relay Nodes
          </p>
        </div>
        <Button
          data-ocid="smart.billing.back.button"
          onClick={() => {
            setStep(1);
            setProActive(false);
          }}
          className="mt-2 bg-blue-500 text-white border-0"
        >
          Back to Smart
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="p-4 space-y-4 overflow-y-auto">
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
              ].map((step) => (
                <p key={step} className="text-xs text-muted-foreground">
                  {step}
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
                setStep(4);
                setProActive(true);
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
  const [bleOn, setBleOn] = useState(false);
  const [selectedPeer, setSelectedPeer] = useState<(typeof PEERS)[0] | null>(
    null,
  );

  const subTabs: { id: SmartSubTab; label: string }[] = [
    { id: "smart", label: "Smart" },
    { id: "peers", label: "Peers" },
    { id: "chat", label: "Chat" },
    { id: "blast", label: "Blast" },
    { id: "account", label: "Account" },
    { id: "billing", label: "Billing" },
  ];

  function handlePeerChat(peer: (typeof PEERS)[0]) {
    setSelectedPeer(peer);
    setActiveTab("chat");
  }

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
                setBleOn={setBleOn}
                onNavigate={setActiveTab}
              />
            )}
            {activeTab === "peers" && (
              <PeersSubTabView onChat={handlePeerChat} />
            )}
            {activeTab === "chat" && (
              <ChatSubTabView selectedPeer={selectedPeer} />
            )}
            {activeTab === "blast" && <BlastSubTabView />}
            {activeTab === "account" && (
              <AccountSubTabView
                bleOn={bleOn}
                onBilling={() => setActiveTab("billing")}
              />
            )}
            {activeTab === "billing" && <BillingSubTabView />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
