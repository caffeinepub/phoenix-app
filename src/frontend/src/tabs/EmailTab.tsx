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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { sendEmail as dbSendEmail, getContacts } from "@/services/PhonexDB";
import {
  ChevronDown,
  ChevronUp,
  Inbox,
  Paperclip,
  Plus,
  Star,
  Users,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";

const SAMPLE_CONTACTS = [
  {
    id: "1",
    name: "James Okafor",
    initials: "JO",
    color: "bg-blue-500",
    phonexId: "PXP-AB12CD34",
    email: "james.okafor@phonex.app",
  },
  {
    id: "2",
    name: "Sara Müller",
    initials: "SM",
    color: "bg-rose-500",
    phonexId: "PXP-EF56GH78",
    email: "sara.muller@phonex.app",
  },
  {
    id: "3",
    name: "Liu Wei",
    initials: "LW",
    color: "bg-violet-500",
    phonexId: "PXP-IJ90KL12",
    email: "liu.wei@phonex.app",
  },
  {
    id: "4",
    name: "Amina Hassan",
    initials: "AH",
    color: "bg-emerald-500",
    phonexId: "PXP-MN34OP56",
    email: "amina.hassan@phonex.app",
  },
  {
    id: "5",
    name: "Carlos Mendez",
    initials: "CM",
    color: "bg-orange-500",
    phonexId: "PXP-QR78ST90",
    email: "carlos.mendez@phonex.app",
  },
  {
    id: "6",
    name: "Yuki Tanaka",
    initials: "YT",
    color: "bg-teal-500",
    phonexId: "PXP-UV12WX34",
    email: "yuki.tanaka@phonex.app",
  },
];

const SAMPLE_EMAILS = [
  {
    from: "Dr. Williams",
    subject: "Assignment #3 Feedback",
    preview:
      "Great work on the analysis section. A few points to address before final submission...",
    time: "10:24 AM",
    unread: true,
    starred: false,
  },
  {
    from: "Campus Events",
    subject: "Tech Expo 2026 — Register Now",
    preview:
      "Don't miss out! The annual Tech Expo is happening next Friday. Spots are limited...",
    time: "Yesterday",
    unread: true,
    starred: true,
  },
  {
    from: "Library System",
    subject: "Book Return Reminder",
    preview:
      "Your borrowed items are due in 3 days. Renew online to avoid late fees.",
    time: "Mar 8",
    unread: false,
    starred: false,
  },
  {
    from: "Job Portal",
    subject: "New job match: Frontend Developer",
    preview:
      "Based on your profile, we found 3 new jobs that match your skills and preferences.",
    time: "Mar 7",
    unread: false,
    starred: true,
  },
  {
    from: "Study Group",
    subject: "Meeting rescheduled to Friday",
    preview:
      "Hi all, due to the exam schedule change, we're moving our weekly meeting to Friday at 4pm.",
    time: "Mar 6",
    unread: false,
    starred: false,
  },
];

export default function EmailTab() {
  const { currentUser } = useAuth();
  const [composeOpen, setComposeOpen] = useState(false);
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [attachments, setAttachments] = useState<
    { id: number; name: string }[]
  >([]);
  const attachIdRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Contacts state
  const [headerContactsOpen, setHeaderContactsOpen] = useState(false);
  const [composeContactsOpen, setComposeContactsOpen] = useState(false);

  function handleSend() {
    if (currentUser?.paymentId) {
      dbSendEmail({
        id: `email-${Date.now()}`,
        fromPaymentId: currentUser.paymentId,
        fromDisplay: currentUser.displayName || currentUser.email,
        toAddress: to,
        ccList: cc
          ? cc
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        bccList: bcc
          ? bcc
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        subject,
        body,
        attachmentNames: attachments.map((a) => a.name),
        timestamp: Date.now(),
        isRead: true,
      });
    }
    setComposeOpen(false);
    resetForm();
  }

  function handleCancel() {
    setComposeOpen(false);
    resetForm();
  }

  function resetForm() {
    setTo("");
    setCc("");
    setBcc("");
    setSubject("");
    setBody("");
    setShowCc(false);
    setShowBcc(false);
    setAttachments([]);
    attachIdRef.current = 0;
  }

  function handleAttachmentClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files).map((f) => {
      attachIdRef.current += 1;
      return { id: attachIdRef.current, name: f.name };
    });
    setAttachments((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  }

  function removeAttachment(id: number) {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }

  // Select contact from header contacts sheet → pre-fill To and open compose
  function handleHeaderContactSelect(email: string) {
    setTo(email);
    setHeaderContactsOpen(false);
    setComposeOpen(true);
  }

  // Select contact from compose contacts dialog → fill To field
  function handleComposeContactSelect(email: string) {
    setTo(email);
    setComposeContactsOpen(false);
  }

  return (
    <div className="flex flex-col h-full relative">
      <div className="px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Inbox className="w-5 h-5 text-primary" />
          <h2 className="font-display font-bold text-lg text-foreground">
            Inbox
          </h2>
          <Badge className="bg-primary/20 text-primary border-0 text-xs">
            {SAMPLE_EMAILS.filter((e) => e.unread).length} new
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-ocid="email.contacts.open_modal_button"
            onClick={() => setHeaderContactsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors"
          >
            <Users className="w-4 h-4" />
            Contacts
          </button>
          <button
            type="button"
            data-ocid="email.primary_button"
            onClick={() => setComposeOpen(true)}
            className="w-9 h-9 rounded-full phoenix-gradient flex items-center justify-center shadow-md hover:opacity-90 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>
      </div>

      {/* Add Email row - Feels style */}
      <div className="flex gap-3 overflow-x-auto px-4 pb-3 pt-1 scrollbar-hide border-b border-border/50">
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            data-ocid="email.add.button"
            onClick={() => setComposeOpen(true)}
            className="w-14 h-14 rounded-full border-2 border-dashed border-primary/50 bg-primary/5 flex items-center justify-center hover:bg-primary/10 transition-colors"
          >
            <Plus className="w-6 h-6 text-primary" />
          </button>
          <span className="text-[10px] text-muted-foreground">New Email</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" data-ocid="email.list">
        {SAMPLE_EMAILS.map((email, idx) => (
          <motion.div
            key={email.subject}
            data-ocid={`email.item.${idx + 1}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06, duration: 0.3 }}
            className={`flex items-start gap-3 px-4 py-3.5 border-b border-border/50 last:border-0 cursor-pointer hover:bg-accent/40 transition-colors ${
              email.unread ? "bg-primary/5" : ""
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-10 h-10 rounded-full phoenix-gradient flex items-center justify-center">
                <span className="font-display font-bold text-primary-foreground text-sm">
                  {email.from.charAt(0)}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <span
                  className={`font-display text-sm ${
                    email.unread
                      ? "font-bold text-foreground"
                      : "font-medium text-foreground/80"
                  }`}
                >
                  {email.from}
                </span>
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  {email.starred && (
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {email.time}
                  </span>
                </div>
              </div>
              <p
                className={`text-sm mt-0.5 ${
                  email.unread
                    ? "font-semibold text-foreground"
                    : "text-foreground/80"
                }`}
              >
                {email.subject}
              </p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {email.preview}
              </p>
            </div>
            {email.unread && (
              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
            )}
          </motion.div>
        ))}
      </div>

      {/* Compose Sheet */}
      <Sheet open={composeOpen} onOpenChange={setComposeOpen}>
        <SheetContent
          side="bottom"
          data-ocid="email.dialog"
          className="rounded-t-3xl max-h-[70vh] overflow-y-auto px-3 pb-4"
        >
          <SheetHeader className="mb-2">
            <SheetTitle className="font-display font-bold text-foreground">
              New Email
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-2 py-1">
            {/* To field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-to" className="text-sm font-medium">
                  To
                </Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    data-ocid="email.compose.contacts.open_modal_button"
                    onClick={() => setComposeContactsOpen(true)}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Users className="w-3.5 h-3.5" />
                    Contacts
                  </button>
                  <button
                    type="button"
                    data-ocid="email.cc.toggle"
                    onClick={() => setShowCc((v) => !v)}
                    className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                      showCc
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    CC{" "}
                    {showCc ? (
                      <ChevronUp className="inline w-3 h-3" />
                    ) : (
                      <ChevronDown className="inline w-3 h-3" />
                    )}
                  </button>
                  <button
                    type="button"
                    data-ocid="email.bcc.toggle"
                    onClick={() => setShowBcc((v) => !v)}
                    className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                      showBcc
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    BCC{" "}
                    {showBcc ? (
                      <ChevronUp className="inline w-3 h-3" />
                    ) : (
                      <ChevronDown className="inline w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
              <Input
                id="email-to"
                data-ocid="email.to_input"
                placeholder="recipient@example.com"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>

            {/* CC field */}
            {showCc && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col gap-1.5"
              >
                <Label
                  htmlFor="email-cc"
                  className="text-sm font-medium text-muted-foreground"
                >
                  CC
                </Label>
                <Input
                  id="email-cc"
                  data-ocid="email.cc_input"
                  placeholder="cc@example.com"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                />
              </motion.div>
            )}

            {/* BCC field */}
            {showBcc && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col gap-1.5"
              >
                <Label
                  htmlFor="email-bcc"
                  className="text-sm font-medium text-muted-foreground"
                >
                  BCC
                </Label>
                <Input
                  id="email-bcc"
                  data-ocid="email.bcc_input"
                  placeholder="bcc@example.com"
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                />
              </motion.div>
            )}

            {/* Subject */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email-subject" className="text-sm font-medium">
                Subject
              </Label>
              <Input
                id="email-subject"
                data-ocid="email.subject_input"
                placeholder="Email subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            {/* Body */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email-body" className="text-sm font-medium">
                Message
              </Label>
              <Textarea
                id="email-body"
                data-ocid="email.body_textarea"
                placeholder="Write your message..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="min-h-[72px] resize-none"
              />
            </div>

            {/* Attachment button */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  data-ocid="email.upload_button"
                  onClick={handleAttachmentClick}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all text-sm text-muted-foreground hover:text-primary"
                >
                  <Paperclip className="w-4 h-4" />
                  Attach files
                </button>
                {attachments.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {attachments.length} file{attachments.length > 1 ? "s" : ""}{" "}
                    attached
                  </span>
                )}
              </div>

              {/* Attachment list */}
              {attachments.length > 0 && (
                <div
                  className="flex flex-col gap-1.5"
                  data-ocid="email.attachments.list"
                >
                  {attachments.map((att, idx) => (
                    <div
                      key={att.id}
                      data-ocid={`email.attachments.item.${idx + 1}`}
                      className="flex items-center justify-between bg-muted/60 rounded-lg px-3 py-1.5"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Paperclip className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs text-foreground truncate">
                          {att.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        data-ocid={`email.attachments.delete_button.${idx + 1}`}
                        onClick={() => removeAttachment(att.id)}
                        className="w-5 h-5 rounded-full hover:bg-destructive/20 flex items-center justify-center flex-shrink-0 ml-2 transition-colors"
                      >
                        <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end mt-2">
            <Button
              variant="outline"
              data-ocid="email.cancel_button"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              data-ocid="email.send.submit_button"
              onClick={handleSend}
              disabled={!to.trim() || !subject.trim()}
              className="phoenix-gradient text-primary-foreground border-0 hover:opacity-90"
            >
              Send
              {attachments.length > 0
                ? ` (${attachments.length} file${attachments.length > 1 ? "s" : ""})`
                : ""}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Header Contacts Sheet — tap contact to pre-fill compose and open it */}
      <Sheet open={headerContactsOpen} onOpenChange={setHeaderContactsOpen}>
        <SheetContent
          side="bottom"
          data-ocid="email.contacts.dialog"
          className="rounded-t-3xl max-h-[75vh] overflow-y-auto px-4 pb-6"
        >
          <SheetHeader className="mb-3">
            <SheetTitle className="font-display font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Contacts
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-2">
            {SAMPLE_CONTACTS.map((contact, idx) => (
              <button
                key={contact.id}
                type="button"
                data-ocid={`email.contacts.item.${idx + 1}`}
                onClick={() => handleHeaderContactSelect(contact.email)}
                className="bg-card rounded-2xl border border-border px-4 py-3 flex items-center gap-3 hover:bg-accent/50 transition-colors text-left w-full"
              >
                <div
                  className={`w-10 h-10 rounded-full ${contact.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
                >
                  {contact.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-sm text-foreground">
                    {contact.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {contact.email}
                  </p>
                </div>
                <Badge className="bg-primary/10 text-primary border-0 text-xs flex-shrink-0">
                  Email
                </Badge>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Compose Contacts Dialog — fills To field */}
      <Dialog open={composeContactsOpen} onOpenChange={setComposeContactsOpen}>
        <DialogContent
          className="sm:max-w-sm"
          data-ocid="email.compose.contacts.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Select Contact
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-1 py-1 max-h-64 overflow-y-auto">
            {SAMPLE_CONTACTS.map((contact, idx) => (
              <button
                key={contact.id}
                type="button"
                data-ocid={`email.compose.contacts.item.${idx + 1}`}
                onClick={() => handleComposeContactSelect(contact.email)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent transition-colors text-left w-full"
              >
                <div
                  className={`w-8 h-8 rounded-full ${contact.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                >
                  {contact.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground">
                    {contact.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {contact.email}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
