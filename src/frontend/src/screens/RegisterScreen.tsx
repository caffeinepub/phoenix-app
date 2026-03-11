import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Flame, Globe, Lock, Mail, Phone } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

interface Props {
  onBack: () => void;
  onRegisterSuccess: () => void;
}

export default function RegisterScreen({ onBack, onRegisterSuccess }: Props) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    email: "",
    phone: "",
    countryCode: "+1",
    displayName: "",
    password: "",
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
    if (form.password.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    register(form);
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
              Join Phoenix today
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
        <div className="space-y-1.5">
          <Label htmlFor="displayName" className="text-foreground font-medium">
            Display Name
          </Label>
          <Input
            id="displayName"
            data-ocid="register.input"
            placeholder="Your name"
            value={form.displayName}
            onChange={(e) => update("displayName", e.target.value)}
            className="bg-secondary border-border"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="reg-email" className="text-foreground font-medium">
            Email <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="reg-email"
              data-ocid="register.input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="reg-phone" className="text-foreground font-medium">
            Phone <span className="text-destructive">*</span>
          </Label>
          <div className="flex gap-2">
            <div className="relative w-24">
              <Globe className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                data-ocid="register.input"
                placeholder="+1"
                value={form.countryCode}
                onChange={(e) => update("countryCode", e.target.value)}
                className="pl-8 bg-secondary border-border text-center"
              />
            </div>
            <div className="relative flex-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="reg-phone"
                data-ocid="register.input"
                type="tel"
                placeholder="555-0100"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="reg-password" className="text-foreground font-medium">
            Password <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="reg-password"
              data-ocid="register.input"
              type="password"
              placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
          </div>
        </div>

        {error && (
          <p
            data-ocid="register.error_state"
            className="text-destructive text-sm"
          >
            {error}
          </p>
        )}

        <Button
          data-ocid="register.submit_button"
          onClick={handleRegister}
          disabled={isLoading}
          className="w-full h-12 phoenix-gradient text-primary-foreground font-display font-bold text-base rounded-xl border-0 hover:opacity-90 transition-opacity mt-2"
        >
          {isLoading ? "Creating account..." : "Create Account"}
        </Button>

        <p className="text-center text-muted-foreground text-xs">
          Already have an account?{" "}
          <button
            type="button"
            data-ocid="register.link"
            onClick={onBack}
            className="text-primary font-semibold hover:underline"
          >
            Sign In
          </button>
        </p>
      </motion.div>
    </div>
  );
}
