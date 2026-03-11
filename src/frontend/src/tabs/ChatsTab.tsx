import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  ChevronLeft,
  MessageSquare,
  Mic,
  Play,
  Plus,
  Send,
  Video,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
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
}: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<NotePickerStep>("pick");
  const [to, setTo] = useState("");
  const [textBody, setTextBody] = useState("");
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function reset() {
    setStep("pick");
    setTo("");
    setTextBody("");
    setRecording(false);
    setElapsed(0);
    setVideoProgress(0);
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
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
    >
      <DialogContent data-ocid="chats.new_note.dialog" className="sm:max-w-sm">
        {step === "pick" && (
          <>
            <DialogHeader>
              <DialogTitle className="font-display font-bold text-foreground">
                New Message
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground -mt-1 mb-1">
              Choose a note type to send
            </p>
            <div className="flex flex-col gap-3">
              {noteTypes.map(({ type, Icon, label, desc, color }) => (
                <button
                  key={type}
                  type="button"
                  data-ocid={`chats.new_note.${type}_button`}
                  onClick={() => setStep(type)}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-secondary hover:bg-accent/50 active:scale-[0.98] transition-all text-left"
                >
                  <div
                    className={`w-10 h-10 rounded-full ${color} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className="w-5 h-5 text-white" />
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
            <DialogHeader>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep("pick")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  data-ocid="chats.new_note.text.back_button"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <DialogTitle className="font-display font-bold text-foreground">
                  Text Note
                </DialogTitle>
              </div>
            </DialogHeader>
            <div className="flex flex-col gap-3 py-1">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="note-to" className="text-sm font-medium">
                  To
                </Label>
                <Input
                  id="note-to"
                  data-ocid="chats.new_note.text.to_input"
                  placeholder="Contact name..."
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
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
                  className="min-h-[100px] resize-none"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
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
            </DialogFooter>
          </>
        )}

        {step === "voice" && (
          <>
            <DialogHeader>
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
                <DialogTitle className="font-display font-bold text-foreground">
                  Voice Note
                </DialogTitle>
              </div>
            </DialogHeader>
            <div className="flex flex-col gap-3 py-1">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="voice-to" className="text-sm font-medium">
                  To
                </Label>
                <Input
                  id="voice-to"
                  data-ocid="chats.new_note.voice.to_input"
                  placeholder="Contact name..."
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
              <div className="flex flex-col items-center gap-4 py-4">
                <button
                  type="button"
                  data-ocid="chats.new_note.voice.primary_button"
                  onClick={() =>
                    recording ? stopRecording(true) : setRecording(true)
                  }
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${
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
            <DialogFooter className="gap-2">
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
            </DialogFooter>
          </>
        )}

        {step === "video" && (
          <>
            <DialogHeader>
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
                <DialogTitle className="font-display font-bold text-foreground">
                  Video Note
                </DialogTitle>
              </div>
            </DialogHeader>
            <div className="flex flex-col gap-3 py-1">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="video-to" className="text-sm font-medium">
                  To
                </Label>
                <Input
                  id="video-to"
                  data-ocid="chats.new_note.video.to_input"
                  placeholder="Contact name..."
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
              <div className="flex flex-col items-center gap-4 py-4">
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
            <DialogFooter className="gap-2">
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
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function ChatsTab() {
  const { data: backendChats } = useGetChats();
  const [selectedChat, setSelectedChat] = useState<
    (typeof SAMPLE_CHATS)[0] | null
  >(null);
  const [newMessageOpen, setNewMessageOpen] = useState(false);

  const chats =
    backendChats && backendChats.length > 0
      ? backendChats.map((c, i) => ({
          ...c,
          initials: c.contact.slice(0, 2).toUpperCase(),
          color: SAMPLE_CHATS[i % SAMPLE_CHATS.length].color,
        }))
      : SAMPLE_CHATS;

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Chat list */}
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
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
              data-ocid="chats.new_message.open_modal_button"
              onClick={() => setNewMessageOpen(true)}
              className="w-9 h-9 rounded-full phoenix-gradient flex items-center justify-center shadow-md hover:opacity-90 active:scale-95 transition-all flex-shrink-0"
            >
              <Plus className="w-5 h-5 text-primary-foreground" />
            </button>
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

      {/* FAB - New Note */}
      {!selectedChat && (
        <button
          type="button"
          data-ocid="chats.open_modal_button"
          onClick={() => setNewMessageOpen(true)}
          className="absolute bottom-4 right-4 w-14 h-14 rounded-full phoenix-gradient shadow-xl flex items-center justify-center hover:opacity-90 active:scale-95 transition-all z-10"
          aria-label="New message"
        >
          <Plus className="w-6 h-6 text-primary-foreground" />
        </button>
      )}

      {/* New Note Dialog */}
      <NewNoteDialog
        open={newMessageOpen}
        onClose={() => setNewMessageOpen(false)}
      />
    </div>
  );
}
