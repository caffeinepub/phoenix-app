import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Phone,
  PhoneIncoming,
  PhoneMissed,
  PhoneOutgoing,
  Video,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

type CallType = "incoming" | "outgoing" | "missed";
type CallKind = "voice" | "video";

const SAMPLE_CALLS: {
  name: string;
  time: string;
  type: CallType;
  callKind: CallKind;
  duration: string;
  avatar: string;
}[] = [
  {
    name: "Alice Johnson",
    time: "Today, 2:34 PM",
    type: "incoming",
    callKind: "video",
    duration: "5m 12s",
    avatar: "AJ",
  },
  {
    name: "Bob Martinez",
    time: "Today, 11:08 AM",
    type: "outgoing",
    callKind: "voice",
    duration: "1m 47s",
    avatar: "BM",
  },
  {
    name: "Carol White",
    time: "Today, 9:15 AM",
    type: "missed",
    callKind: "voice",
    duration: "",
    avatar: "CW",
  },
  {
    name: "David Kim",
    time: "Yesterday, 7:22 PM",
    type: "outgoing",
    callKind: "video",
    duration: "12m 03s",
    avatar: "DK",
  },
  {
    name: "Emma Clarke",
    time: "Yesterday, 3:55 PM",
    type: "incoming",
    callKind: "voice",
    duration: "3m 30s",
    avatar: "EC",
  },
  {
    name: "Frank Lee",
    time: "Mon, 10:44 AM",
    type: "missed",
    callKind: "video",
    duration: "",
    avatar: "FL",
  },
];

const CALL_META: Record<
  CallType,
  { Icon: typeof Phone; color: string; label: string }
> = {
  incoming: {
    Icon: PhoneIncoming,
    color: "text-emerald-500",
    label: "Incoming",
  },
  outgoing: { Icon: PhoneOutgoing, color: "text-primary", label: "Outgoing" },
  missed: { Icon: PhoneMissed, color: "text-destructive", label: "Missed" },
};

function formatElapsed(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

interface ActiveCall {
  name: string;
  avatar: string;
  kind: CallKind;
}

function CallOverlay({ call, onEnd }: { call: ActiveCall; onEnd: () => void }) {
  const [elapsed, setElapsed] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    ref.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => {
      if (ref.current) clearInterval(ref.current);
    };
  }, []);

  return (
    <motion.div
      data-ocid="calls.modal"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 z-20 flex flex-col items-center justify-between py-12 px-6"
      style={{
        background:
          call.kind === "video"
            ? "linear-gradient(180deg, oklch(0.1 0.02 250), oklch(0.05 0.01 250))"
            : "linear-gradient(180deg, oklch(0.14 0.05 250), oklch(0.1 0.03 250))",
      }}
    >
      <div className="flex flex-col items-center gap-4 mt-4">
        <div className="relative">
          {/* Pulsing rings */}
          <motion.div
            animate={{ scale: [1, 1.35, 1], opacity: [0.4, 0, 0.4] }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 2,
              ease: "easeOut",
            }}
            className="absolute inset-0 rounded-full border-2 border-white/40"
          />
          <motion.div
            animate={{ scale: [1, 1.6, 1], opacity: [0.2, 0, 0.2] }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 2,
              delay: 0.5,
              ease: "easeOut",
            }}
            className="absolute inset-0 rounded-full border border-white/20"
          />
          {call.kind === "video" ? (
            <div className="w-24 h-24 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center">
              <Video className="w-10 h-10 text-white/60" />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full phoenix-gradient flex items-center justify-center text-2xl font-bold text-white">
              {call.avatar}
            </div>
          )}
        </div>

        <div className="text-center">
          <h2 className="text-white font-display font-bold text-2xl">
            {call.name}
          </h2>
          <div className="flex items-center gap-2 justify-center mt-1">
            {call.kind === "video" ? (
              <Video className="w-4 h-4 text-blue-300" />
            ) : (
              <Phone className="w-4 h-4 text-emerald-300" />
            )}
            <span className="text-white/70 text-sm capitalize">
              {call.kind} Call
            </span>
          </div>
          <p className="text-white font-mono text-lg mt-3 tracking-widest">
            {formatElapsed(elapsed)}
          </p>
        </div>
      </div>

      {call.kind === "video" && (
        <div className="w-full flex justify-center">
          <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center">
            <Video className="w-8 h-8 text-white/30 mx-auto mb-1" />
            <p className="text-white/40 text-xs">Camera off</p>
          </div>
        </div>
      )}

      <button
        type="button"
        data-ocid="calls.close_button"
        onClick={onEnd}
        className="w-16 h-16 rounded-full bg-destructive flex items-center justify-center shadow-xl hover:bg-destructive/90 transition-colors"
        aria-label="End call"
      >
        <X className="w-7 h-7 text-white" />
      </button>
    </motion.div>
  );
}

export default function CallsTab() {
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);

  function startCall(name: string, avatar: string, kind: CallKind) {
    setActiveCall({ name, avatar, kind });
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto relative">
      {/* Header */}
      <div className="px-4 py-4 flex justify-between items-center">
        <div>
          <h2 className="font-display font-bold text-lg text-foreground">
            Recent Calls
          </h2>
          <p className="text-sm text-muted-foreground">
            {SAMPLE_CALLS.length} calls
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            data-ocid="calls.primary_button"
            onClick={() => startCall("New Contact", "NC", "voice")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full phoenix-gradient text-primary-foreground text-xs font-medium shadow-md hover:opacity-90 transition-opacity"
          >
            <Phone className="w-3.5 h-3.5" />
            Voice
          </button>
          <button
            type="button"
            data-ocid="calls.secondary_button"
            onClick={() => startCall("New Contact", "NC", "video")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-blue-500 text-white text-xs font-medium shadow-md hover:opacity-90 transition-opacity"
          >
            <Video className="w-3.5 h-3.5" />
            Video
          </button>
        </div>
      </div>

      {/* Call list */}
      <div className="px-4 pb-6 flex flex-col gap-2" data-ocid="calls.list">
        {SAMPLE_CALLS.map((call, idx) => {
          const { Icon, color, label } = CALL_META[call.type];
          return (
            <motion.div
              key={`${call.name}-${idx}`}
              data-ocid={`calls.item.${idx + 1}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07, duration: 0.3 }}
              className="bg-card rounded-2xl px-4 py-3 border border-border flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full phoenix-gradient flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary-foreground">
                {call.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-sm text-foreground truncate">
                  {call.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                  <span className={`text-xs ${color}`}>{label}</span>
                  {call.duration && (
                    <span className="text-xs text-muted-foreground">
                      · {call.duration}
                    </span>
                  )}
                  <Badge
                    className={`text-[10px] px-1.5 py-0 border-0 ${
                      call.callKind === "video"
                        ? "bg-blue-500/15 text-blue-500"
                        : "bg-emerald-500/15 text-emerald-600"
                    }`}
                  >
                    {call.callKind === "video" ? (
                      <>
                        <Video className="w-2.5 h-2.5 mr-0.5" />
                        Video
                      </>
                    ) : (
                      <>
                        <Phone className="w-2.5 h-2.5 mr-0.5" />
                        Voice
                      </>
                    )}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <p className="text-xs text-muted-foreground">{call.time}</p>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    data-ocid={`calls.item.${idx + 1}`}
                    onClick={() => startCall(call.name, call.avatar, "voice")}
                    className="w-7 h-7 rounded-full bg-emerald-500/15 flex items-center justify-center hover:bg-emerald-500/30 transition-colors"
                    aria-label={`Voice call ${call.name}`}
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  </button>
                  <button
                    type="button"
                    data-ocid={`calls.item.${idx + 1}`}
                    onClick={() => startCall(call.name, call.avatar, "video")}
                    className="w-7 h-7 rounded-full bg-blue-500/15 flex items-center justify-center hover:bg-blue-500/30 transition-colors"
                    aria-label={`Video call ${call.name}`}
                  >
                    <Video className="w-3.5 h-3.5 text-blue-500" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Active call overlay */}
      <AnimatePresence>
        {activeCall && (
          <CallOverlay call={activeCall} onEnd={() => setActiveCall(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
