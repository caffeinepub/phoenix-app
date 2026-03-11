import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle } from "lucide-react";
import { motion } from "motion/react";
import { useGetChats } from "../hooks/useQueries";

const SAMPLE_CHATS = [
  {
    contact: "Jason",
    lastMessage: "Hey, are you joining the study group tonight?",
    timestamp: BigInt(Date.now()),
    initials: "JA",
    color: "bg-primary",
  },
  {
    contact: "Roy",
    lastMessage: "Sent you the project files, check them out!",
    timestamp: BigInt(Date.now()),
    initials: "RO",
    color: "bg-accent",
  },
  {
    contact: "Alex",
    lastMessage: "Great presentation today, well done 🔥",
    timestamp: BigInt(Date.now()),
    initials: "AL",
    color: "bg-secondary",
  },
  {
    contact: "Maria",
    lastMessage: "Can we reschedule our meeting to Thursday?",
    timestamp: BigInt(Date.now()),
    initials: "MA",
    color: "bg-muted",
  },
];

function formatTime(ts: bigint) {
  const d = new Date(Number(ts));
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatsTab() {
  const { data: backendChats } = useGetChats();

  const chats =
    backendChats && backendChats.length > 0
      ? backendChats.map((c, i) => ({
          ...c,
          initials: c.contact.slice(0, 2).toUpperCase(),
          color: SAMPLE_CHATS[i % SAMPLE_CHATS.length].color,
        }))
      : SAMPLE_CHATS;

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border">
        <div className="relative">
          <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            data-ocid="chats.search_input"
            className="w-full pl-10 pr-4 py-2 bg-secondary rounded-xl text-sm text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:border-primary"
            placeholder="Search conversations..."
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" data-ocid="chats.list">
        {chats.map((chat, idx) => (
          <motion.div
            key={chat.contact}
            data-ocid={`chats.item.${idx + 1}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.07, duration: 0.3 }}
            className="flex items-center gap-4 px-4 py-3.5 hover:bg-accent/50 transition-colors cursor-pointer border-b border-border/50 last:border-0"
          >
            <Avatar className="w-12 h-12 flex-shrink-0">
              <AvatarFallback
                className={`${chat.color} text-primary-foreground font-display font-bold`}
              >
                {chat.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <span className="font-display font-semibold text-foreground">
                  {chat.contact}
                </span>
                <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                  {formatTime(chat.timestamp)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate mt-0.5">
                {chat.lastMessage}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
