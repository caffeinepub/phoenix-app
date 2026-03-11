import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Building2,
  Camera,
  Check,
  CreditCard,
  Edit3,
  Globe,
  Mail,
  Phone,
  User,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

interface Props {
  onBack: () => void;
}

export default function ProfileScreen({ onBack }: Props) {
  const { currentUser, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    displayName: currentUser?.displayName || "",
    phone: currentUser?.phone || "",
    countryCode: currentUser?.countryCode || "+1",
    bankName: "",
    accountNumber: "",
  });

  const initials = currentUser?.displayName
    ? currentUser.displayName.slice(0, 2).toUpperCase()
    : currentUser?.email?.slice(0, 2).toUpperCase() || "?";

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === "string") setAvatarUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updateProfile(form);
    setEditing(false);
  };

  const handleCancel = () => {
    setForm({
      displayName: currentUser?.displayName || "",
      phone: currentUser?.phone || "",
      countryCode: currentUser?.countryCode || "+1",
      bankName: form.bankName,
      accountNumber: form.accountNumber,
    });
    setEditing(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="phoenix-gradient px-4 pb-8">
        <div className="flex items-center justify-between pt-4 mb-6">
          <button
            type="button"
            data-ocid="profile.button"
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <h1 className="font-display font-bold text-primary-foreground">
            Profile
          </h1>
          <button
            type="button"
            data-ocid="profile.edit_button"
            onClick={() => setEditing((e) => !e)}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <Edit3 className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>

        <div className="flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.4 }}
            className="relative"
          >
            <Avatar className="w-24 h-24 border-4 border-white/40 shadow-xl">
              {avatarUrl && (
                <AvatarImage src={avatarUrl} alt="Profile picture" />
              )}
              <AvatarFallback className="phoenix-gradient text-primary-foreground font-display font-black text-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            {/* Camera button always visible */}
            <button
              type="button"
              data-ocid="profile.upload_button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors border-2 border-white/60"
              aria-label="Upload profile picture"
            >
              <Camera className="w-4 h-4 text-gray-700" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
              data-ocid="profile.dropzone"
            />
          </motion.div>
          <h2 className="font-display font-bold text-xl text-primary-foreground mt-3">
            {currentUser?.displayName || "Phoenix User"}
          </h2>
          <p className="text-primary-foreground/75 text-sm">
            {currentUser?.email}
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1 bg-background rounded-t-3xl -mt-5 px-5 pt-7 pb-8 flex flex-col gap-5"
      >
        {editing ? (
          <>
            <h3 className="font-display font-bold text-foreground">
              Edit Profile
            </h3>

            <div className="space-y-1.5">
              <Label className="text-foreground font-medium">
                Display Name
              </Label>
              <Input
                data-ocid="profile.input"
                value={form.displayName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, displayName: e.target.value }))
                }
                className="bg-secondary border-border"
                placeholder="Your name"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-foreground font-medium">Phone</Label>
              <div className="flex gap-2">
                <Input
                  data-ocid="profile.input"
                  value={form.countryCode}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, countryCode: e.target.value }))
                  }
                  className="w-20 bg-secondary border-border text-center"
                  placeholder="+1"
                />
                <Input
                  data-ocid="profile.input"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, phone: e.target.value }))
                  }
                  className="flex-1 bg-secondary border-border"
                  placeholder="555-0100"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-foreground font-medium">Bank Name</Label>
              <Input
                data-ocid="profile.input"
                value={form.bankName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, bankName: e.target.value }))
                }
                className="bg-secondary border-border"
                placeholder="e.g. Chase, Barclays"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-foreground font-medium">
                Account Number / IBAN
              </Label>
              <Input
                data-ocid="profile.input"
                value={form.accountNumber}
                onChange={(e) =>
                  setForm((p) => ({ ...p, accountNumber: e.target.value }))
                }
                className="bg-secondary border-border"
                placeholder="GB29 NWBK 6016 1331 9268 19"
              />
            </div>

            <div className="flex gap-3 mt-2">
              <Button
                data-ocid="profile.cancel_button"
                variant="outline"
                onClick={handleCancel}
                className="flex-1 rounded-xl border-border"
              >
                <X className="w-4 h-4 mr-1" /> Cancel
              </Button>
              <Button
                data-ocid="profile.save_button"
                onClick={handleSave}
                className="flex-1 phoenix-gradient text-primary-foreground rounded-xl border-0"
              >
                <Check className="w-4 h-4 mr-1" /> Save
              </Button>
            </div>
          </>
        ) : (
          <>
            <h3 className="font-display font-bold text-foreground">
              Account Info
            </h3>

            <div className="flex flex-col gap-3">
              {[
                {
                  icon: User,
                  label: "Display Name",
                  value: currentUser?.displayName || "Not set",
                },
                {
                  icon: Mail,
                  label: "Email",
                  value: currentUser?.email || "Not set",
                },
                {
                  icon: Phone,
                  label: "Phone",
                  value: currentUser?.phone
                    ? `${currentUser.countryCode} ${currentUser.phone}`
                    : "Not set",
                },
                {
                  icon: Globe,
                  label: "Country Code",
                  value: currentUser?.countryCode || "Not set",
                },
                {
                  icon: Building2,
                  label: "Bank Name",
                  value: form.bankName || "Not set",
                },
                {
                  icon: CreditCard,
                  label: "Account / IBAN",
                  value: form.accountNumber || "Not set",
                },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-center gap-4 bg-card rounded-xl p-4 border border-border"
                >
                  <div className="w-10 h-10 rounded-xl phoenix-gradient flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="font-body font-medium text-foreground">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
