import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  QrCode,
  Receipt,
  Send,
  ShieldCheck,
  Smartphone,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";

// ── helpers ───────────────────────────────────────────────────────────────────
function generatePaymentId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "PXP-";
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function generatePocketKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 4; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

const MOCK_NAMES = [
  "James Okafor",
  "Sara Müller",
  "Liu Wei",
  "Amina Hassan",
  "Carlos Mendez",
];

function mockVerifyName(hint?: string): Promise<string> {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve(
          hint || MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)],
        ),
      1100,
    ),
  );
}

// Static QR cell pattern
const QR_CELLS: { id: string; filled: boolean }[] = [
  { id: "qrc-01", filled: true },
  { id: "qrc-02", filled: false },
  { id: "qrc-03", filled: true },
  { id: "qrc-04", filled: true },
  { id: "qrc-05", filled: false },
  { id: "qrc-06", filled: false },
  { id: "qrc-07", filled: true },
  { id: "qrc-08", filled: false },
  { id: "qrc-09", filled: true },
  { id: "qrc-10", filled: true },
  { id: "qrc-11", filled: true },
  { id: "qrc-12", filled: true },
  { id: "qrc-13", filled: false },
  { id: "qrc-14", filled: false },
  { id: "qrc-15", filled: true },
  { id: "qrc-16", filled: false },
  { id: "qrc-17", filled: true },
  { id: "qrc-18", filled: true },
  { id: "qrc-19", filled: false },
  { id: "qrc-20", filled: false },
  { id: "qrc-21", filled: true },
  { id: "qrc-22", filled: false },
  { id: "qrc-23", filled: false },
  { id: "qrc-24", filled: true },
  { id: "qrc-25", filled: true },
];

const MOBILE_OPERATORS = ["Jazz", "Ufone", "Telenor", "Zong", "Warid"];

// ── types ─────────────────────────────────────────────────────────────────────
type Channel = "phonex" | "external" | "topup";
type TxType = "credit" | "debit";

interface Transaction {
  id: string;
  senderName: string;
  receiverName: string;
  amount: string;
  amountNum: number;
  date: string;
  type: TxType;
  category: string;
  channel: Channel;
  bankName?: string;
  lastDigits?: string;
  isNew?: boolean;
}

// ── constants ─────────────────────────────────────────────────────────────────
const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "t1",
    senderName: "Ali Khan",
    receiverName: "You",
    amount: "+Rs.15,000",
    amountNum: 15000,
    date: "Today, 2:10 PM",
    type: "credit",
    category: "Transfer",
    channel: "phonex",
  },
  {
    id: "t2",
    senderName: "You",
    receiverName: "Netflix",
    amount: "-Rs.2,499",
    amountNum: 2499,
    date: "Today, 9:00 AM",
    type: "debit",
    category: "Subscription",
    channel: "external",
    bankName: "HBL Bank",
    lastDigits: "342",
  },
  {
    id: "t3",
    senderName: "You",
    receiverName: "Sara Ahmed",
    amount: "-Rs.5,000",
    amountNum: 5000,
    date: "Yesterday, 6:45 PM",
    type: "debit",
    category: "Transfer",
    channel: "phonex",
  },
  {
    id: "t4",
    senderName: "Employer Corp",
    receiverName: "You",
    amount: "+Rs.85,000",
    amountNum: 85000,
    date: "Mon, Mar 9",
    type: "credit",
    category: "Income",
    channel: "external",
    bankName: "MCB Bank",
    lastDigits: "891",
  },
  {
    id: "t5",
    senderName: "You",
    receiverName: "Jazz Mobile",
    amount: "-Rs.500",
    amountNum: 500,
    date: "Sun, Mar 8",
    type: "debit",
    category: "TopUp",
    channel: "topup",
  },
];

// ── ReceiptDialog ─────────────────────────────────────────────────────────────
function ReceiptDialog({
  tx,
  open,
  onClose,
}: {
  tx: Transaction | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!tx) return null;
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm" data-ocid="pocket.receipt.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-lg flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            Transaction Receipt
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {/* Channel badge */}
          <div className="flex justify-center">
            {tx.channel === "phonex" && (
              <Badge className="bg-emerald-500/15 text-emerald-600 border-0 text-sm px-4 py-1">
                <Zap className="w-3.5 h-3.5 mr-1.5" />
                PHONEX Transfer
              </Badge>
            )}
            {tx.channel === "external" && (
              <Badge className="bg-blue-500/15 text-blue-600 border-0 text-sm px-4 py-1">
                <Building2 className="w-3.5 h-3.5 mr-1.5" />
                EXTERNAL Bank
              </Badge>
            )}
            {tx.channel === "topup" && (
              <Badge className="bg-orange-500/15 text-orange-600 border-0 text-sm px-4 py-1">
                <Smartphone className="w-3.5 h-3.5 mr-1.5" />
                TOPUP
              </Badge>
            )}
          </div>

          <div className="bg-muted/50 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Date</span>
              <span className="text-sm font-medium text-foreground">
                {tx.date}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">From</span>
              <span className="text-sm font-semibold text-foreground">
                {tx.senderName}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">To</span>
              <span className="text-sm font-semibold text-foreground">
                {tx.receiverName}
              </span>
            </div>
            {tx.channel === "external" && tx.bankName && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Bank</span>
                <span className="text-sm font-medium text-foreground">
                  {tx.bankName}
                </span>
              </div>
            )}
            {tx.channel === "external" && tx.lastDigits && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Account</span>
                <span className="text-sm font-mono text-foreground">
                  ***{tx.lastDigits}
                </span>
              </div>
            )}
            <div className="pt-2 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Amount</span>
                <span
                  className={`text-lg font-black ${
                    tx.type === "credit"
                      ? "text-emerald-600"
                      : "text-destructive"
                  }`}
                >
                  {tx.amount} PKR
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            End-to-end encrypted · Secured by Phoenix
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── VerifySection ─────────────────────────────────────────────────────────────
interface VerifySectionProps {
  canVerify: boolean;
  verifying: boolean;
  verifiedName: string | null;
  onVerify: () => void;
}

function VerifySection({
  canVerify,
  verifying,
  verifiedName,
  onVerify,
}: VerifySectionProps) {
  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        data-ocid="send.verify.button"
        disabled={!canVerify || verifying || !!verifiedName}
        onClick={onVerify}
        className="w-full"
      >
        {verifying ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying…
          </>
        ) : verifiedName ? (
          <>
            <ShieldCheck className="mr-2 h-4 w-4 text-emerald-600" />
            Verified
          </>
        ) : (
          "Verify Person"
        )}
      </Button>

      <AnimatePresence>
        {verifiedName ? (
          <motion.div
            key="verified"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-2"
            data-ocid="send.verified.success_state"
          >
            <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              Name Verified: <span className="font-bold">{verifiedName}</span> ✓
            </p>
          </motion.div>
        ) : (
          <motion.p
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-muted-foreground text-center"
            data-ocid="send.verify.error_state"
          >
            Verification required before sending.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── TopUpModal ────────────────────────────────────────────────────────────────
interface TopUpModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (tx: Transaction) => void;
}

function TopUpModal({ open, onClose, onSuccess }: TopUpModalProps) {
  const [operator, setOperator] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  function resetAll() {
    setOperator("");
    setMobileNumber("");
    setAmount("");
    setSubmitting(false);
    setSuccess(false);
  }

  async function handleSubmit() {
    if (!operator || !mobileNumber || !amount) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    const tx: Transaction = {
      id: `tx-topup-${Date.now()}`,
      senderName: "You",
      receiverName: `${operator} (${mobileNumber})`,
      amount: `-Rs.${Number.parseFloat(amount).toLocaleString()}`,
      amountNum: Number.parseFloat(amount),
      date: new Date().toLocaleString("en-PK", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "debit",
      category: "TopUp",
      channel: "topup",
      isNew: true,
    };
    setSubmitting(false);
    setSuccess(true);
    setTimeout(() => {
      onSuccess(tx);
      resetAll();
      onClose();
    }, 1800);
  }

  const canSubmit =
    operator.length > 0 && mobileNumber.length >= 10 && amount.length > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          resetAll();
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-sm" data-ocid="topup.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-lg flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            Mobile Top-Up
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 py-6"
              data-ocid="topup.success_state"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <p className="font-bold text-lg text-foreground">
                Top-Up Successful!
              </p>
              <p className="text-sm text-muted-foreground text-center">
                <span className="font-semibold text-foreground">
                  Rs.{Number.parseFloat(amount || "0").toLocaleString()}
                </span>{" "}
                recharged to{" "}
                <span className="font-semibold text-foreground">
                  {mobileNumber}
                </span>{" "}
                via{" "}
                <span className="font-semibold text-foreground">
                  {operator}
                </span>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4 py-2"
            >
              <div className="space-y-1.5">
                <Label className="font-semibold">Mobile Operator</Label>
                <Select value={operator} onValueChange={setOperator}>
                  <SelectTrigger data-ocid="topup.operator.select">
                    <SelectValue placeholder="Select operator" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOBILE_OPERATORS.map((op) => (
                      <SelectItem key={op} value={op}>
                        {op}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold">Mobile Number</Label>
                <Input
                  data-ocid="topup.mobile.input"
                  type="tel"
                  placeholder="03XX-XXXXXXX"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold">Amount (PKR)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                    Rs.
                  </span>
                  <Input
                    data-ocid="topup.amount.input"
                    type="number"
                    placeholder="100"
                    className="pl-10"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>

              <Button
                data-ocid="topup.submit_button"
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className="w-full"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing…
                  </>
                ) : (
                  "Recharge Now"
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

// ── SendModal ─────────────────────────────────────────────────────────────────
type SendStep = "choose" | "phonex" | "external";

interface SendModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (tx: Transaction) => void;
}

function SendModal({ open, onClose, onSuccess }: SendModalProps) {
  const [step, setStep] = useState<SendStep>("choose");
  const [recipientId, setRecipientId] = useState("");
  const [amountA, setAmountA] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [bankName, setBankName] = useState("");
  const [ibanNumber, setIbanNumber] = useState("");
  const [amountB, setAmountB] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifiedName, setVerifiedName] = useState<string | null>(null);
  const [pocketKey, setPocketKey] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function resetAll() {
    setStep("choose");
    setRecipientId("");
    setAmountA("");
    setRecipientName("");
    setBankName("");
    setIbanNumber("");
    setAmountB("");
    setVerifying(false);
    setVerifiedName(null);
    setPocketKey("");
    setSubmitted(false);
  }

  async function handleVerify() {
    setVerifying(true);
    setVerifiedName(null);
    const name = await mockVerifyName(
      step === "external" ? recipientName : undefined,
    );
    setVerifiedName(name);
    setVerifying(false);
  }

  function handleSubmit() {
    const channel: Channel = step === "phonex" ? "phonex" : "external";
    const amount = step === "phonex" ? amountA : amountB;
    const name =
      step === "phonex"
        ? (verifiedName ?? recipientId)
        : (verifiedName ?? recipientName);
    const tx: Transaction = {
      id: `tx-${Date.now()}`,
      senderName: "You",
      receiverName: name,
      amount: `-Rs.${Number.parseFloat(amount).toLocaleString()}`,
      amountNum: Number.parseFloat(amount),
      date: new Date().toLocaleString("en-PK", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "debit",
      category: "Transfer",
      channel,
      bankName: step === "external" ? bankName : undefined,
      lastDigits: step === "external" ? ibanNumber.slice(-3) : undefined,
      isNew: true,
    };
    setSubmitted(true);
    setTimeout(() => {
      onSuccess(tx);
      resetAll();
      onClose();
    }, 1400);
  }

  const canVerifyPhonex = recipientId.length >= 12 && amountA.length > 0;
  const canVerifyExternal =
    recipientName.length > 2 &&
    bankName.length > 1 &&
    ibanNumber.length > 4 &&
    amountB.length > 0;
  const canVerify = step === "phonex" ? canVerifyPhonex : canVerifyExternal;
  const canSend = !!verifiedName && pocketKey.length === 4;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          resetAll();
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md" data-ocid="send.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            {step === "choose" && "Send Payment"}
            {step === "phonex" && "Phonex to Phonex"}
            {step === "external" && "Transfer to Bank / IBAN"}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 py-6"
              data-ocid="send.success_state"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
                <Check className="w-8 h-8 text-emerald-500" />
              </div>
              <p className="font-bold text-lg">Payment Sent!</p>
              <p className="text-sm text-muted-foreground text-center">
                Receipt sent to both parties
              </p>
            </motion.div>
          ) : step === "choose" ? (
            <motion.div
              key="choose"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3 py-2"
            >
              <button
                type="button"
                data-ocid="send.phonex.button"
                onClick={() => setStep("phonex")}
                className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-foreground">
                    Option A — Phonex to Phonex
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Send via Payment ID
                  </p>
                </div>
              </button>

              <button
                type="button"
                data-ocid="send.external.button"
                onClick={() => setStep("external")}
                className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-border hover:border-muted-foreground/40 hover:bg-muted/50 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-foreground">
                    Option B — External Bank
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Transfer via Bank / IBAN
                  </p>
                </div>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 py-2"
            >
              {step === "phonex" ? (
                <>
                  <div className="space-y-1.5">
                    <Label className="font-semibold">
                      Recipient Payment ID
                    </Label>
                    <Input
                      data-ocid="send.recipient.input"
                      placeholder="PXP-XXXXXXXX"
                      value={recipientId}
                      onChange={(e) => setRecipientId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-semibold">Amount (PKR)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                        Rs.
                      </span>
                      <Input
                        data-ocid="send.amount.input"
                        type="number"
                        placeholder="0"
                        className="pl-10"
                        value={amountA}
                        onChange={(e) => setAmountA(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <Label className="font-semibold">Recipient Name</Label>
                    <Input
                      data-ocid="send.name.input"
                      placeholder="Full name"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-semibold">Bank Name</Label>
                    <Input
                      data-ocid="send.bank.input"
                      placeholder="Bank name"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-semibold">
                      IBAN / Account Number
                    </Label>
                    <Input
                      data-ocid="send.iban.input"
                      placeholder="IBAN or account number"
                      value={ibanNumber}
                      onChange={(e) => setIbanNumber(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-semibold">Amount (PKR)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                        Rs.
                      </span>
                      <Input
                        data-ocid="send.amount.input"
                        type="number"
                        placeholder="0"
                        className="pl-10"
                        value={amountB}
                        onChange={(e) => setAmountB(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              <VerifySection
                canVerify={canVerify}
                verifying={verifying}
                verifiedName={verifiedName}
                onVerify={handleVerify}
              />

              {verifiedName && (
                <div className="space-y-1.5">
                  <Label className="font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    Secret Pocket Key
                  </Label>
                  <Input
                    data-ocid="send.pocketkey.input"
                    maxLength={4}
                    placeholder="4-character key"
                    value={pocketKey}
                    onChange={(e) => setPocketKey(e.target.value.toUpperCase())}
                    className="tracking-[0.3em] font-mono text-center uppercase"
                  />
                  <p className="text-[10px] text-muted-foreground text-center">
                    Enter your system-generated 4-character Secret Pocket Key
                  </p>
                </div>
              )}

              <Button
                data-ocid="send.submit_button"
                onClick={handleSubmit}
                disabled={!canSend}
                className="w-full"
              >
                <Send className="mr-2 h-4 w-4" />
                Send Rs.{" "}
                {Number.parseFloat(
                  (step === "phonex" ? amountA : amountB) || "0",
                ).toLocaleString()}
              </Button>

              <button
                type="button"
                data-ocid="send.back.button"
                onClick={() => {
                  setStep("choose");
                  setVerifiedName(null);
                  setPocketKey("");
                }}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                ← Back
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

// ── ReceiveModal ──────────────────────────────────────────────────────────────
interface ReceiveModalProps {
  open: boolean;
  onClose: () => void;
  paymentId: string;
}

function ReceiveModal({ open, onClose, paymentId }: ReceiveModalProps) {
  const { currentUser } = useAuth();
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(paymentId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm" data-ocid="receive.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            Receive Money
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex flex-col items-center gap-3">
            <div className="w-28 h-28 bg-foreground/5 rounded-2xl p-2 grid grid-cols-5 gap-0.5">
              {QR_CELLS.map((cell) => (
                <div
                  key={cell.id}
                  className={`rounded-sm ${
                    cell.filled ? "bg-foreground" : "bg-transparent"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Scan to pay me</p>
          </div>

          <div className="bg-muted/50 rounded-xl p-3">
            <p className="text-xs text-muted-foreground mb-1">
              Your Payment ID
            </p>
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono font-bold text-foreground tracking-wider">
                {paymentId}
              </p>
              <button
                type="button"
                data-ocid="receive.copy.button"
                onClick={handleCopy}
                className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-primary" />
                )}
              </button>
            </div>
          </div>

          {currentUser?.bankName && (
            <div className="bg-muted/50 rounded-xl p-3 space-y-1">
              <p className="text-xs text-muted-foreground">Bank Details</p>
              <p className="text-sm font-semibold text-foreground">
                {currentUser.bankName}
              </p>
              {currentUser.ibanNumber && (
                <p className="text-xs text-muted-foreground font-mono">
                  {currentUser.ibanNumber}
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── PocketTab ─────────────────────────────────────────────────────────────────
export default function PocketTab() {
  const paymentId = useMemo(() => generatePaymentId(), []);
  const pocketKey = useMemo(() => generatePocketKey(), []);
  const [keyVisible, setKeyVisible] = useState(false);
  const [transactions, setTransactions] =
    useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [sendOpen, setSendOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const balance = useMemo(() => {
    let total = 95000;
    for (const tx of transactions) {
      if (tx.type === "credit") total += tx.amountNum;
      else total -= tx.amountNum;
    }
    return total;
  }, [transactions]);

  function handleCopyId() {
    navigator.clipboard.writeText(paymentId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSendSuccess(tx: Transaction) {
    setTransactions((prev) => [tx, ...prev]);
  }

  function handleTopUpSuccess(tx: Transaction) {
    setTransactions((prev) => [tx, ...prev]);
  }

  function openReceipt(tx: Transaction) {
    setReceiptTx(tx);
    setReceiptOpen(true);
  }

  const quickActions = [
    {
      label: "Send",
      icon: Send,
      color: "text-primary",
      bg: "bg-primary/10",
      onClick: () => setSendOpen(true),
      ocid: "pocket.send.button",
    },
    {
      label: "Receive",
      icon: Download,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
      onClick: () => setReceiveOpen(true),
      ocid: "pocket.receive.button",
    },
    {
      label: "Top Up",
      icon: Plus,
      color: "text-violet-600",
      bg: "bg-violet-500/10",
      onClick: () => setTopUpOpen(true),
      ocid: "pocket.topup.button",
    },
    {
      label: "QR Pay",
      icon: QrCode,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      onClick: () => setReceiveOpen(true),
      ocid: "pocket.qr.button",
    },
  ];

  function getChannelBadge(channel: Channel) {
    if (channel === "phonex") {
      return (
        <Badge className="text-[9px] px-1.5 py-0 bg-emerald-500/15 text-emerald-600 border-0 font-bold">
          <Zap className="w-2.5 h-2.5 mr-0.5" />
          PHONEX
        </Badge>
      );
    }
    if (channel === "external") {
      return (
        <Badge className="text-[9px] px-1.5 py-0 bg-blue-500/15 text-blue-600 border-0 font-bold">
          <Building2 className="w-2.5 h-2.5 mr-0.5" />
          EXTERNAL
        </Badge>
      );
    }
    return (
      <Badge className="text-[9px] px-1.5 py-0 bg-orange-500/15 text-orange-600 border-0 font-bold">
        <Smartphone className="w-2.5 h-2.5 mr-0.5" />
        TOPUP
      </Badge>
    );
  }

  return (
    <div className="flex flex-col gap-0 pb-6">
      {/* Balance card */}
      <div className="phoenix-gradient px-5 pt-6 pb-8">
        <div className="flex items-start justify-between mb-1">
          <div>
            <p className="text-primary-foreground/70 text-xs font-medium uppercase tracking-widest">
              PKR Balance
            </p>
            <p className="text-5xl font-black text-primary-foreground mt-1 tracking-tight">
              Rs.{balance.toLocaleString()}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge className="bg-white/20 text-white border-0 text-[10px]">
              <ShieldCheck className="w-3 h-3 mr-1" />
              Encrypted
            </Badge>
            <button
              type="button"
              data-ocid="pocket.key.toggle"
              onClick={() => setKeyVisible((v) => !v)}
              className="flex items-center gap-1 bg-white/15 text-white border-0 text-[10px] font-mono rounded-full px-2 py-0.5 hover:bg-white/25 transition-colors"
            >
              {keyVisible ? (
                <>
                  <EyeOff className="w-3 h-3" />
                  KEY: {pocketKey}
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3" />
                  KEY: ****
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <div className="bg-white/15 rounded-lg px-3 py-1.5 flex items-center gap-2">
            <p className="font-mono text-xs text-white/90 tracking-wider">
              {paymentId}
            </p>
            <button
              type="button"
              data-ocid="pocket.copy.button"
              onClick={handleCopyId}
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/20 transition-colors"
            >
              {copied ? (
                <Check className="w-3 h-3 text-white" />
              ) : (
                <Copy className="w-3 h-3 text-white/70" />
              )}
            </button>
          </div>
          <Badge className="bg-white/15 text-white border-0 text-[10px]">
            <QrCode className="w-3 h-3 mr-1" />
            Payment ID
          </Badge>
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-4 -mt-4">
        <div className="bg-card rounded-2xl shadow-lg border border-border p-4">
          <div className="grid grid-cols-4 gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  type="button"
                  data-ocid={action.ocid}
                  onClick={action.onClick}
                  className="flex flex-col items-center gap-2 py-2 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center`}
                  >
                    <Icon className={`w-5 h-5 ${action.color}`} />
                  </div>
                  <span className="text-[11px] font-medium text-foreground">
                    {action.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="px-4 mt-5">
        <h3 className="font-display font-bold text-foreground mb-3 text-sm uppercase tracking-wide">
          Transaction History
        </h3>
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {transactions.length === 0 ? (
              <div
                data-ocid="pocket.transactions.empty_state"
                className="flex flex-col items-center py-10 text-center"
              >
                <Receipt className="w-10 h-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No transactions yet
                </p>
              </div>
            ) : (
              transactions.map((tx, i) => (
                <motion.div
                  key={tx.id}
                  layout
                  initial={tx.isNew ? { opacity: 0, y: -10 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-2xl border border-border px-4 py-3"
                  data-ocid={`pocket.transaction.item.${i + 1}`}
                >
                  {/* Top row: channel badge + date */}
                  <div className="flex items-center justify-between mb-2">
                    {getChannelBadge(tx.channel)}
                    <span className="text-[10px] text-muted-foreground">
                      {tx.date}
                    </span>
                  </div>

                  {/* Middle row: sender → receiver + amount */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <span className="text-sm font-semibold text-foreground truncate max-w-[80px]">
                        {tx.senderName}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm font-semibold text-foreground truncate max-w-[80px]">
                        {tx.receiverName}
                      </span>
                    </div>
                    <span
                      className={`text-sm font-black flex-shrink-0 ${
                        tx.type === "credit"
                          ? "text-emerald-600"
                          : "text-destructive"
                      }`}
                    >
                      {tx.amount}
                    </span>
                  </div>

                  {/* Bottom row: category + View Receipt */}
                  <div className="flex items-center justify-between mt-2">
                    <Badge
                      className={`text-[9px] px-1.5 py-0 border-0 ${
                        tx.category === "Income"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : tx.category === "TopUp"
                            ? "bg-orange-500/10 text-orange-600"
                            : "bg-primary/10 text-primary"
                      }`}
                    >
                      {tx.category}
                    </Badge>
                    <button
                      type="button"
                      data-ocid={`pocket.receipt.button.${i + 1}`}
                      onClick={() => openReceipt(tx)}
                      className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      <Receipt className="w-3 h-3" />
                      View Receipt
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
      <SendModal
        open={sendOpen}
        onClose={() => setSendOpen(false)}
        onSuccess={handleSendSuccess}
      />
      <ReceiveModal
        open={receiveOpen}
        onClose={() => setReceiveOpen(false)}
        paymentId={paymentId}
      />
      <TopUpModal
        open={topUpOpen}
        onClose={() => setTopUpOpen(false)}
        onSuccess={handleTopUpSuccess}
      />
      <ReceiptDialog
        tx={receiptTx}
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
      />
    </div>
  );
}
