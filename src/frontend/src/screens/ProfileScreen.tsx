import AvatarPicker from "@/components/AvatarPicker";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Building2,
  Check,
  Copy,
  CreditCard,
  Globe,
  LogOut,
  Mail,
  Moon,
  Phone,
  Settings,
  Sun,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

interface Props {
  onBack: () => void;
  onLogout: () => void;
}

export default function ProfileScreen({ onBack, onLogout }: Props) {
  const { currentUser, updateProfile, logout, deleteAccount } = useAuth();
  const { isDark, darkNameColor, setDarkNameColor } = useTheme();
  const [editing, setEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    currentUser?.avatarUrl ?? null,
  );
  const [form, setForm] = useState({
    displayName: currentUser?.displayName || "",
    phone: currentUser?.phone || "",
    countryCode: currentUser?.countryCode || "+92",
    bankName: currentUser?.bankName || "",
    ibanNumber: currentUser?.ibanNumber || "",
  });
  const [copied, setCopied] = useState(false);

  const initials = currentUser?.displayName
    ? currentUser.displayName.slice(0, 2).toUpperCase()
    : currentUser?.email?.slice(0, 2).toUpperCase() || "?";

  const handleSave = () => {
    updateProfile({ ...form, avatarUrl: avatarUrl ?? undefined });
    setEditing(false);
    toast.success("Profile saved! ✓");
  };

  const handleCancel = () => {
    setForm({
      displayName: currentUser?.displayName || "",
      phone: currentUser?.phone || "",
      countryCode: currentUser?.countryCode || "+92",
      bankName: currentUser?.bankName || "",
      ibanNumber: currentUser?.ibanNumber || "",
    });
    setAvatarUrl(currentUser?.avatarUrl ?? null);
    setEditing(false);
  };

  const handleLogout = () => {
    logout();
    onLogout();
  };

  const handleDeleteAccount = () => {
    deleteAccount();
    onLogout();
  };

  const handleCopyId = () => {
    if (currentUser?.paymentId) {
      navigator.clipboard.writeText(currentUser.paymentId).catch(() => {});
      setCopied(true);
      toast.success("Payment ID copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="phoenix-gradient px-4 pb-12">
        <div className="flex items-center justify-between pt-4 mb-2">
          <button
            type="button"
            data-ocid="profile.button"
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/30 border border-white/50 flex items-center justify-center hover:bg-white/50 transition-colors shadow"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="font-display text-lg font-bold text-primary-foreground">
            Profile
          </h1>
          {!editing ? (
            <button
              type="button"
              data-ocid="profile.edit_button"
              onClick={() => setEditing(true)}
              className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <Settings className="w-4 h-4 text-white" />
            </button>
          ) : (
            <div className="flex gap-1">
              <button
                type="button"
                data-ocid="profile.save_button"
                onClick={handleSave}
                className="w-9 h-9 rounded-full bg-white/30 flex items-center justify-center hover:bg-white/40 transition-colors"
              >
                <Check className="w-4 h-4 text-white" />
              </button>
              <button
                type="button"
                data-ocid="profile.cancel_button"
                onClick={handleCancel}
                className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-red-400/40 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-white" />
              </button>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center gap-2 pb-6 pt-4">
          {editing ? (
            <AvatarPicker value={avatarUrl} onChange={setAvatarUrl} />
          ) : (
            <Avatar className="w-20 h-20 ring-2 ring-white/50">
              {avatarUrl && <AvatarImage src={avatarUrl} alt="Avatar" />}
              <AvatarFallback className="phoenix-gradient text-primary-foreground font-display font-bold text-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>
          )}
          <p className="font-display text-xl font-bold text-primary-foreground">
            {currentUser?.displayName || "Your Name"}
          </p>
          <p className="text-sm text-primary-foreground/70">
            {currentUser?.email}
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1 -mt-6 bg-background rounded-t-3xl px-4 pt-6 pb-10 shadow-sm"
      >
        <div className="space-y-4">
          {/* Payment ID */}
          {currentUser?.paymentId && (
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 space-y-1">
              <p className="text-xs font-semibold text-primary uppercase tracking-widest flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                Your Payment ID
              </p>
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono font-bold text-foreground tracking-wider text-sm">
                  {currentUser.paymentId}
                </p>
                <button
                  type="button"
                  data-ocid="profile.copy.button"
                  onClick={handleCopyId}
                  className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors flex-shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-primary" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Share this ID to receive payments
              </p>
            </div>
          )}

          {/* Display Name */}
          <div className="space-y-1.5">
            <Label className="text-foreground font-semibold">Full Name</Label>
            {editing ? (
              <Input
                data-ocid="profile.name.input"
                value={form.displayName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, displayName: e.target.value }))
                }
                placeholder="Your name"
              />
            ) : (
              <p className="text-foreground bg-muted/40 rounded-xl px-3 py-2 text-sm">
                {form.displayName || "—"}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label className="text-foreground font-semibold flex items-center gap-1">
              <Mail className="w-3 h-3" /> Email
            </Label>
            <p className="text-foreground bg-muted/40 rounded-xl px-3 py-2 text-sm text-muted-foreground">
              {currentUser?.email || "—"}
            </p>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label className="text-foreground font-semibold flex items-center gap-1">
              <Phone className="w-3 h-3" /> Phone
            </Label>
            {editing ? (
              <div className="flex gap-2">
                <div className="relative w-24">
                  <Globe className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                  <Input
                    data-ocid="profile.country.input"
                    value={form.countryCode}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, countryCode: e.target.value }))
                    }
                    className="pl-7 text-sm"
                  />
                </div>
                <Input
                  data-ocid="profile.phone.input"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, phone: e.target.value }))
                  }
                  placeholder="Phone number"
                  className="flex-1"
                />
              </div>
            ) : (
              <p className="text-foreground bg-muted/40 rounded-xl px-3 py-2 text-sm">
                {form.countryCode} {form.phone || "—"}
              </p>
            )}
          </div>

          {/* Bank section */}
          <div className="border-t border-border pt-4 space-y-4">
            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Bank Account
            </p>

            <div className="space-y-1.5">
              <Label className="text-foreground font-semibold">Bank Name</Label>
              {editing ? (
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    data-ocid="profile.bank.input"
                    value={form.bankName}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, bankName: e.target.value }))
                    }
                    placeholder="Bank name"
                    className="pl-9"
                  />
                </div>
              ) : (
                <p className="text-foreground bg-muted/40 rounded-xl px-3 py-2 text-sm">
                  {form.bankName || "—"}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-foreground font-semibold flex items-center gap-1">
                <CreditCard className="w-3 h-3" /> Account / IBAN
              </Label>
              {editing ? (
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    data-ocid="profile.iban.input"
                    value={form.ibanNumber}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, ibanNumber: e.target.value }))
                    }
                    placeholder="Account or IBAN number"
                    className="pl-9"
                  />
                </div>
              ) : (
                <p className="text-foreground bg-muted/40 rounded-xl px-3 py-2 text-sm">
                  {form.ibanNumber || "—"}
                </p>
              )}
            </div>
          </div>

          {/* Dark Mode App Name Color */}
          {isDark && (
            <div className="border-t border-border pt-4 space-y-3">
              <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Moon className="w-4 h-4 text-primary" />
                Dark Mode — App Name Color
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  data-ocid="profile.name_white.toggle"
                  onClick={() => setDarkNameColor("white")}
                  className={`flex-1 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                    darkNameColor === "white"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-border/60"
                  }`}
                >
                  <Sun className="w-4 h-4 inline mr-1.5" />
                  White
                </button>
                <button
                  type="button"
                  data-ocid="profile.name_maroon.toggle"
                  onClick={() => setDarkNameColor("maroon")}
                  className={`flex-1 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                    darkNameColor === "maroon"
                      ? "border-[#800000] bg-[#800000]/10 text-[#800000]"
                      : "border-border text-muted-foreground hover:border-border/60"
                  }`}
                >
                  <span style={{ color: "#800000" }}>●</span> Maroon
                </button>
              </div>
            </div>
          )}

          {/* Account Settings */}
          <div className="border-t border-border pt-4 space-y-3">
            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" />
              Account Settings
            </p>

            <Button
              type="button"
              data-ocid="profile.logout.button"
              variant="outline"
              className="w-full flex items-center gap-2 justify-start text-foreground border-border hover:bg-muted/60"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 text-primary" />
              Log Out
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  data-ocid="profile.delete_button"
                  variant="outline"
                  className="w-full flex items-center gap-2 justify-start text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent data-ocid="profile.delete.dialog">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Account</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your account and all associated
                    data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-ocid="profile.delete.cancel_button">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    data-ocid="profile.delete.confirm_button"
                    onClick={handleDeleteAccount}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
