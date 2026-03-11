import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Plus, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

type Category = "happy" | "sad" | "travel" | "work" | "shopping";

interface Feel {
  id: string;
  category: Category;
  caption: string;
  createdAt: number;
}

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

function ProgressBar({ startedAt }: { startedAt: number }) {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const duration = 30000;
    const tick = () => {
      const elapsed = Date.now() - startedAt;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      if (pct < 100) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [startedAt]);

  return <Progress value={progress} className="h-1.5" />;
}

export default function FeelsTab() {
  const [feels, setFeels] = useState<Feel[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [caption, setCaption] = useState("");

  const maxReached = feels.length >= 5;

  const handleAdd = () => {
    if (!selectedCat) return;
    const newFeel: Feel = {
      id: crypto.randomUUID(),
      category: selectedCat,
      caption: caption.trim(),
      createdAt: Date.now(),
    };
    setFeels((prev) => [newFeel, ...prev]);
    setSheetOpen(false);
    setSelectedCat(null);
    setCaption("");
  };

  const handleDelete = (id: string) => {
    setFeels((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Story bubbles row */}
      {feels.length > 0 && (
        <div className="px-4 pt-4 pb-2">
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {feels.map((feel) => {
              const cat = getCat(feel.category);
              return (
                <div
                  key={feel.id}
                  className="flex flex-col items-center gap-1 shrink-0"
                >
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ring-2 ${cat.ring} ring-offset-2 ring-offset-background`}
                    style={{ background: `${cat.color}22` }}
                  >
                    {cat.emoji}
                  </div>
                  <span className="text-[10px] text-muted-foreground max-w-[56px] truncate text-center">
                    {cat.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Feels list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 pb-24">
        {feels.length === 0 ? (
          <div
            data-ocid="feels.empty_state"
            className="flex flex-col items-center justify-center h-64 text-center gap-4"
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
              style={{
                background: "linear-gradient(135deg, #fde68a, #fbcfe8)",
              }}
            >
              ✨
            </div>
            <div>
              <p className="font-semibold text-foreground">No Feels yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Share how you're feeling — up to 5 Feels at a time
              </p>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {feels.map((feel, idx) => {
              const cat = getCat(feel.category);
              const ocidIdx = (idx + 1) as 1 | 2 | 3 | 4 | 5;
              return (
                <motion.div
                  key={feel.id}
                  data-ocid={`feels.item.${ocidIdx}`}
                  initial={{ opacity: 0, y: 12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 40, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className={`rounded-2xl p-4 ${cat.bg} border border-transparent relative overflow-hidden`}
                  style={{ boxShadow: `0 2px 12px ${cat.color}30` }}
                >
                  {/* Decorative blob */}
                  <div
                    className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-20"
                    style={{ background: cat.color }}
                  />
                  <div className="flex items-start gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                      style={{ background: `${cat.color}33` }}
                    >
                      {cat.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${cat.text}`}>
                        {cat.label}
                      </p>
                      {feel.caption && (
                        <p className="text-sm text-foreground/80 mt-0.5 break-words">
                          {feel.caption}
                        </p>
                      )}
                      <div className="mt-2">
                        <ProgressBar startedAt={feel.createdAt} />
                        <p className="text-[10px] text-muted-foreground mt-1">
                          30s feel
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      data-ocid={`feels.delete_button.${ocidIdx}`}
                      onClick={() => handleDelete(feel.id)}
                      className="w-7 h-7 rounded-full bg-white/60 dark:bg-black/20 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors shrink-0"
                      aria-label="Remove feel"
                    >
                      <X className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* FAB */}
      <div className="absolute bottom-4 right-4">
        {maxReached ? (
          <div className="bg-muted text-muted-foreground text-xs px-4 py-2.5 rounded-full shadow-md border border-border">
            Max 5 Feels reached
          </div>
        ) : (
          <motion.button
            type="button"
            data-ocid="feels.add_button"
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setSheetOpen(true)}
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg text-white"
            style={{
              background: "linear-gradient(135deg, #f59e0b, #ec4899)",
              boxShadow: "0 4px 20px rgba(236,72,153,0.4)",
            }}
            aria-label="Add Feel"
          >
            <Plus className="w-6 h-6" />
          </motion.button>
        )}
      </div>

      {/* Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          data-ocid="feels.sheet"
          className="rounded-t-3xl max-h-[85vh] overflow-y-auto"
        >
          <SheetHeader className="mb-4">
            <SheetTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-500" />
              How are you feeling?
            </SheetTitle>
          </SheetHeader>

          {/* Category grid */}
          <div className="grid grid-cols-2 gap-3 mb-5 sm:grid-cols-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                data-ocid="feels.category.tab"
                onClick={() => setSelectedCat(cat.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  selectedCat === cat.id
                    ? `${cat.ring} ${cat.bg} scale-[1.03]`
                    : "border-border bg-card hover:border-muted-foreground/30"
                }`}
              >
                <span className="text-3xl">{cat.emoji}</span>
                <span
                  className={`text-sm font-medium ${selectedCat === cat.id ? cat.text : "text-foreground"}`}
                >
                  {cat.label}
                </span>
              </button>
            ))}
          </div>

          {/* Caption input */}
          <div className="mb-5">
            <label
              htmlFor="feels-caption"
              className="text-sm font-medium text-foreground mb-1.5 block"
            >
              Caption{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </label>
            <Input
              data-ocid="feels.caption.input"
              id="feels-caption"
              placeholder="What's on your mind?"
              maxLength={80}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="rounded-xl"
            />
            <p className="text-[11px] text-muted-foreground mt-1 text-right">
              {caption.length}/80
            </p>
          </div>

          <Button
            data-ocid="feels.submit_button"
            onClick={handleAdd}
            disabled={!selectedCat}
            className="w-full rounded-xl h-12 text-base font-semibold"
            style={{
              background: selectedCat
                ? "linear-gradient(135deg, #f59e0b, #ec4899)"
                : undefined,
              border: "none",
            }}
          >
            Post Feel ✨
          </Button>
        </SheetContent>
      </Sheet>
    </div>
  );
}
