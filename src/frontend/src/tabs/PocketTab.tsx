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
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  Check,
  Clock,
  Copy,
  Download,
  Loader2,
  Plus,
  QrCode,
  Send,
  ShieldCheck,
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

// Static QR cell pattern with stable string IDs (no index keys)
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

// ── types ─────────────────────────────────────────────────────────────────────
type Channel = "phonex" | "external";
type TxType = "credit" | "debit";

interface Transaction {
  id: string;
  name: string;
  amount: string;
  date: string;
  type: TxType;
  category: string;
  channel: Channel;
  isNew?: boolean;
}

// ── constants ─────────────────────────────────────────────────────────────────
const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "t1",
    name: "Alice Johnson",
    amount: "+$150.00",
    date: "Today, 2:10 PM",
    type: "credit",
    category: "Transfer",
    channel: "phonex",
  },
  {
    id: "t2",
    name: "Netflix",
    amount: "-$15.99",
    date: "Today, 9:00 AM",
    type: "debit",
    category: "Subscription",
    channel: "external",
  },
  {
    id: "t3",
    name: "Bob Martinez",
    amount: "-$40.00",
    date: "Yesterday",
    type: "debit",
    category: "Transfer",
    channel: "phonex",
  },
  {
    id: "t4",
    name: "Salary Deposit",
    amount: "+$1,200.00",
    date: "Mon, Mar 9",
    type: "credit",
    category: "Income",
    channel: "external",
  },
  {
    id: "t5",
    name: "Grocery Store",
    amount: "-$62.45",
    date: "Sun, Mar 8",
    type: "debit",
    category: "Shopping",
    channel: "external",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Transfer: "bg-primary/15 text-primary border-0",
  Subscription: "bg-secondary text-secondary-foreground border-0",
  Income: "bg-emerald-500/15 text-emerald-600 border-0",
  Shopping: "bg-accent text-accent-foreground border-0",
};

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
      name,
      amount: `-$${Number.parseFloat(amount).toFixed(2)}`,
      date: "Just now",
      type: "debit",
      category: "Transfer",
      channel,
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
          {step === "choose" && (
            <motion.div
              key="choose"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 gap-3 py-2"
            >
              <button
                type="button"
                data-ocid="send.phonex.button"
                onClick={() => setStep("phonex")}
                className="flex items-start gap-4 rounded-2xl border-2 border-border bg-card p-4 text-left transition-all hover:border-primary hover:shadow-md"
              >
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-display font-bold text-foreground">
                    Option A — Phonex to Phonex
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Fast transfer using Phoenix Payment ID
                  </p>
                </div>
              </button>

              <button
                type="button"
                data-ocid="send.external.button"
                onClick={() => setStep("external")}
                className="flex items-start gap-4 rounded-2xl border-2 border-border bg-card p-4 text-left transition-all hover:border-primary hover:shadow-md"
              >
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-muted">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-display font-bold text-foreground">
                    Option B — Other Bank / External
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Transfer to any bank account via IBAN
                  </p>
                </div>
              </button>
            </motion.div>
          )}

          {step === "phonex" && !submitted && (
            <motion.div
              key="phonex"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-4 py-2"
            >
              <div className="space-y-1.5">
                <Label htmlFor="recipient-id">Recipient Payment ID</Label>
                <Input
                  id="recipient-id"
                  data-ocid="send.phonex.input"
                  placeholder="PXP-XXXXXXXX"
                  value={recipientId}
                  onChange={(e) => {
                    setRecipientId(e.target.value);
                    setVerifiedName(null);
                  }}
                  className="font-mono uppercase"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="amount-a">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    $
                  </span>
                  <Input
                    id="amount-a"
                    data-ocid="send.phonex.amount.input"
                    type="number"
                    placeholder="0.00"
                    value={amountA}
                    onChange={(e) => {
                      setAmountA(e.target.value);
                      setVerifiedName(null);
                    }}
                    className="pl-7"
                  />
                </div>
              </div>
              <VerifySection
                canVerify={canVerify}
                verifying={verifying}
                verifiedName={verifiedName}
                onVerify={handleVerify}
              />
              <Button
                data-ocid="send.phonex.submit_button"
                disabled={!verifiedName}
                onClick={handleSubmit}
                className="w-full"
              >
                Send Payment
              </Button>
            </motion.div>
          )}

          {step === "external" && !submitted && (
            <motion.div
              key="external"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-4 py-2"
            >
              <div className="space-y-1.5">
                <Label htmlFor="ext-name">Recipient Full Name</Label>
                <Input
                  id="ext-name"
                  data-ocid="send.external.name.input"
                  placeholder="Full legal name"
                  value={recipientName}
                  onChange={(e) => {
                    setRecipientName(e.target.value);
                    setVerifiedName(null);
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ext-bank">Bank Name</Label>
                <Input
                  id="ext-bank"
                  data-ocid="send.external.bank.input"
                  placeholder="e.g. Standard Bank"
                  value={bankName}
                  onChange={(e) => {
                    setBankName(e.target.value);
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ext-iban">Account / IBAN Number</Label>
                <Input
                  id="ext-iban"
                  data-ocid="send.external.iban.input"
                  placeholder="GB29 NWBK 6016 1331 9268 19"
                  value={ibanNumber}
                  onChange={(e) => {
                    setIbanNumber(e.target.value);
                    setVerifiedName(null);
                  }}
                  className="font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="amount-b">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    $
                  </span>
                  <Input
                    id="amount-b"
                    data-ocid="send.external.amount.input"
                    type="number"
                    placeholder="0.00"
                    value={amountB}
                    onChange={(e) => {
                      setAmountB(e.target.value);
                      setVerifiedName(null);
                    }}
                    className="pl-7"
                  />
                </div>
              </div>
              <VerifySection
                canVerify={canVerify}
                verifying={verifying}
                verifiedName={verifiedName}
                onVerify={handleVerify}
              />
              <Button
                data-ocid="send.external.submit_button"
                disabled={!verifiedName}
                onClick={handleSubmit}
                className="w-full"
              >
                Send Payment
              </Button>
            </motion.div>
          )}

          {submitted && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 py-6"
              data-ocid="send.success_state"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
                <Check className="h-8 w-8 text-emerald-600" />
              </div>
              <p className="font-display font-bold text-lg text-foreground">
                Payment Sent!
              </p>
              <p className="text-sm text-muted-foreground">
                Transaction has been processed successfully.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {step !== "choose" && !submitted && (
          <button
            type="button"
            onClick={() => {
              setStep("choose");
              setVerifiedName(null);
            }}
            data-ocid="send.cancel_button"
            className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground mt-1"
          >
            ← Back to options
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── ReceiveModal ──────────────────────────────────────────────────────────────
interface ReceiveModalProps {
  open: boolean;
  onClose: () => void;
  paymentId: string;
  bankName?: string;
  ibanNumber?: string;
}

function ReceiveModal({
  open,
  onClose,
  paymentId,
  bankName,
  ibanNumber,
}: ReceiveModalProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(paymentId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="sm:max-w-sm" data-ocid="receive.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            Receive Payment
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          {/* QR placeholder */}
          <div
            data-ocid="receive.canvas_target"
            className="relative flex h-36 w-36 items-center justify-center rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5"
          >
            <QrCode className="h-16 w-16 text-primary/40" />
            <div className="absolute inset-3 grid grid-cols-5 grid-rows-5 gap-0.5 opacity-20 pointer-events-none">
              {QR_CELLS.map((cell) => (
                <div
                  key={cell.id}
                  className={`rounded-[1px] ${cell.filled ? "bg-primary" : "bg-transparent"}`}
                />
              ))}
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">
              Your Phoenix Payment ID
            </p>
            <p className="font-mono font-black text-2xl text-primary tracking-widest">
              {paymentId}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            data-ocid="receive.copy.button"
            onClick={handleCopy}
            className="flex items-center gap-2"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "Copied!" : "Copy Payment ID"}
          </Button>

          <p className="text-xs text-center text-muted-foreground leading-relaxed">
            Share your Payment ID for Phonex transfers, or provide your bank
            details for external transfers.
          </p>

          <div className="w-full rounded-xl border border-border bg-muted/40 px-4 py-3 space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Bank Details
            </p>
            {bankName ? (
              <>
                <p className="text-sm text-foreground">
                  <span className="text-muted-foreground">Bank: </span>
                  {bankName}
                </p>
                <p className="text-sm font-mono text-foreground">
                  <span className="text-muted-foreground">IBAN: </span>
                  {ibanNumber}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Not set — update in Profile
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── PocketTab (main) ──────────────────────────────────────────────────────────
export default function PocketTab() {
  const { currentUser } = useAuth();
  const paymentId = useMemo(() => generatePaymentId(), []);
  const [transactions, setTransactions] =
    useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [sendOpen, setSendOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  function handleCopyId() {
    navigator.clipboard.writeText(paymentId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  }

  function handlePaymentSuccess(tx: Transaction) {
    setTransactions((prev) => [tx, ...prev]);
    setTimeout(() => {
      setTransactions((prev) =>
        prev.map((t) => (t.id === tx.id ? { ...t, isNew: false } : t)),
      );
    }, 2000);
  }

  const QUICK_ACTIONS = [
    {
      label: "Send",
      Icon: Send,
      ocid: "pocket.send.button",
      onClick: () => setSendOpen(true),
    },
    {
      label: "Receive",
      Icon: Download,
      ocid: "pocket.receive.button",
      onClick: () => setReceiveOpen(true),
    },
    {
      label: "Top Up",
      Icon: Plus,
      ocid: "pocket.topup.button",
      onClick: () => {},
    },
    {
      label: "History",
      Icon: Clock,
      ocid: "pocket.history.button",
      onClick: () => {},
    },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Balance Card */}
      <div className="px-4 pt-5 pb-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
          className="phoenix-gradient rounded-2xl p-5 shadow-lg relative overflow-hidden"
          data-ocid="pocket.card"
        >
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 70% 30%, white, transparent 60%)",
            }}
          />
          <p className="text-primary-foreground/75 text-sm font-medium">
            Total Balance
          </p>
          <p className="font-display font-black text-4xl text-primary-foreground mt-1 tracking-tight">
            $2,450.00
          </p>

          <div className="flex items-center gap-2 mt-3">
            <div>
              <p className="text-primary-foreground/60 text-[10px] uppercase tracking-widest font-semibold">
                Payment ID
              </p>
              <p className="font-mono font-bold text-primary-foreground text-sm tracking-widest">
                {paymentId}
              </p>
            </div>
            <button
              type="button"
              data-ocid="pocket.copy.button"
              onClick={handleCopyId}
              className="ml-auto flex items-center gap-1 rounded-lg bg-white/15 hover:bg-white/25 px-2.5 py-1 text-primary-foreground text-xs font-medium transition-colors"
            >
              {copiedId ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              {copiedId ? "Copied" : "Copy"}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-4 grid grid-cols-4 gap-3">
        {QUICK_ACTIONS.map(({ label, Icon, ocid, onClick }, idx) => (
          <motion.button
            key={label}
            type="button"
            data-ocid={ocid}
            onClick={onClick}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + idx * 0.06, duration: 0.3 }}
            className="flex flex-col items-center gap-1.5 bg-card border border-border rounded-2xl py-3 hover:shadow-md transition-shadow"
          >
            <div className="w-9 h-9 rounded-xl phoenix-gradient flex items-center justify-center">
              <Icon className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-xs font-medium text-foreground">{label}</span>
          </motion.button>
        ))}
      </div>

      {/* Transactions */}
      <div className="px-4 pb-6">
        <h3 className="font-display font-bold text-foreground mb-3">
          Recent Transactions
        </h3>
        <div className="flex flex-col gap-2" data-ocid="pocket.list">
          <AnimatePresence initial={false}>
            {transactions.map((tx, idx) => (
              <motion.div
                key={tx.id}
                data-ocid={`pocket.item.${idx + 1}`}
                layout
                initial={{ opacity: 0, y: -16 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  backgroundColor: tx.isNew
                    ? "oklch(0.92 0.12 145)"
                    : undefined,
                }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35 }}
                className="bg-card rounded-2xl px-4 py-3 border border-border flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${tx.type === "credit" ? "bg-emerald-500/15" : "bg-primary/15"}`}
                >
                  {tx.type === "credit" ? (
                    <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-sm text-foreground truncate">
                    {tx.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <Badge
                      className={`text-xs px-1.5 py-0 ${CATEGORY_COLORS[tx.category] || "bg-muted text-muted-foreground border-0"}`}
                    >
                      {tx.category}
                    </Badge>
                    <Badge
                      className={`text-xs px-1.5 py-0 border-0 ${tx.channel === "phonex" ? "bg-violet-500/15 text-violet-600" : "bg-muted text-muted-foreground"}`}
                    >
                      {tx.channel === "phonex" ? "Phonex" : "External"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {tx.date}
                    </span>
                  </div>
                </div>
                <span
                  className={`font-display font-bold text-sm flex-shrink-0 ${tx.type === "credit" ? "text-emerald-600" : "text-foreground"}`}
                >
                  {tx.amount}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <SendModal
        open={sendOpen}
        onClose={() => setSendOpen(false)}
        onSuccess={handlePaymentSuccess}
      />
      <ReceiveModal
        open={receiveOpen}
        onClose={() => setReceiveOpen(false)}
        paymentId={paymentId}
        bankName={currentUser?.bankName}
        ibanNumber={currentUser?.ibanNumber}
      />
    </div>
  );
}
