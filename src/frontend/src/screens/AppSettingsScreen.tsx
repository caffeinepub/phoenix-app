import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  Bell,
  Moon,
  Shield,
  Sparkles,
  Sun,
  Wifi,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

interface Props {
  onBack: () => void;
}

export default function AppSettingsScreen({ onBack }: Props) {
  const { isDark, toggleTheme } = useTheme();

  const [smartMode, setSmartMode] = useState(() => {
    return localStorage.getItem("phonex_smart_mode") === "true";
  });
  const [msgNotifs, setMsgNotifs] = useState(() => {
    return localStorage.getItem("phonex_notif_messages") !== "false";
  });
  const [feelsAlerts, setFeelsAlerts] = useState(() => {
    return localStorage.getItem("phonex_notif_feels") !== "false";
  });
  const [securityAlerts, setSecurityAlerts] = useState(() => {
    return localStorage.getItem("phonex_notif_security") !== "false";
  });

  useEffect(() => {
    localStorage.setItem("phonex_smart_mode", String(smartMode));
  }, [smartMode]);

  useEffect(() => {
    localStorage.setItem("phonex_notif_messages", String(msgNotifs));
  }, [msgNotifs]);

  useEffect(() => {
    localStorage.setItem("phonex_notif_feels", String(feelsAlerts));
  }, [feelsAlerts]);

  useEffect(() => {
    localStorage.setItem("phonex_notif_security", String(securityAlerts));
  }, [securityAlerts]);

  const Section = ({
    title,
    icon: Icon,
    children,
  }: { title: string; icon: React.ElementType; children: React.ReactNode }) => (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 mb-4 rounded-2xl bg-card border border-border overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" />
        <p className="text-sm font-bold text-foreground">{title}</p>
      </div>
      <div className="px-4 py-2 space-y-1">{children}</div>
    </motion.div>
  );

  const SettingRow = ({
    label,
    desc,
    checked,
    onChange,
    id,
  }: {
    label: string;
    desc?: string;
    checked: boolean;
    onChange: (v: boolean) => void;
    id: string;
  }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1 min-w-0 pr-3">
        <Label
          htmlFor={id}
          className="text-sm font-medium text-foreground cursor-pointer"
        >
          {label}
        </Label>
        {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        data-ocid={`settings.${id}.switch`}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="phoenix-gradient px-4 pb-8">
        <div className="flex items-center gap-3 pt-4 pb-2">
          <button
            type="button"
            data-ocid="settings.back.button"
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/30 border border-white/50 flex items-center justify-center hover:bg-white/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-white font-bold text-lg">App Settings</h1>
            <p className="text-white/70 text-xs">Phonex preferences</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="-mt-4 pt-4 space-y-0">
        <Section title="Appearance" icon={isDark ? Moon : Sun}>
          <SettingRow
            id="dark_mode"
            label="Dark Mode"
            desc="Switch between light and dark themes"
            checked={isDark}
            onChange={() => toggleTheme()}
          />
        </Section>

        <Section title="Smart Mode" icon={Wifi}>
          <SettingRow
            id="smart_mode"
            label="Smart Mode (BLE Mesh)"
            desc="Enable peer-to-peer communication via Bluetooth mesh"
            checked={smartMode}
            onChange={setSmartMode}
          />
        </Section>

        <Section title="Notifications" icon={Bell}>
          <SettingRow
            id="msg_notifs"
            label="Message Notifications"
            desc="Get notified for new messages and chats"
            checked={msgNotifs}
            onChange={setMsgNotifs}
          />
          <div className="border-t border-border/50" />
          <SettingRow
            id="feels_alerts"
            label="Feels Alerts"
            desc="Notify when contacts post new Feels"
            checked={feelsAlerts}
            onChange={setFeelsAlerts}
          />
          <div className="border-t border-border/50" />
          <SettingRow
            id="security_alerts"
            label="Security Alerts"
            desc="Get notified about account security events"
            checked={securityAlerts}
            onChange={setSecurityAlerts}
          />
        </Section>

        <Section title="Security Framework" icon={Shield}>
          <div className="py-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Phonex uses a disguisable end-to-end encryption framework with
              zero-knowledge proofs. All data is encrypted locally before
              transmission. The security agent auto-locks accounts on suspicious
              activity.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                "E2E Encrypted",
                "Zero-Knowledge",
                "Auto-Lock",
                "Local-First",
              ].map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold border border-primary/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </Section>

        <Section title="About" icon={Sparkles}>
          <div className="py-3 space-y-1">
            <p className="text-sm text-foreground font-semibold">Phonex v1.0</p>
            <p className="text-xs text-muted-foreground">
              Secure Communication & Payments
            </p>
            <a
              href="https://hrdex.com.pk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary underline"
            >
              hrdex.com.pk
            </a>
          </div>
        </Section>
      </div>
    </div>
  );
}
