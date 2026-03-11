import { Badge } from "@/components/ui/badge";
import { Phone, PhoneIncoming, PhoneMissed, PhoneOutgoing } from "lucide-react";
import { motion } from "motion/react";

type CallType = "incoming" | "outgoing" | "missed";

const SAMPLE_CALLS: {
  name: string;
  time: string;
  type: CallType;
  duration: string;
  avatar: string;
}[] = [
  {
    name: "Alice Johnson",
    time: "Today, 2:34 PM",
    type: "incoming",
    duration: "5m 12s",
    avatar: "AJ",
  },
  {
    name: "Bob Martinez",
    time: "Today, 11:08 AM",
    type: "outgoing",
    duration: "1m 47s",
    avatar: "BM",
  },
  {
    name: "Carol White",
    time: "Today, 9:15 AM",
    type: "missed",
    duration: "",
    avatar: "CW",
  },
  {
    name: "David Kim",
    time: "Yesterday, 7:22 PM",
    type: "outgoing",
    duration: "12m 03s",
    avatar: "DK",
  },
  {
    name: "Emma Clarke",
    time: "Yesterday, 3:55 PM",
    type: "incoming",
    duration: "3m 30s",
    avatar: "EC",
  },
  {
    name: "Frank Lee",
    time: "Mon, 10:44 AM",
    type: "missed",
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

export default function CallsTab() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 py-4 flex justify-between items-center">
        <div>
          <h2 className="font-display font-bold text-lg text-foreground">
            Recent Calls
          </h2>
          <p className="text-sm text-muted-foreground">
            {SAMPLE_CALLS.length} calls
          </p>
        </div>
        <button
          type="button"
          data-ocid="calls.primary_button"
          className="w-9 h-9 rounded-full phoenix-gradient flex items-center justify-center shadow-md"
          aria-label="New call"
        >
          <Phone className="w-5 h-5 text-primary-foreground" />
        </button>
      </div>

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
              className="bg-card rounded-2xl px-4 py-3 border border-border flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full phoenix-gradient flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary-foreground">
                {call.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-sm text-foreground truncate">
                  {call.name}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                  <span className={`text-xs ${color}`}>{label}</span>
                  {call.duration && (
                    <span className="text-xs text-muted-foreground ml-1">
                      · {call.duration}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-muted-foreground">{call.time}</p>
                {call.type === "missed" && (
                  <Badge className="mt-1 text-xs px-1.5 py-0 bg-destructive/15 text-destructive border-0">
                    Missed
                  </Badge>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
