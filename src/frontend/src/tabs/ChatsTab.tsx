import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { sendMessage as dbSendMessage, getContacts } from "@/services/PhonexDB";
import {
  ArrowLeft,
  ChevronLeft,
  MessageSquare,
  Mic,
  Play,
  Plus,
  Send,
  UserPlus,
  Users,
  Video,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
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

const SAMPLE_CONTACTS = [
  {
    id: "1",
    name: "James Okafor",
    initials: "JO",
    color: "bg-blue-500",
    phonexId: "PXP-AB12CD34",
  },
  {
    id: "2",
    name: "Sara Müller",
    initials: "SM",
    color: "bg-rose-500",
    phonexId: "PXP-EF56GH78",
  },
  {
    id: "3",
    name: "Liu Wei",
    initials: "LW",
    color: "bg-violet-500",
    phonexId: "PXP-IJ90KL12",
  },
  {
    id: "4",
    name: "Amina Hassan",
    initials: "AH",
    color: "bg-emerald-500",
    phonexId: "PXP-MN34OP56",
  },
  {
    id: "5",
    name: "Carlos Mendez",
    initials: "CM",
    color: "bg-orange-500",
    phonexId: "PXP-QR78ST90",
  },
  {
    id: "6",
    name: "Yuki Tanaka",
    initials: "YT",
    color: "bg-teal-500",
    phonexId: "PXP-UV12WX34",
  },
];

type MessageKind = "text" | "voice" | "video";
type MessageSide = "sent" | "received";

interface ChatMessage {
  id: string;
  kind: MessageKind;
  side: MessageSide;
  text?: string;
  duration?: number;
  timestamp: string;
}

const SAMPLE_MESSAGES: ChatMessage[] = [
  {
    id: "1",
    kind: "text",
    side: "received",
    text: "Hey! What's up?",
    timestamp: "9:00 AM",
  },
  {
    id: "2",
    kind: "text",
    side: "sent",
    text: "Not much, just chilling. You?",
    timestamp: "9:01 AM",
  },
  {
    id: "3",
    kind: "voice",
    side: "received",
    duration: 12,
    timestamp: "9:03 AM",
  },
  {
    id: "4",
    kind: "text",
    side: "sent",
    text: "Haha I heard that! 😂",
    timestamp: "9:04 AM",
  },
  {
    id: "5",
    kind: "video",
    side: "received",
    duration: 30,
    timestamp: "9:06 AM",
  },
  { id: "6", kind: "voice", side: "sent", duration: 8, timestamp: "9:08 AM" },
  {
    id: "7",
    kind: "text",
    side: "received",
    text: "See you at the meeting later?",
    timestamp: "9:10 AM",
  },
];

function formatTime(ts: bigint) {
  const d = new Date(Number(ts));
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function WaveformBars() {
  const heights = [4, 8, 14, 10, 16, 6, 12, 8, 14, 5, 10, 7, 13, 9, 6];
  return (
    <div className="flex items-center gap-0.5 h-5">
      {heights.map((h, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: static decorative
          key={i}
          className="w-1 bg-current rounded-full opacity-80"
          style={{ height: `${h}px` }}
        />
      ))}
    </div>
  );
}

function VoiceBubble({
  duration,
  side,
}: { duration: number; side: MessageSide }) {
  const isSent = side === "sent";
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-2xl text-sm min-w-[140px] ${
        isSent
          ? "bg-primary text-primary-foreground"
          : "bg-card border border-border text-foreground"
      }`}
    >
      <button
        type="button"
        className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 hover:bg-white/30 transition-colors"
      >
        <Play className="w-3.5 h-3.5 fill-current" />
      </button>
      <WaveformBars />
      <span className="text-xs opacity-75 ml-1 flex-shrink-0">
        {formatDuration(duration)}
      </span>
    </div>
  );
}

function VideoBubble({
  duration,
  side,
}: { duration: number; side: MessageSide }) {
  const isSent = side === "sent";
  return (
    <div
      className={`relative rounded-2xl overflow-hidden w-40 h-24 flex items-center justify-center ${
        isSent ? "bg-primary/80" : "bg-muted"
      }`}
    >
      <div className="flex flex-col items-center gap-1">
        <div className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center">
          <Play className="w-5 h-5 fill-white text-white" />
        </div>
        <span className="text-xs text-white font-medium drop-shadow">
          {formatDuration(duration)}
        </span>
      </div>
      <div className="absolute top-2 right-2 bg-black/40 rounded-full px-1.5 py-0.5">
        <span className="text-white text-[10px]">Video</span>
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isSent = msg.side === "sent";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col ${isSent ? "items-end" : "items-start"} mb-2`}
    >
      {msg.kind === "text" && (
        <div
          className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm ${
            isSent
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-card border border-border text-foreground rounded-bl-sm"
          }`}
        >
          {msg.text}
        </div>
      )}
      {msg.kind === "voice" && (
        <VoiceBubble duration={msg.duration ?? 0} side={msg.side} />
      )}
      {msg.kind === "video" && (
        <VideoBubble duration={msg.duration ?? 0} side={msg.side} />
      )}
      <span className="text-[10px] text-muted-foreground mt-1 px-1">
        {msg.timestamp}
      </span>
    </motion.div>
  );
}

type ComposerMode = "text" | "voice" | "video";

function ChatConversation({
  chat,
  onBack,
}: {
  chat: (typeof SAMPLE_CHATS)[0];
  onBack: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(SAMPLE_MESSAGES);
  const [mode, setMode] = useState<ComposerMode>("text");
  const [textInput, setTextInput] = useState("");
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refs not reactive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional - mode read via closure
  useEffect(() => {
    if (recording) {
      setElapsed(0);
      setVideoProgress(0);
      timerRef.current = setInterval(() => {
        setElapsed((e) => {
          if (e >= 29) {
            stopRecording(true);
            return 30;
          }
          if (mode === "video") setVideoProgress(((e + 1) / 30) * 100);
          return e + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recording]);

  function stopRecording(send: boolean) {
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (send && elapsed > 0) {
      const dur = elapsed;
      addMessage({ kind: mode as "voice" | "video", duration: dur });
    }
    setElapsed(0);
    setVideoProgress(0);
  }

  function addMessage(opts: {
    kind: MessageKind;
    text?: string;
    duration?: number;
  }) {
    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), side: "sent", timestamp: now, ...opts },
    ]);
  }

  function sendText() {
    if (!textInput.trim()) return;
    addMessage({ kind: "text", text: textInput.trim() });
    setTextInput("");
  }

  const modeButtons: {
    m: ComposerMode;
    Icon: typeof MessageSquare;
    label: string;
  }[] = [
    { m: "text", Icon: MessageSquare, label: "Text" },
    { m: "voice", Icon: Mic, label: "Voice" },
    { m: "video", Icon: Video, label: "Video" },
  ];

  const circumference = 2 * Math.PI * 18;
  const dash = circumference - (videoProgress / 100) * circumference;

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="absolute inset-0 flex flex-col bg-background z-10"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-3 py-3 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          data-ocid="chats.back_button"
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Avatar className="w-9 h-9">
          <AvatarFallback
            className={`${chat.color} text-primary-foreground text-xs font-bold`}
          >
            {chat.initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-display font-semibold text-foreground text-sm">
            {chat.contact}
          </p>
          <p className="text-xs text-muted-foreground">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
      </div>

      {/* Composer */}
      <div className="border-t border-border px-3 py-2">
        {/* Mode toggles */}
        <div className="flex gap-1 mb-2">
          {modeButtons.map(({ m, Icon, label }) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setRecording(false);
              }}
              data-ocid={`chats.${m}.tab`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                mode === m
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Text mode */}
        {mode === "text" && (
          <div className="flex items-end gap-2">
            <textarea
              data-ocid="chats.text.textarea"
              className="flex-1 resize-none bg-secondary rounded-2xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:border-primary min-h-[38px] max-h-24"
              placeholder="Type a message..."
              rows={1}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendText();
                }
              }}
            />
            <Button
              size="icon"
              onClick={sendText}
              data-ocid="chats.text.submit_button"
              disabled={!textInput.trim()}
              className="rounded-full w-9 h-9 phoenix-gradient flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Voice mode */}
        {mode === "voice" && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              data-ocid="chats.voice.primary_button"
              onClick={() =>
                recording ? stopRecording(true) : setRecording(true)
              }
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                recording
                  ? "bg-destructive shadow-lg scale-110"
                  : "phoenix-gradient shadow-md"
              }`}
            >
              <Mic className="w-5 h-5 text-white" />
            </button>
            {recording ? (
              <div className="flex items-center gap-3 flex-1">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
                  className="w-2.5 h-2.5 rounded-full bg-destructive"
                />
                <span className="text-sm font-mono text-foreground">
                  {formatDuration(elapsed)}
                </span>
                <span className="text-xs text-muted-foreground">
                  / 0:30 max
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => stopRecording(false)}
                  data-ocid="chats.voice.cancel_button"
                  className="ml-auto text-muted-foreground hover:text-destructive"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Tap to record voice note (max 30s)
              </p>
            )}
          </div>
        )}

        {/* Video mode */}
        {mode === "video" && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              data-ocid="chats.video.primary_button"
              onClick={() =>
                recording ? stopRecording(true) : setRecording(true)
              }
              className="relative w-12 h-12 flex items-center justify-center"
            >
              {recording && (
                <svg
                  className="absolute inset-0 w-full h-full -rotate-90"
                  viewBox="0 0 44 44"
                >
                  <title>Recording progress</title>
                  <circle
                    cx="22"
                    cy="22"
                    r="18"
                    fill="none"
                    stroke="oklch(var(--border))"
                    strokeWidth="3"
                  />
                  <circle
                    cx="22"
                    cy="22"
                    r="18"
                    fill="none"
                    stroke="oklch(var(--destructive))"
                    strokeWidth="3"
                    strokeDasharray={circumference}
                    strokeDashoffset={dash}
                    strokeLinecap="round"
                  />
                </svg>
              )}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  recording ? "bg-destructive" : "phoenix-gradient"
                }`}
              >
                <Video className="w-5 h-5 text-white" />
              </div>
            </button>
            {recording ? (
              <div className="flex items-center gap-3 flex-1">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 0.8,
                  }}
                  className="w-2.5 h-2.5 rounded-full bg-destructive"
                />
                <span className="text-sm font-mono text-foreground">
                  {formatDuration(elapsed)}
                </span>
                <span className="text-xs text-muted-foreground">/ 0:30</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => stopRecording(false)}
                  data-ocid="chats.video.cancel_button"
                  className="ml-auto text-muted-foreground hover:text-destructive"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Tap to record video note (max 30s)
              </p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Step 1: pick note type. Step 2: compose.
type NotePickerStep = "pick" | "text" | "voice" | "video";

function NewNoteDialog({
  open,
  onClose,
  initialStep = "pick",
}: { open: boolean; onClose: () => void; initialStep?: NotePickerStep }) {
  const [step, setStep] = useState<NotePickerStep>(initialStep);
  const [to, setTo] = useState("");
  const [contactPickerOpen, setContactPickerOpen] = useState(false);
  const [textBody, setTextBody] = useState("");
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // When dialog opens, jump to the requested initial step
  useEffect(() => {
    if (open) {
      setStep(initialStep);
    }
  }, [open, initialStep]);

  function reset() {
    setStep("pick");
    setTo("");
    setTextBody("");
    setRecording(false);
    setElapsed(0);
    setVideoProgress(0);
    setContactPickerOpen(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function handleClose() {
    reset();
    onClose();
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    if (recording) {
      setElapsed(0);
      setVideoProgress(0);
      timerRef.current = setInterval(() => {
        setElapsed((e) => {
          if (e >= 29) {
            stopRecording(true);
            return 30;
          }
          if (step === "video") setVideoProgress(((e + 1) / 30) * 100);
          return e + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recording]);

  function stopRecording(send: boolean) {
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (send) {
      handleClose();
    }
    setElapsed(0);
    setVideoProgress(0);
  }

  function handleSendText() {
    if (!to.trim() || !textBody.trim()) return;
    handleClose();
    toast.success("Message sent! 💬");
  }

  const circumference = 2 * Math.PI * 18;
  const dash = circumference - (videoProgress / 100) * circumference;

  const noteTypes = [
    {
      type: "text" as const,
      Icon: MessageSquare,
      label: "Text Note",
      desc: "Type a text message",
      color: "bg-blue-500",
    },
    {
      type: "voice" as const,
      Icon: Mic,
      label: "Voice Note",
      desc: "Record up to 30 seconds",
      color: "bg-green-500",
    },
    {
      type: "video" as const,
      Icon: Video,
      label: "Video Note",
      desc: "Record a 30-second clip",
      color: "bg-purple-500",
    },
  ];

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
    >
      <SheetContent
        side="bottom"
        data-ocid="chats.new_note.dialog"
        className="rounded-t-3xl max-h-[45vh] overflow-y-auto px-2 pb-2"
      >
        {step === "pick" && (
          <>
            <SheetHeader>
              <SheetTitle className="font-display font-bold text-foreground">
                New Message
              </SheetTitle>
            </SheetHeader>
            <p className="text-sm text-muted-foreground -mt-1 mb-1">
              Choose a note type to send
            </p>
            <div className="flex flex-col gap-1">
              {noteTypes.map(({ type, Icon, label, desc, color }) => (
                <button
                  key={type}
                  type="button"
                  data-ocid={`chats.new_note.${type}_button`}
                  onClick={() => setStep(type)}
                  className="flex items-center gap-3 p-2 rounded-2xl border border-border bg-secondary hover:bg-accent/50 active:scale-[0.98] transition-all text-left"
                >
                  <div
                    className={`w-6 h-6 rounded-full ${color} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      {label}
                    </p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              data-ocid="chats.new_note.cancel_button"
              onClick={handleClose}
              className="mt-1"
            >
              Cancel
            </Button>
          </>
        )}

        {step === "text" && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep("pick")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  data-ocid="chats.new_note.text.back_button"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <SheetTitle className="font-display font-bold text-foreground">
                  Text Note
                </SheetTitle>
              </div>
            </SheetHeader>
            <div className="flex flex-col gap-2 py-0">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="note-to" className="text-sm font-medium">
                  To
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="note-to"
                    data-ocid="chats.new_note.text.to_input"
                    placeholder="Contact name or ID..."
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="flex-1"
                  />
                  <button
                    type="button"
                    data-ocid="chats.recipient_from_contacts_button"
                    onClick={() => setContactPickerOpen(true)}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors flex-shrink-0 border border-primary/20"
                  >
                    <Users className="w-3.5 h-3.5" />
                    Contacts
                  </button>
                </div>
              </div>
              {/* Contact picker dialog */}
              <Dialog
                open={contactPickerOpen}
                onOpenChange={setContactPickerOpen}
              >
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle className="font-display font-bold">
                      Select Contact
                    </DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                    {SAMPLE_CONTACTS.map((contact, idx) => (
                      <button
                        key={contact.id}
                        type="button"
                        data-ocid={`chats.contact.select_button.${idx + 1}`}
                        onClick={() => {
                          setTo(contact.phonexId);
                          setContactPickerOpen(false);
                        }}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors text-left border border-border hover:border-primary/30"
                      >
                        <div
                          className={`w-9 h-9 rounded-full ${contact.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}
                        >
                          {contact.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground">
                            {contact.name}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {contact.phonexId}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="note-body" className="text-sm font-medium">
                  Message
                </Label>
                <Textarea
                  id="note-body"
                  data-ocid="chats.new_note.text.body_textarea"
                  placeholder="Write your message..."
                  value={textBody}
                  onChange={(e) => setTextBody(e.target.value)}
                  className="min-h-[70px] resize-none"
                />
              </div>
            </div>
            <div className="flex gap-1 justify-end mt-1">
              <Button
                variant="outline"
                data-ocid="chats.new_note.text.cancel_button"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                data-ocid="chats.new_note.text.submit_button"
                onClick={handleSendText}
                disabled={!to.trim() || !textBody.trim()}
                className="phoenix-gradient text-primary-foreground border-0 hover:opacity-90"
              >
                <Send className="w-4 h-4 mr-1" /> Send
              </Button>
            </div>
          </>
        )}

        {step === "voice" && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRecording(false);
                    setStep("pick");
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  data-ocid="chats.new_note.voice.back_button"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <SheetTitle className="font-display font-bold text-foreground">
                  Voice Note
                </SheetTitle>
              </div>
            </SheetHeader>
            <div className="flex flex-col gap-2 py-0">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="voice-to" className="text-sm font-medium">
                  To
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="voice-to"
                    data-ocid="chats.new_note.voice.to_input"
                    placeholder="Contact name..."
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="flex-1"
                  />
                  <button
                    type="button"
                    data-ocid="chats.new_note.voice.contacts_button"
                    onClick={() => setContactPickerOpen(true)}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-green-500/10 text-green-600 text-xs font-medium hover:bg-green-500/20 transition-colors flex-shrink-0 border border-green-500/20"
                  >
                    <Users className="w-3.5 h-3.5" />
                    Contacts
                  </button>
                </div>
                <Dialog
                  open={contactPickerOpen}
                  onOpenChange={setContactPickerOpen}
                >
                  <DialogContent className="max-w-sm">
                    <DialogHeader>
                      <DialogTitle className="font-display font-bold">
                        Select Contact
                      </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                      {SAMPLE_CONTACTS.map((contact, idx) => (
                        <button
                          key={contact.id}
                          type="button"
                          data-ocid={`chats.voice.contact.select_button.${idx + 1}`}
                          onClick={() => {
                            setTo(contact.phonexId);
                            setContactPickerOpen(false);
                          }}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors text-left border border-border hover:border-green-500/30"
                        >
                          <div
                            className={`w-9 h-9 rounded-full ${contact.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}
                          >
                            {contact.initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-foreground">
                              {contact.name}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {contact.phonexId}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex flex-col items-center gap-2 py-2">
                <button
                  type="button"
                  data-ocid="chats.new_note.voice.primary_button"
                  onClick={() =>
                    recording ? stopRecording(true) : setRecording(true)
                  }
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${
                    recording ? "bg-destructive scale-110" : "bg-green-500"
                  }`}
                >
                  <Mic className="w-7 h-7 text-white" />
                </button>
                {recording ? (
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                      transition={{
                        repeat: Number.POSITIVE_INFINITY,
                        duration: 1,
                      }}
                      className="w-2.5 h-2.5 rounded-full bg-destructive"
                    />
                    <span className="text-sm font-mono font-semibold text-foreground">
                      {formatDuration(elapsed)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      / 0:30 max
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center">
                    Tap the mic to start recording
                    <br />
                    (max 30 seconds)
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-1 justify-end mt-1">
              <Button
                variant="outline"
                data-ocid="chats.new_note.voice.cancel_button"
                onClick={handleClose}
              >
                Cancel
              </Button>
              {recording && (
                <Button
                  data-ocid="chats.new_note.voice.stop_button"
                  onClick={() => stopRecording(true)}
                  className="bg-destructive text-white hover:bg-destructive/90 border-0"
                >
                  Stop & Send
                </Button>
              )}
            </div>
          </>
        )}

        {step === "video" && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRecording(false);
                    setStep("pick");
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  data-ocid="chats.new_note.video.back_button"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <SheetTitle className="font-display font-bold text-foreground">
                  Video Note
                </SheetTitle>
              </div>
            </SheetHeader>
            <div className="flex flex-col gap-2 py-0">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="video-to" className="text-sm font-medium">
                  To
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="video-to"
                    data-ocid="chats.new_note.video.to_input"
                    placeholder="Contact name..."
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="flex-1"
                  />
                  <button
                    type="button"
                    data-ocid="chats.new_note.video.contacts_button"
                    onClick={() => setContactPickerOpen(true)}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-purple-500/10 text-purple-600 text-xs font-medium hover:bg-purple-500/20 transition-colors flex-shrink-0 border border-purple-500/20"
                  >
                    <Users className="w-3.5 h-3.5" />
                    Contacts
                  </button>
                </div>
                <Dialog
                  open={contactPickerOpen}
                  onOpenChange={setContactPickerOpen}
                >
                  <DialogContent className="max-w-sm">
                    <DialogHeader>
                      <DialogTitle className="font-display font-bold">
                        Select Contact
                      </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                      {SAMPLE_CONTACTS.map((contact, idx) => (
                        <button
                          key={contact.id}
                          type="button"
                          data-ocid={`chats.video.contact.select_button.${idx + 1}`}
                          onClick={() => {
                            setTo(contact.phonexId);
                            setContactPickerOpen(false);
                          }}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors text-left border border-border hover:border-purple-500/30"
                        >
                          <div
                            className={`w-9 h-9 rounded-full ${contact.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}
                          >
                            {contact.initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-foreground">
                              {contact.name}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {contact.phonexId}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex flex-col items-center gap-2 py-2">
                <button
                  type="button"
                  data-ocid="chats.new_note.video.primary_button"
                  onClick={() =>
                    recording ? stopRecording(true) : setRecording(true)
                  }
                  className="relative w-16 h-16 flex items-center justify-center"
                >
                  {recording && (
                    <svg
                      className="absolute inset-0 w-full h-full -rotate-90"
                      viewBox="0 0 44 44"
                    >
                      <title>Recording progress</title>
                      <circle
                        cx="22"
                        cy="22"
                        r="18"
                        fill="none"
                        stroke="oklch(var(--border))"
                        strokeWidth="3"
                      />
                      <circle
                        cx="22"
                        cy="22"
                        r="18"
                        fill="none"
                        stroke="oklch(var(--destructive))"
                        strokeWidth="3"
                        strokeDasharray={circumference}
                        strokeDashoffset={dash}
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${
                      recording ? "bg-destructive" : "bg-purple-500"
                    }`}
                  >
                    <Video className="w-7 h-7 text-white" />
                  </div>
                </button>
                {recording ? (
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                      transition={{
                        repeat: Number.POSITIVE_INFINITY,
                        duration: 0.8,
                      }}
                      className="w-2.5 h-2.5 rounded-full bg-destructive"
                    />
                    <span className="text-sm font-mono font-semibold text-foreground">
                      {formatDuration(elapsed)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      / 0:30
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center">
                    Tap the camera to start recording
                    <br />
                    (max 30 seconds)
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-1 justify-end mt-1">
              <Button
                variant="outline"
                data-ocid="chats.new_note.video.cancel_button"
                onClick={handleClose}
              >
                Cancel
              </Button>
              {recording && (
                <Button
                  data-ocid="chats.new_note.video.stop_button"
                  onClick={() => stopRecording(true)}
                  className="bg-destructive text-white hover:bg-destructive/90 border-0"
                >
                  Stop & Send
                </Button>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default function ChatsTab() {
  const { currentUser } = useAuth();
  const { data: backendChats } = useGetChats();
  const dbContacts = currentUser?.paymentId
    ? getContacts(currentUser.paymentId)
    : [];
  const dynamicContacts =
    dbContacts.length > 0
      ? dbContacts.map((c, i) => ({
          id: c.id,
          name: c.name,
          initials: c.name.slice(0, 2).toUpperCase(),
          color:
            SAMPLE_CONTACTS[i % SAMPLE_CONTACTS.length]?.color ?? "bg-primary",
          phonexId: c.phonexId,
        }))
      : SAMPLE_CONTACTS;
  const [selectedChat, setSelectedChat] = useState<
    (typeof SAMPLE_CHATS)[0] | null
  >(null);
  const [newMessageOpen, setNewMessageOpen] = useState(false);
  const [noteInitialStep, setNoteInitialStep] =
    useState<NotePickerStep>("pick");
  const [contactsSheetOpen, setContactsSheetOpen] = useState(false);

  function openNoteDialog(step: NotePickerStep) {
    setNoteInitialStep(step);
    setNewMessageOpen(true);
  }

  const chats =
    backendChats && backendChats.length > 0
      ? backendChats.map((c, i) => ({
          ...c,
          initials: c.contact.slice(0, 2).toUpperCase(),
          color: SAMPLE_CHATS[i % SAMPLE_CHATS.length].color,
        }))
      : SAMPLE_CHATS;

  const noteActions = [
    {
      step: "text" as const,
      Icon: MessageSquare,
      label: "Text Note",
      color: "bg-blue-500",
      borderColor: "border-blue-400",
      ocid: "chats.text_note.button",
    },
    {
      step: "voice" as const,
      Icon: Mic,
      label: "Voice Note",
      color: "bg-green-500",
      borderColor: "border-green-400",
      ocid: "chats.voice_note.button",
    },
    {
      step: "video" as const,
      Icon: Video,
      label: "Video Note",
      color: "bg-purple-500",
      borderColor: "border-purple-400",
      ocid: "chats.video_note.button",
    },
  ];

  return (
    <div className="flex flex-col h-full relative">
      {/* Chat list */}
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 border-b border-border">
          {/* Top row: Messages label + E2E badge */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-foreground">
              Messages
            </span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full">
              🔒 End-to-End Encrypted
            </span>
          </div>

          {/* Search bar + contacts button */}
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
              <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                data-ocid="chats.search_input"
                className="w-full pl-10 pr-4 py-2 bg-secondary rounded-xl text-sm text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:border-primary"
                placeholder="Search conversations..."
              />
            </div>
            <button
              type="button"
              data-ocid="chats.contacts_button"
              onClick={() => setContactsSheetOpen(true)}
              className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shadow-sm hover:bg-accent active:scale-95 transition-all flex-shrink-0 border border-border"
            >
              <Users className="w-4 h-4 text-foreground" />
            </button>
          </div>

          {/* Note type circular dashed buttons — same spot as old New Chat */}
          <div className="flex items-start justify-around">
            {noteActions.map(({ step, Icon, label, ocid }) => (
              <button
                key={step}
                type="button"
                data-ocid={ocid}
                onClick={() => openNoteDialog(step)}
                className="flex flex-col items-center gap-1.5 active:scale-95 transition-all"
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all hover:scale-105 hover:shadow-xl border border-white/30 backdrop-blur-sm ${
                    step === "text"
                      ? "bg-gradient-to-br from-blue-400/80 via-blue-500/60 to-cyan-400/80"
                      : step === "voice"
                        ? "bg-gradient-to-br from-emerald-400/80 via-green-500/60 to-teal-400/80"
                        : "bg-gradient-to-br from-violet-400/80 via-purple-500/60 to-fuchsia-400/80"
                  }`}
                  style={{
                    boxShadow:
                      step === "text"
                        ? "0 4px 20px rgba(59,130,246,0.5), inset 0 1px 0 rgba(255,255,255,0.3)"
                        : step === "voice"
                          ? "0 4px 20px rgba(16,185,129,0.5), inset 0 1px 0 rgba(255,255,255,0.3)"
                          : "0 4px 20px rgba(139,92,246,0.5), inset 0 1px 0 rgba(255,255,255,0.3)",
                  }}
                >
                  <Icon className="w-6 h-6 text-white drop-shadow-md" />
                </div>
                <span className="text-[11px] font-semibold text-foreground leading-tight text-center">
                  {label}
                </span>
              </button>
            ))}
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
              onClick={() => setSelectedChat(chat)}
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

      {/* Conversation overlay */}
      <AnimatePresence>
        {selectedChat && (
          <ChatConversation
            chat={selectedChat}
            onBack={() => setSelectedChat(null)}
          />
        )}
      </AnimatePresence>

      {/* New Note Dialog */}
      <NewNoteDialog
        open={newMessageOpen}
        onClose={() => setNewMessageOpen(false)}
        initialStep={noteInitialStep}
      />

      {/* Contacts Sheet */}
      <Sheet open={contactsSheetOpen} onOpenChange={setContactsSheetOpen}>
        <SheetContent
          side="right"
          data-ocid="chats.contacts_sheet"
          className="w-full sm:max-w-sm p-0 flex flex-col"
        >
          <SheetHeader className="px-4 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg phoenix-gradient flex items-center justify-center">
                <Users className="w-4 h-4 text-primary-foreground" />
              </div>
              <SheetTitle className="font-display font-bold text-foreground">
                Contacts
              </SheetTitle>
            </div>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
            {dynamicContacts.map((contact, idx) => (
              <motion.div
                key={contact.id}
                data-ocid={`chats.contact.item.${idx + 1}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-2xl border border-border hover:bg-accent/40 transition-colors"
              >
                <div
                  className={`w-11 h-11 rounded-full ${contact.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm`}
                >
                  {contact.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-foreground text-sm">
                    {contact.name}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    {contact.phonexId}
                  </p>
                </div>
                <Button
                  size="sm"
                  data-ocid={`chats.contact.select_button.${idx + 1}`}
                  onClick={() => {
                    setContactsSheetOpen(false);
                    openNoteDialog("text");
                  }}
                  className="phoenix-gradient text-primary-foreground border-0 hover:opacity-90 text-xs px-3 h-8 flex-shrink-0"
                >
                  <UserPlus className="w-3 h-3 mr-1" />
                  Message
                </Button>
              </motion.div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
