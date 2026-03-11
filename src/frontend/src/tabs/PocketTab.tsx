import { Badge } from "@/components/ui/badge";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Download,
  Plus,
  Send,
} from "lucide-react";
import { motion } from "motion/react";

const BALANCE = "$2,450.00";

const QUICK_ACTIONS = [
  { label: "Send", Icon: Send, ocid: "pocket.send.button" },
  { label: "Receive", Icon: Download, ocid: "pocket.receive.button" },
  { label: "Top Up", Icon: Plus, ocid: "pocket.topup.button" },
  { label: "History", Icon: Clock, ocid: "pocket.history.button" },
];

type TxType = "credit" | "debit";

const TRANSACTIONS: {
  name: string;
  amount: string;
  date: string;
  type: TxType;
  category: string;
}[] = [
  {
    name: "Alice Johnson",
    amount: "+$150.00",
    date: "Today, 2:10 PM",
    type: "credit",
    category: "Transfer",
  },
  {
    name: "Netflix",
    amount: "-$15.99",
    date: "Today, 9:00 AM",
    type: "debit",
    category: "Subscription",
  },
  {
    name: "Bob Martinez",
    amount: "-$40.00",
    date: "Yesterday",
    type: "debit",
    category: "Transfer",
  },
  {
    name: "Salary Deposit",
    amount: "+$1,200.00",
    date: "Mon, Mar 9",
    type: "credit",
    category: "Income",
  },
  {
    name: "Grocery Store",
    amount: "-$62.45",
    date: "Sun, Mar 8",
    type: "debit",
    category: "Shopping",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Transfer: "bg-primary/15 text-primary border-0",
  Subscription: "bg-secondary text-secondary-foreground border-0",
  Income: "bg-emerald-500/15 text-emerald-600 border-0",
  Shopping: "bg-accent text-accent-foreground border-0",
};

export default function PocketTab() {
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
            {BALANCE}
          </p>
          <p className="text-primary-foreground/60 text-xs mt-3">
            Phoenix Pocket · **** 4291
          </p>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-4 grid grid-cols-4 gap-3">
        {QUICK_ACTIONS.map(({ label, Icon, ocid }, idx) => (
          <motion.button
            key={label}
            type="button"
            data-ocid={ocid}
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
          {TRANSACTIONS.map((tx, idx) => (
            <motion.div
              key={`${tx.name}-${idx}`}
              data-ocid={`pocket.item.${idx + 1}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.07, duration: 0.3 }}
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
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge
                    className={`text-xs px-1.5 py-0 ${CATEGORY_COLORS[tx.category] || "bg-muted text-muted-foreground border-0"}`}
                  >
                    {tx.category}
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
        </div>
      </div>
    </div>
  );
}
