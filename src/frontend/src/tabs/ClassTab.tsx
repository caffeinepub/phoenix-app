import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Users } from "lucide-react";
import { motion } from "motion/react";
import { useGetClassGroups } from "../hooks/useQueries";

const SAMPLE_GROUPS = [
  {
    name: "Advanced Mathematics",
    members: ["Jason", "Roy", "Alex", "Maria", "Sam"],
    subject: "Math",
  },
  {
    name: "Web Development Bootcamp",
    members: ["Alex", "Maria", "Chris"],
    subject: "Tech",
  },
  {
    name: "Creative Writing Circle",
    members: ["Maria", "Jordan", "Taylor", "Robin"],
    subject: "English",
  },
  {
    name: "Physics Study Hall",
    members: ["Roy", "Sam", "Casey"],
    subject: "Science",
  },
];

const SUBJECT_COLORS: Record<string, string> = {
  Math: "bg-primary/20 text-primary",
  Tech: "bg-accent text-accent-foreground",
  English: "bg-secondary text-secondary-foreground",
  Science: "bg-muted text-muted-foreground",
};

export default function ClassTab() {
  const { data: backendGroups } = useGetClassGroups();

  const groups =
    backendGroups && backendGroups.length > 0
      ? backendGroups.map((g) => ({ ...g, subject: "Class" }))
      : SAMPLE_GROUPS;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 py-4 flex justify-between items-center">
        <div>
          <h2 className="font-display font-bold text-lg text-foreground">
            Class Groups
          </h2>
          <p className="text-sm text-muted-foreground">
            {groups.length} active groups
          </p>
        </div>
        <button
          type="button"
          data-ocid="class.primary_button"
          className="w-9 h-9 rounded-full phoenix-gradient flex items-center justify-center shadow-md"
        >
          <Plus className="w-5 h-5 text-primary-foreground" />
        </button>
      </div>

      <div className="px-4 pb-6 flex flex-col gap-3" data-ocid="class.list">
        {groups.map((group, idx) => (
          <motion.div
            key={group.name}
            data-ocid={`class.item.${idx + 1}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.35 }}
            className="bg-card rounded-2xl p-4 border border-border shadow-xs hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl phoenix-gradient flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display font-semibold text-foreground text-sm leading-tight">
                    {group.name}
                  </h3>
                  <Badge
                    className={`text-xs px-2 py-0.5 rounded-full border-0 flex-shrink-0 ${SUBJECT_COLORS[group.subject] || "bg-muted text-muted-foreground"}`}
                  >
                    {group.subject}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <Users className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {group.members.length} members
                  </span>
                </div>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {group.members.slice(0, 4).map((m) => (
                    <span
                      key={m}
                      className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full"
                    >
                      {m}
                    </span>
                  ))}
                  {group.members.length > 4 && (
                    <span className="text-xs text-muted-foreground">
                      +{group.members.length - 4}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
