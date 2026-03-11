import { Badge } from "@/components/ui/badge";
import { Inbox, PenSquare, Star } from "lucide-react";
import { motion } from "motion/react";

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
  return (
    <div className="flex flex-col h-full">
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
        <button
          type="button"
          data-ocid="email.primary_button"
          className="w-9 h-9 rounded-full phoenix-gradient flex items-center justify-center shadow-md"
        >
          <PenSquare className="w-4 h-4 text-primary-foreground" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto" data-ocid="email.list">
        {SAMPLE_EMAILS.map((email, idx) => (
          <motion.div
            key={email.subject}
            data-ocid={`email.item.${idx + 1}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06, duration: 0.3 }}
            className={`flex items-start gap-3 px-4 py-3.5 border-b border-border/50 last:border-0 cursor-pointer hover:bg-accent/40 transition-colors ${email.unread ? "bg-primary/5" : ""}`}
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
                  className={`font-display text-sm ${email.unread ? "font-bold text-foreground" : "font-medium text-foreground/80"}`}
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
                className={`text-sm mt-0.5 ${email.unread ? "font-semibold text-foreground" : "text-foreground/80"}`}
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
    </div>
  );
}
