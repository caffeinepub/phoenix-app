// PhonexDB — localStorage-backed data service for all Phonex app data
import { cloudSync } from "./CloudSyncService";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface PhonexUser {
  paymentId: string;
  username: string;
  password: string;
  email: string;
  phone: string;
  displayName: string;
  bankName: string;
  bankAccount: string;
  pocketPin: string;
  avatarUrl: string;
  createdAt: number;
  blocked?: boolean;
  restricted?: boolean;
}

export interface PhonexTransaction {
  id: string;
  senderPaymentId: string;
  receiverPaymentId: string;
  receiverDisplay: string;
  amount: number;
  channel: "PHONEX" | "EXTERNAL" | "TOPUP";
  timestamp: number;
  bankName?: string;
  ibanDigits?: string;
  operatorName?: string;
  mobileNumber?: string;
  note?: string;
}

export interface PhonexFeel {
  id: string;
  creatorPaymentId: string;
  creatorName: string;
  mediaUrl: string;
  mediaType: "photo" | "video";
  mood: string;
  caption: string;
  createdAt: number;
  expiresAt: number;
}

export interface PhonexEmail {
  id: string;
  fromPaymentId: string;
  fromDisplay: string;
  toAddress: string;
  ccList: string[];
  bccList: string[];
  subject: string;
  body: string;
  attachmentNames: string[];
  timestamp: number;
  isRead: boolean;
}

export interface PhonexContact {
  id: string;
  name: string;
  phonexId: string;
  email: string;
  phone: string;
}

export interface PhonexMessage {
  id: string;
  fromPaymentId: string;
  toPaymentId: string;
  messageType: "text" | "voice" | "video";
  content: string;
  timestamp: number;
}

export interface SecurityEvent {
  id: string;
  type:
    | "failed_login"
    | "blocked_attempt"
    | "suspicious_activity"
    | "account_locked";
  email: string;
  ip?: string;
  timestamp: number;
  details: string;
}

// ── Storage helpers ────────────────────────────────────────────────────────────
function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// ── Keys ──────────────────────────────────────────────────────────────────────
const KEYS = {
  users: "phonex_db_users",
  transactions: (pid: string) => `phonex_db_txs_${pid}`,
  feels: "phonex_db_feels",
  emails: (pid: string) => `phonex_db_emails_${pid}`,
  contacts: (pid: string) => `phonex_db_contacts_${pid}`,
  messages: (pid1: string, pid2: string) =>
    `phonex_db_msgs_${[pid1, pid2].sort().join("_")}`,
  balance: (pid: string) => `phonex_db_balance_${pid}`,
  securityEvents: "phonex_security_events",
  failedLogins: "phonex_failed_logins",
};

// ── Users ─────────────────────────────────────────────────────────────────────
export function registerUser(user: PhonexUser): void {
  const users = read<PhonexUser[]>(KEYS.users, []);
  const filtered = users.filter(
    (u) => u.paymentId !== user.paymentId && u.email !== user.email,
  );
  write(KEYS.users, [...filtered, user]);
  cloudSync.syncUserData(
    user.paymentId,
    user as unknown as Record<string, unknown>,
  );
}

export function loginUser(
  identifier: string,
  password: string,
): PhonexUser | null {
  const users = read<PhonexUser[]>(KEYS.users, []);
  return (
    users.find(
      (u) =>
        (u.email === identifier ||
          u.paymentId === identifier ||
          u.username === identifier) &&
        u.password === password,
    ) ?? null
  );
}

export function getUser(paymentId: string): PhonexUser | null {
  const users = read<PhonexUser[]>(KEYS.users, []);
  return users.find((u) => u.paymentId === paymentId) ?? null;
}

export function updateUser(
  paymentId: string,
  fields: Partial<PhonexUser>,
): void {
  const users = read<PhonexUser[]>(KEYS.users, []);
  const updated = users.map((u) =>
    u.paymentId === paymentId ? { ...u, ...fields } : u,
  );
  write(KEYS.users, updated);
  const updatedUser = updated.find((u) => u.paymentId === paymentId);
  if (updatedUser) {
    cloudSync.syncUserData(
      paymentId,
      updatedUser as unknown as Record<string, unknown>,
    );
  }
}

export function getAllUsers(): PhonexUser[] {
  return read<PhonexUser[]>(KEYS.users, []);
}

export function deleteUserAccount(paymentId: string): void {
  const users = read<PhonexUser[]>(KEYS.users, []);
  write(
    KEYS.users,
    users.filter((u) => u.paymentId !== paymentId),
  );
}

export function resetPassword(email: string, newPassword: string): boolean {
  const users = read<PhonexUser[]>(KEYS.users, []);
  const user = users.find((u) => u.email === email);
  if (!user) return false;
  updateUser(user.paymentId, { password: newPassword });
  return true;
}

// ── Admin user management ──────────────────────────────────────────────────────
export function blockUser(paymentId: string): void {
  updateUser(paymentId, { blocked: true });
}

export function unblockUser(paymentId: string): void {
  updateUser(paymentId, { blocked: false });
}

export function restrictUser(paymentId: string): void {
  updateUser(paymentId, { restricted: true });
}

export function unrestrictUser(paymentId: string): void {
  updateUser(paymentId, { restricted: false });
}

export function adminDeleteUser(paymentId: string): void {
  deleteUserAccount(paymentId);
}

// ── Security Events ───────────────────────────────────────────────────────────
export function logSecurityEvent(event: SecurityEvent): void {
  const events = read<SecurityEvent[]>(KEYS.securityEvents, []);
  write(KEYS.securityEvents, [event, ...events].slice(0, 500));
}

export function getSecurityEvents(): SecurityEvent[] {
  return read<SecurityEvent[]>(KEYS.securityEvents, []);
}

export function clearSecurityEvents(): void {
  write(KEYS.securityEvents, []);
}

// ── Failed Login Tracking ─────────────────────────────────────────────────────
export function incrementFailedLogin(email: string): number {
  const map = read<Record<string, number>>(KEYS.failedLogins, {});
  const count = (map[email] ?? 0) + 1;
  write(KEYS.failedLogins, { ...map, [email]: count });
  return count;
}

export function getFailedLogins(email: string): number {
  const map = read<Record<string, number>>(KEYS.failedLogins, {});
  return map[email] ?? 0;
}

export function resetFailedLogins(email: string): void {
  const map = read<Record<string, number>>(KEYS.failedLogins, {});
  const updated = { ...map };
  delete updated[email];
  write(KEYS.failedLogins, updated);
}

// ── Balance ───────────────────────────────────────────────────────────────────
export function getBalance(paymentId: string): number {
  return read<number>(KEYS.balance(paymentId), 100000);
}

export function setBalance(paymentId: string, amount: number): void {
  write(KEYS.balance(paymentId), amount);
}

// ── Transactions ──────────────────────────────────────────────────────────────
export function addTransaction(tx: PhonexTransaction): void {
  const txs = read<PhonexTransaction[]>(
    KEYS.transactions(tx.senderPaymentId),
    [],
  );
  write(KEYS.transactions(tx.senderPaymentId), [tx, ...txs]);
  cloudSync.syncTransactions(tx.senderPaymentId);
  if (tx.channel === "PHONEX" && tx.receiverPaymentId !== tx.senderPaymentId) {
    const rxTxs = read<PhonexTransaction[]>(
      KEYS.transactions(tx.receiverPaymentId),
      [],
    );
    write(KEYS.transactions(tx.receiverPaymentId), [tx, ...rxTxs]);
    cloudSync.syncTransactions(tx.receiverPaymentId);
  }
}

export function getTransactions(paymentId: string): PhonexTransaction[] {
  return read<PhonexTransaction[]>(KEYS.transactions(paymentId), []);
}

// ── Feels ─────────────────────────────────────────────────────────────────────
export function addFeel(feel: PhonexFeel): void {
  const feels = read<PhonexFeel[]>(KEYS.feels, []);
  write(KEYS.feels, [feel, ...feels]);
}

export function getActiveFeels(): PhonexFeel[] {
  const now = Date.now();
  const feels = read<PhonexFeel[]>(KEYS.feels, []);
  return feels.filter((f) => f.expiresAt > now);
}

export function deleteMyFeel(feelId: string, paymentId: string): void {
  const feels = read<PhonexFeel[]>(KEYS.feels, []);
  write(
    KEYS.feels,
    feels.filter((f) => !(f.id === feelId && f.creatorPaymentId === paymentId)),
  );
}

// ── Emails ────────────────────────────────────────────────────────────────────
export function sendEmail(email: PhonexEmail): void {
  const sent = read<PhonexEmail[]>(KEYS.emails(email.fromPaymentId), []);
  write(KEYS.emails(email.fromPaymentId), [email, ...sent]);
}

export function getEmails(paymentId: string): PhonexEmail[] {
  return read<PhonexEmail[]>(KEYS.emails(paymentId), []);
}

export function markRead(emailId: string, paymentId: string): void {
  const emails = read<PhonexEmail[]>(KEYS.emails(paymentId), []);
  write(
    KEYS.emails(paymentId),
    emails.map((e) => (e.id === emailId ? { ...e, isRead: true } : e)),
  );
}

// ── Contacts ──────────────────────────────────────────────────────────────────
export function addContact(paymentId: string, contact: PhonexContact): void {
  const contacts = read<PhonexContact[]>(KEYS.contacts(paymentId), []);
  const filtered = contacts.filter((c) => c.id !== contact.id);
  write(KEYS.contacts(paymentId), [...filtered, contact]);
}

export function getContacts(paymentId: string): PhonexContact[] {
  return read<PhonexContact[]>(KEYS.contacts(paymentId), []);
}

export function deleteContact(paymentId: string, contactId: string): void {
  const contacts = read<PhonexContact[]>(KEYS.contacts(paymentId), []);
  write(
    KEYS.contacts(paymentId),
    contacts.filter((c) => c.id !== contactId),
  );
}

// ── Messages ──────────────────────────────────────────────────────────────────
export function sendMessage(msg: PhonexMessage): void {
  const key = KEYS.messages(msg.fromPaymentId, msg.toPaymentId);
  const msgs = read<PhonexMessage[]>(key, []);
  write(key, [...msgs, msg]);
  cloudSync.syncMessages(key);
}

export function getConversation(
  paymentId1: string,
  paymentId2: string,
): PhonexMessage[] {
  const key = KEYS.messages(paymentId1, paymentId2);
  return read<PhonexMessage[]>(key, []);
}

export function getConversations(
  paymentId: string,
): { partner: string; lastMsg: PhonexMessage }[] {
  const results: { partner: string; lastMsg: PhonexMessage }[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith("phonex_db_msgs_") && k.includes(paymentId)) {
        const parts = k.replace("phonex_db_msgs_", "").split("_");
        const partner = parts.find((p) => p !== paymentId);
        if (partner) {
          const msgs = read<PhonexMessage[]>(k, []);
          if (msgs.length > 0) {
            results.push({ partner, lastMsg: msgs[msgs.length - 1] });
          }
        }
      }
    }
  } catch {}
  return results.sort((a, b) => b.lastMsg.timestamp - a.lastMsg.timestamp);
}

// ── Utilities ─────────────────────────────────────────────────────────────────
export function generatePaymentId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "PXP-";
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}
