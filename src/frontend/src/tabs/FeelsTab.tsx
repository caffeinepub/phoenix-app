import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import {
  addFeel as dbAddFeel,
  deleteMyFeel,
  getActiveFeels,
} from "@/services/PhonexDB";
import { ImageIcon, Plus, Sparkles, Video, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type Category = "happy" | "sad" | "travel" | "work" | "shopping";

interface Feel {
  id: string;
  category: Category;
  caption: string;
  createdAt: number;
  mediaUrl?: string;
  mediaType?: "image" | "video";
}

const EXPIRE_MS = 12 * 60 * 60 * 1000; // 12 hours
const PLAY_DURATION_MS = 30 * 1000; // 30 seconds view time

const CATEGORIES: {
  id: Category;
  label: string;
  emoji: string;
  color: string;
  ring: string;
  bg: string;
  text: string;
}[] = [
  {
    id: "happy",
    label: "Happy",
    emoji: "😊",
    color: "#f59e0b",
    ring: "ring-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-300",
  },
  {
    id: "sad",
    label: "Sad",
    emoji: "😢",
    color: "#3b82f6",
    ring: "ring-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-300",
  },
  {
    id: "travel",
    label: "Travel",
    emoji: "✈️",
    color: "#10b981",
    ring: "ring-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  {
    id: "work",
    label: "Work / Busy",
    emoji: "💼",
    color: "#8b5cf6",
    ring: "ring-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/40",
    text: "text-violet-700 dark:text-violet-300",
  },
  {
    id: "shopping",
    label: "Shopping",
    emoji: "🛍️",
    color: "#ec4899",
    ring: "ring-pink-400",
    bg: "bg-pink-50 dark:bg-pink-950/40",
    text: "text-pink-700 dark:text-pink-300",
  },
];

function getCat(id: Category) {
  return CATEGORIES.find((c) => c.id === id)!;
}

function formatTimeLeft(ms: number): string {
  if (ms <= 0) return "Expired";
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

function ExpiryBar({ startedAt }: { startedAt: number }) {
  const [now, setNow] = useState(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    intervalRef.current = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const elapsed = now - startedAt;
  const pct = Math.min((elapsed / EXPIRE_MS) * 100, 100);
  const remaining = Math.max(EXPIRE_MS - elapsed, 0);

  return (
    <>
      <Progress value={pct} className="h-1.5" />
      <p className="text-[10px] text-muted-foreground mt-1">
        {formatTimeLeft(remaining)}
      </p>
    </>
  );
}

// ── FeelViewer — fullscreen 30-second overlay ─────────────────────────────────
interface FeelViewerProps {
  feel: Feel | null;
  onClose: () => void;
}

function FeelViewer({ feel, onClose }: FeelViewerProps) {
  const [progress, setProgress] = useState(0);
  const startRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!feel) return;
    setProgress(0);
    startRef.current = performance.now();

    function tick(now: number) {
      const elapsed = now - startRef.current;
      const pct = Math.min((elapsed / PLAY_DURATION_MS) * 100, 100);
      setProgress(pct);
      if (pct < 100) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        onClose();
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [feel, onClose]);

  if (!feel) return null;

  const cat = getCat(feel.category);

  return (
    <AnimatePresence>
      {feel && (
        <motion.div
          key="feel-viewer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col"
          style={{ backgroundColor: `${cat.color}22` }}
          data-ocid="feels.viewer.panel"
        >
          {/* Gradient background */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at center, ${cat.color}44 0%, ${cat.color}11 60%, #00000088 100%)`,
            }}
          />

          {/* Top progress bar */}
          <div className="relative z-10 px-4 pt-safe-top pt-4">
            <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                style={{ width: `${progress}%` }}
                transition={{ ease: "linear" }}
              />
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            data-ocid="feels.viewer.close_button"
            onClick={onClose}
            className="absolute top-6 right-4 z-20 w-9 h-9 rounded-full bg-black/30 flex items-center justify-center hover:bg-black/50 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Main content */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-4 px-6">
            {feel.mediaUrl ? (
              feel.mediaType === "video" ? (
                <video
                  src={feel.mediaUrl}
                  autoPlay
                  muted
                  loop
                  className="max-h-[60vh] max-w-full rounded-2xl object-contain shadow-2xl"
                />
              ) : (
                <img
                  src={feel.mediaUrl}
                  alt="feel media"
                  className="max-h-[60vh] max-w-full rounded-2xl object-contain shadow-2xl"
                />
              )
            ) : (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.4 }}
                className="text-[120px] leading-none select-none"
              >
                {cat.emoji}
              </motion.div>
            )}

            <div className="text-center">
              <p
                className="font-display text-2xl font-black text-white drop-shadow-lg"
                style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}
              >
                {cat.label}
              </p>
              {feel.caption && (
                <p
                  className="text-white/90 mt-1 text-sm max-w-xs"
                  style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}
                >
                  {feel.caption}
                </p>
              )}
            </div>

            {/* Timer indicator */}
            <p className="text-white/60 text-xs">
              {Math.ceil(((100 - progress) / 100) * 30)}s remaining
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function FeelsTab() {
  const { currentUser } = useAuth();
  const [feels, setFeels] = useState<Feel[]>(() => {
    const dbFeels = getActiveFeels();
    if (dbFeels.length > 0) {
      return dbFeels.map((f) => ({
        id: f.id,
        category: (f.mood || "happy") as Category,
        caption: f.caption,
        createdAt: f.createdAt,
        mediaUrl: f.mediaUrl || undefined,
        mediaType:
          f.mediaType === "photo" ? ("image" as const) : ("video" as const),
      }));
    }
    return [
      {
        id: "seed-1",
        category: "happy" as Category,
        caption: "Enjoying the day! ☀️",
        createdAt: Date.now() - 1 * 60 * 60 * 1000,
      },
      {
        id: "seed-2",
        category: "travel" as Category,
        caption: "On my way to Lahore ✈️",
        createdAt: Date.now() - 3 * 60 * 60 * 1000,
      },
    ];
  });
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState<Category>("happy");
  const [caption, setCaption] = useState("");
  const [mediaUrl, setMediaUrl] = useState<string | undefined>();
  const [mediaType, setMediaType] = useState<"image" | "video" | undefined>();
  const [viewingFeel, setViewingFeel] = useState<Feel | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // prune expired feels
  useEffect(() => {
    const t = setInterval(() => {
      setFeels((prev) =>
        prev.filter((f) => Date.now() - f.createdAt < EXPIRE_MS),
      );
    }, 60000);
    return () => clearInterval(t);
  }, []);

  const activeFeels = feels.filter((f) => Date.now() - f.createdAt < EXPIRE_MS);

  function handleAddFeel() {
    if (activeFeels.length >= 5) return;
    const newFeel: Feel = {
      id: `feel-${Date.now()}`,
      category: selectedCat,
      caption,
      createdAt: Date.now(),
      mediaUrl,
      mediaType,
    };
    setFeels((prev) => [newFeel, ...prev]);
    if (currentUser?.paymentId) {
      dbAddFeel({
        id: newFeel.id,
        creatorPaymentId: currentUser.paymentId,
        creatorName: currentUser.displayName || currentUser.email,
        mediaUrl: newFeel.mediaUrl || "",
        mediaType: newFeel.mediaType === "video" ? "video" : "photo",
        mood: newFeel.category,
        caption: newFeel.caption,
        createdAt: newFeel.createdAt,
        expiresAt: newFeel.createdAt + EXPIRE_MS,
      });
    }
    setCaption("");
    setMediaUrl(undefined);
    setMediaType(undefined);
    setSheetOpen(false);
    toast.success("Feel posted! ✨");
    // Auto-open the viewer right after adding
    setViewingFeel(newFeel);
  }

  function handleMediaPick(
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "video",
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === "string") {
        setMediaUrl(result);
        setMediaType(type);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Story bubbles row */}
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {/* Add button */}
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            data-ocid="feels.add.button"
            onClick={() => setSheetOpen(true)}
            disabled={activeFeels.length >= 5}
            className="w-14 h-14 rounded-full border-2 border-dashed border-primary/50 bg-primary/5 flex items-center justify-center hover:bg-primary/10 transition-colors disabled:opacity-40"
          >
            <Plus className="w-6 h-6 text-primary" />
          </button>
          <span className="text-[10px] text-muted-foreground">Add Feel</span>
        </div>

        {/* Feel bubbles */}
        {activeFeels.map((feel) => {
          const cat = getCat(feel.category);
          return (
            <div
              key={feel.id}
              className="flex flex-col items-center gap-1.5 flex-shrink-0"
            >
              <button
                type="button"
                data-ocid="feels.bubble.button"
                onClick={() => setViewingFeel(feel)}
                className={`w-14 h-14 rounded-full ring-2 ring-offset-2 ${cat.ring} ring-offset-background overflow-hidden flex items-center justify-center transition-transform active:scale-95`}
                style={{ backgroundColor: `${cat.color}22` }}
              >
                {feel.mediaUrl && feel.mediaType === "image" ? (
                  <img
                    src={feel.mediaUrl}
                    alt="feel"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">{cat.emoji}</span>
                )}
              </button>
              <span className="text-[10px] text-muted-foreground">
                {cat.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Feel cards */}
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {activeFeels.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
              data-ocid="feels.empty_state"
            >
              <Sparkles className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">
                No active Feels. Share how you feel!
              </p>
            </motion.div>
          ) : (
            activeFeels.map((feel, i) => {
              const cat = getCat(feel.category);
              return (
                <motion.div
                  key={feel.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className={`rounded-2xl p-4 ${cat.bg} cursor-pointer active:scale-[0.99] transition-transform`}
                  data-ocid={`feels.item.${i + 1}`}
                  onClick={() => setViewingFeel(feel)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ backgroundColor: `${cat.color}33` }}
                    >
                      {feel.mediaUrl && feel.mediaType === "image" ? (
                        <img
                          src={feel.mediaUrl}
                          alt="feel thumbnail"
                          className="w-full h-full rounded-xl object-cover"
                        />
                      ) : (
                        cat.emoji
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-bold ${cat.text}`}>
                          {cat.label}
                        </p>
                        <button
                          type="button"
                          data-ocid={`feels.delete_button.${i + 1}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setFeels((prev) =>
                              prev.filter((f) => f.id !== feel.id),
                            );
                            toast.success("Feel removed");
                          }}
                          className="w-5 h-5 rounded-full hover:bg-black/10 flex items-center justify-center transition-colors"
                          aria-label="Remove feel"
                        >
                          <X className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </div>
                      {feel.caption && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {feel.caption}
                        </p>
                      )}
                      <div className="mt-2">
                        <ExpiryBar startedAt={feel.createdAt} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Add Feel Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl pb-safe-bottom max-h-[50vh] overflow-y-auto px-3 pb-3"
        >
          <SheetHeader>
            <SheetTitle className="font-display text-sm font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-500" />
              Share a Feel
            </SheetTitle>
          </SheetHeader>

          <div className="mt-1 space-y-1">
            {/* Category selector */}
            <div className="grid grid-cols-5 gap-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  data-ocid={`feels.cat.${cat.id}.button`}
                  onClick={() => setSelectedCat(cat.id)}
                  className={`flex flex-col items-center gap-0.5 py-1 rounded-xl transition-all ${
                    selectedCat === cat.id
                      ? `${cat.bg} ring-2 ${cat.ring} ring-offset-1`
                      : "hover:bg-muted/60"
                  }`}
                >
                  <span className="text-xl">{cat.emoji}</span>
                  <span className={`text-[10px] font-semibold ${cat.text}`}>
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Caption */}
            <Input
              data-ocid="feels.caption.input"
              autoFocus
              placeholder="Add a caption…"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />

            {/* Media pickers */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-ocid="feels.image.upload_button"
                className="flex-1 gap-1.5"
                onClick={() => imageInputRef.current?.click()}
              >
                <ImageIcon className="w-4 h-4" />
                {mediaUrl && mediaType === "image"
                  ? "Image Set ✓"
                  : "Add Image"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-ocid="feels.video.upload_button"
                className="flex-1 gap-1.5"
                onClick={() => videoInputRef.current?.click()}
              >
                <Video className="w-4 h-4" />
                {mediaUrl && mediaType === "video"
                  ? "Video Set ✓"
                  : "Add Video"}
              </Button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleMediaPick(e, "image")}
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => handleMediaPick(e, "video")}
              />
            </div>

            {/* Media preview */}
            {mediaUrl && (
              <div className="relative w-full h-14 rounded-xl overflow-hidden">
                {mediaType === "video" ? (
                  <video
                    src={mediaUrl}
                    className="w-full h-full object-cover"
                    muted
                  />
                ) : (
                  <img
                    src={mediaUrl}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                )}
                <button
                  type="button"
                  data-ocid="feels.media.close_button"
                  onClick={() => {
                    setMediaUrl(undefined);
                    setMediaType(undefined);
                  }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            )}

            <Button
              data-ocid="feels.post.button"
              onClick={handleAddFeel}
              disabled={activeFeels.length >= 5}
              className="w-full"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Post Feel
            </Button>

            {activeFeels.length >= 5 && (
              <p
                className="text-xs text-muted-foreground text-center"
                data-ocid="feels.limit.error_state"
              >
                Maximum 5 active Feels reached. Remove one to add more.
              </p>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Fullscreen Feel Viewer */}
      <FeelViewer feel={viewingFeel} onClose={() => setViewingFeel(null)} />
    </div>
  );
}
