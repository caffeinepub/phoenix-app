import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, Moon, Sun } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import phonexLogo from "../assets/Phonex.jpg";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

interface Props {
  onNavigateRegister: () => void;
  onLoginSuccess: () => void;
}

export default function LoginScreen({
  onNavigateRegister,
  onLoginSuccess,
}: Props) {
  const { login } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const success = login(email, password);
    setIsLoading(false);
    if (success) {
      onLoginSuccess();
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex justify-between items-center p-4">
        <div />
        <button
          type="button"
          data-ocid="login.toggle"
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-secondary hover:bg-accent transition-colors"
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-foreground" />
          ) : (
            <Moon className="w-5 h-5 text-foreground" />
          )}
        </button>
      </div>

      <div className="phoenix-gradient px-6 pb-10 pt-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center"
        >
          <img
            src={phonexLogo}
            alt="Phonex Logo"
            className="w-20 h-20 rounded-3xl object-cover shadow-lg mb-4"
          />
          <h1
            className="font-display text-4xl font-black tracking-tight"
            style={{
              color: "#0f2d6b",
              textShadow: "0 1px 4px rgba(255,255,255,0.7)",
            }}
          >
            Phonex
          </h1>
          <p className="text-primary-foreground/80 mt-1 font-body text-sm">
            Rise. Connect. Thrive.
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex-1 bg-background rounded-t-3xl -mt-6 px-6 pt-8 pb-6 flex flex-col gap-6"
      >
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Welcome back
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Sign in to continue
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-foreground font-medium">
              Email or Phone
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                data-ocid="login.input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-secondary border-border focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-foreground font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                data-ocid="login.input"
                type="password"
                placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="pl-10 bg-secondary border-border focus:border-primary"
              />
            </div>
          </div>

          {error && (
            <p
              data-ocid="login.error_state"
              className="text-destructive text-sm"
            >
              {error}
            </p>
          )}
        </div>

        <Button
          data-ocid="login.primary_button"
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full h-12 phoenix-gradient text-primary-foreground font-display font-bold text-base rounded-xl border-0 hover:opacity-90 transition-opacity"
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>

        <div className="text-center">
          <span className="text-muted-foreground text-sm">
            Don&#39;t have an account?{" "}
          </span>
          <button
            type="button"
            data-ocid="login.link"
            onClick={onNavigateRegister}
            className="text-primary font-semibold text-sm hover:underline"
          >
            Create Account
          </button>
        </div>
      </motion.div>
    </div>
  );
}
