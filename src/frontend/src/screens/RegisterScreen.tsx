import AvatarPicker from "@/components/AvatarPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Building2,
  CreditCard,
  Flame,
  Globe,
  Lock,
  Mail,
  Phone,
  ShoppingBag,
  Store,
  Tag,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import type { UserData } from "../contexts/AuthContext";

interface Props {
  onBack: () => void;
  onRegisterSuccess: () => void;
  onPrivacyPolicy: () => void;
}

const CATEGORIES = [
  "Clothing",
  "Electronics",
  "Food",
  "Beauty",
  "Home & Living",
  "Sports",
  "Other",
];

export default function RegisterScreen({
  onBack,
  onRegisterSuccess,
  onPrivacyPolicy,
}: Props) {
  const { register } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  const [form, setForm] = useState({
    email: "",
    phone: "",
    countryCode: "+92",
    displayName: "",
    password: "password",
    bankName: "",
    ibanNumber: "",
    brandName: "",
    category: "Clothing",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleRegister = async () => {
    setError("");
    if (!form.email || !form.phone || !form.password) {
      setError("Please fill in all required fields");
      return;
    }
    if (role === "seller" && !form.brandName) {
      setError("Brand name is required for sellers");
      return;
    }
    if (form.password.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const userData: Omit<UserData, "id" | "paymentId"> = {
      email: form.email,
      phone: form.countryCode + form.phone,
      displayName: form.displayName || form.email.split("@")[0],
      password: form.password,
      role,
      bankName: form.bankName,
      ibanNumber: form.ibanNumber,
      avatarUrl: avatarUrl ?? undefined,
      brandName: role === "seller" ? form.brandName : undefined,
      category: role === "seller" ? form.category : undefined,
    };
    register(userData);
    setIsLoading(false);
    onRegisterSuccess();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="phoenix-gradient px-4 pb-6">
        <div className="flex items-center gap-3 mb-6 pt-4">
          <button
            type="button"
            data-ocid="register.button"
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <span className="font-display font-bold text-primary-foreground">
            Back to Login
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-black text-primary-foreground">
              Create Account
            </h1>
            <p className="text-primary-foreground/75 text-sm">
              Join Phonex Business today
            </p>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1 bg-background rounded-t-3xl -mt-4 px-6 pt-8 pb-8 flex flex-col gap-5"
      >
        {/* Role Selector */}
        <div className="space-y-2">
          <Label className="text-foreground font-semibold text-sm">
            I am joining as... <span className="text-destructive">*</span>
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              data-ocid="register.buyer.toggle"
              onClick={() => setRole("buyer")}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                role === "buyer"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-muted/20 text-muted-foreground hover:border-primary/40"
              }`}
            >
              <ShoppingBag className="w-7 h-7" />
              <span className="font-bold text-sm">Buyer</span>
              <span className="text-xs opacity-70 text-center">
                Browse &amp; buy products
              </span>
            </button>
            <button
              type="button"
              data-ocid="register.seller.toggle"
              onClick={() => setRole("seller")}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                role === "seller"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-muted/20 text-muted-foreground hover:border-primary/40"
              }`}
            >
              <Store className="w-7 h-7" />
              <span className="font-bold text-sm">Seller / Brand</span>
              <span className="text-xs opacity-70 text-center">
                Advertise &amp; sell
              </span>
            </button>
          </div>
        </div>

        {/* Seller subscription note */}
        {role === "seller" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3"
          >
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
              🎁 <strong>1 month free trial</strong>, then PKR 1,000 minimum
              balance required. Posts cost <strong>PKR 0.25/day each</strong> —
              auto-deducted from your balance.
            </p>
          </motion.div>
        )}

        {/* Avatar */}
        <div className="bg-muted/30 rounded-2xl p-4">
          <p className="text-sm font-semibold text-foreground mb-3 text-center">
            Profile Picture
          </p>
          <AvatarPicker value={avatarUrl} onChange={setAvatarUrl} />
        </div>

        {/* Full Name */}
        <div className="space-y-1.5">
          <Label
            htmlFor="displayName"
            className="text-foreground font-semibold"
          >
            Full Name
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="displayName"
              data-ocid="register.input"
              placeholder="Your full name"
              className="pl-9"
              value={form.displayName}
              onChange={(e) => update("displayName", e.target.value)}
            />
          </div>
        </div>

        {/* Seller-only fields */}
        {role === "seller" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 border border-primary/20 bg-primary/5 rounded-2xl p-4"
          >
            <p className="text-sm font-semibold text-primary flex items-center gap-2">
              <Store className="w-4 h-4" />
              Brand Information
            </p>
            <div className="space-y-1.5">
              <Label
                htmlFor="brandName"
                className="text-foreground font-semibold"
              >
                Brand Name <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="brandName"
                  data-ocid="register.brandname.input"
                  placeholder="Your brand name"
                  className="pl-9"
                  value={form.brandName}
                  onChange={(e) => update("brandName", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="category"
                className="text-foreground font-semibold"
              >
                Category
              </Label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                <select
                  id="category"
                  data-ocid="register.category.select"
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-foreground font-semibold">
            Email Address <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              data-ocid="register.email.input"
              type="email"
              placeholder="you@example.com"
              className="pl-9"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-foreground font-semibold">
            Phone Number <span className="text-destructive">*</span>
          </Label>
          <div className="flex gap-2">
            <div className="relative w-24">
              <Globe className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <Input
                data-ocid="register.country.input"
                value={form.countryCode}
                onChange={(e) => update("countryCode", e.target.value)}
                className="pl-7 text-sm"
              />
            </div>
            <div className="relative flex-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="phone"
                data-ocid="register.phone.input"
                type="tel"
                placeholder="Phone number"
                className="pl-9"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-foreground font-semibold">
            Password <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="password"
              data-ocid="register.password.input"
              type="password"
              placeholder="Minimum 4 characters"
              className="pl-9"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
            />
          </div>
        </div>

        {/* Bank Details */}
        <div className="border-t border-border pt-4 space-y-4">
          <p className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            Bank Account Details (Optional)
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="bankName" className="text-foreground font-semibold">
              Bank Name
            </Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="bankName"
                data-ocid="register.bank.input"
                placeholder="e.g. HBL, MCB, Meezan Bank"
                className="pl-9"
                value={form.bankName}
                onChange={(e) => update("bankName", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="ibanNumber"
              className="text-foreground font-semibold"
            >
              Account / IBAN Number
            </Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="ibanNumber"
                data-ocid="register.iban.input"
                placeholder="Account or IBAN number"
                className="pl-9"
                value={form.ibanNumber}
                onChange={(e) => update("ibanNumber", e.target.value)}
              />
            </div>
          </div>
        </div>

        {error && (
          <p
            className="text-sm text-destructive bg-destructive/10 rounded-xl px-3 py-2"
            data-ocid="register.error_state"
          >
            {error}
          </p>
        )}

        <Button
          data-ocid="register.submit_button"
          onClick={handleRegister}
          disabled={isLoading}
          className="w-full h-12 text-base font-bold rounded-2xl mt-2"
        >
          {isLoading
            ? "Creating account..."
            : `Create ${role === "seller" ? "Seller" : "Buyer"} Account`}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          By creating an account, you agree to our{" "}
          <button
            type="button"
            data-ocid="register.privacy.link"
            onClick={onPrivacyPolicy}
            className="text-primary hover:underline"
          >
            Privacy Policy
          </button>
        </p>
      </motion.div>
    </div>
  );
}
