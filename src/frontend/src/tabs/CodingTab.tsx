import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Code2, Copy, Plus, Trash2, Upload } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Dart",
  "HTML",
  "CSS",
  "SQL",
];

const LANG_COLORS: Record<string, string> = {
  JavaScript: "bg-yellow-500/20 text-yellow-600",
  TypeScript: "bg-blue-500/20 text-blue-600",
  Python: "bg-emerald-500/20 text-emerald-600",
  Dart: "bg-cyan-500/20 text-cyan-600",
  HTML: "bg-orange-500/20 text-orange-600",
  CSS: "bg-pink-500/20 text-pink-600",
  SQL: "bg-violet-500/20 text-violet-600",
};

interface Snippet {
  id: string;
  title: string;
  language: string;
  code: string;
  timestamp: number;
}

const SAMPLE_SNIPPETS: Snippet[] = [
  {
    id: "snip-1",
    title: "Fetch User Data",
    language: "TypeScript",
    code: "async function fetchUser(id: string) {\n  const res = await fetch(`/api/users/${id}`);\n  return res.json();\n}",
    timestamp: Date.now() - 3600_000,
  },
  {
    id: "snip-2",
    title: "Pocket Balance Query",
    language: "SQL",
    code: "SELECT user_id, balance, updated_at\nFROM pocket_accounts\nWHERE user_id = ? AND active = 1;",
    timestamp: Date.now() - 86400_000,
  },
  {
    id: "snip-3",
    title: "Flutter HTTP Request",
    language: "Dart",
    code: "final response = await http.get(\n  Uri.parse('https://api.phonex.app/balance'),\n  headers: {'Authorization': 'Bearer $token'},\n);",
    timestamp: Date.now() - 172800_000,
  },
];

const STORAGE_KEY = "phonex_code_snippets";

function loadSnippets(): Snippet[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Snippet[]) : SAMPLE_SNIPPETS;
  } catch {
    return SAMPLE_SNIPPETS;
  }
}

function saveSnippetsToStorage(snippets: Snippet[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snippets));
  } catch {}
}

function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  return new Date(ts).toLocaleDateString("en-PK", {
    month: "short",
    day: "numeric",
  });
}

export default function CodingTab() {
  const [snippets, setSnippets] = useState<Snippet[]>(loadSnippets);
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [code, setCode] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  function clearEditor() {
    setTitle("");
    setCode("");
    setLanguage("JavaScript");
    setEditingId(null);
  }

  function handleSave() {
    if (!code.trim()) {
      toast.error("Write some code first!");
      return;
    }
    const label = title.trim() || `Snippet ${snippets.length + 1}`;
    let updated: Snippet[];
    if (editingId) {
      updated = snippets.map((s) =>
        s.id === editingId
          ? { ...s, title: label, language, code, timestamp: Date.now() }
          : s,
      );
    } else {
      const newSnip: Snippet = {
        id: `snip-${Date.now()}`,
        title: label,
        language,
        code,
        timestamp: Date.now(),
      };
      updated = [newSnip, ...snippets];
    }
    setSnippets(updated);
    saveSnippetsToStorage(updated);
    toast.success(editingId ? "Snippet updated!" : "Snippet saved!");
    clearEditor();
  }

  function handleLoad(snip: Snippet) {
    setTitle(snip.title);
    setLanguage(snip.language);
    setCode(snip.code);
    setEditingId(snip.id);
  }

  function handleCopySnippet(snippetCode: string) {
    navigator.clipboard.writeText(snippetCode).catch(() => {});
    toast.success("Copied!");
  }

  function handleDelete(id: string) {
    const updated = snippets.filter((s) => s.id !== id);
    setSnippets(updated);
    saveSnippetsToStorage(updated);
    if (editingId === id) clearEditor();
    toast.success("Snippet deleted");
  }

  return (
    <div className="flex flex-col gap-0 pb-6">
      {/* Header */}
      <div className="phoenix-gradient px-5 pt-5 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-display text-white font-bold text-lg leading-tight">
                Coding
              </h2>
              <p className="text-white/70 text-xs">
                {snippets.length} snippets saved
              </p>
            </div>
          </div>
          <button
            type="button"
            data-ocid="coding.open_modal_button"
            onClick={clearEditor}
            className="w-10 h-10 rounded-full border-2 border-dashed border-white/60 flex items-center justify-center hover:border-white hover:bg-white/10 transition-all"
            aria-label="New snippet"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="px-4 -mt-3">
        <div className="bg-card rounded-2xl shadow-lg border border-border p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">
              {editingId ? "Edit Snippet" : "New Snippet"}
            </span>
            {editingId && (
              <Badge className="text-[10px] bg-primary/10 text-primary border-0 ml-auto">
                Editing
              </Badge>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Title</Label>
            <Input
              data-ocid="coding.title.input"
              placeholder="My awesome snippet..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger
                data-ocid="coding.language.select"
                className="text-sm"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Code</Label>
            <textarea
              data-ocid="coding.editor"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={`// Write your ${language} code here...`}
              className="w-full min-h-[160px] rounded-xl bg-[#0d1117] text-[#7ee787] font-mono text-sm p-3 resize-y border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-[#3d4f5a] leading-relaxed"
              spellCheck={false}
            />
          </div>

          <div className="flex gap-2">
            <Button
              data-ocid="coding.save_button"
              onClick={handleSave}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-1.5" />
              {editingId ? "Update" : "Save Snippet"}
            </Button>
            {editingId && (
              <Button
                data-ocid="coding.cancel_button"
                variant="outline"
                onClick={clearEditor}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Snippets list */}
      <div className="px-4 mt-5">
        <h3 className="font-display font-bold text-foreground mb-3 text-sm uppercase tracking-wide">
          Saved Snippets
        </h3>
        <AnimatePresence initial={false}>
          {snippets.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center py-12 text-center"
              data-ocid="coding.empty_state"
            >
              <Code2 className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                No snippets yet. Write some code and save it!
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {snippets.map((snip, i) => (
                <motion.div
                  key={snip.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-card rounded-2xl border border-border overflow-hidden"
                  data-ocid={`coding.snippet.item.${i + 1}`}
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge
                        className={`text-[10px] px-1.5 py-0 border-0 flex-shrink-0 ${
                          LANG_COLORS[snip.language] ??
                          "bg-muted text-muted-foreground"
                        }`}
                      >
                        {snip.language}
                      </Badge>
                      <span className="text-sm font-semibold text-foreground truncate">
                        {snip.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-2">
                      {formatTime(snip.timestamp)}
                    </span>
                  </div>

                  <div className="bg-[#0d1117] px-4 py-3">
                    <pre className="text-[#7ee787] font-mono text-xs leading-relaxed overflow-hidden whitespace-pre-wrap break-all">
                      {snip.code.split("\n").slice(0, 2).join("\n")}
                      {snip.code.split("\n").length > 2 && (
                        <span className="text-[#3d4f5a]"> ...</span>
                      )}
                    </pre>
                  </div>

                  <div className="flex items-center gap-1 px-3 py-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      data-ocid={`coding.snippet.edit_button.${i + 1}`}
                      onClick={() => handleLoad(snip)}
                      className="h-8 text-xs flex-1 text-primary hover:bg-primary/10"
                    >
                      Load
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      data-ocid={`coding.snippet.secondary_button.${i + 1}`}
                      onClick={() => handleCopySnippet(snip.code)}
                      className="h-8 text-xs flex-1 text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      data-ocid={`coding.snippet.delete_button.${i + 1}`}
                      onClick={() => handleDelete(snip.id)}
                      className="h-8 text-xs text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
