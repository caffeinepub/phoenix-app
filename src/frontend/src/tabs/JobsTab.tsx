import { Badge } from "@/components/ui/badge";
import { Briefcase, Clock, DollarSign, MapPin, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useGetJobs } from "../hooks/useQueries";

const SAMPLE_JOBS = [
  {
    title: "Frontend Developer Intern",
    company: "TechNova Labs",
    description:
      "Build beautiful web interfaces using React, TypeScript, and modern CSS. Great learning opportunity!",
    location: "Remote",
    salary: "$25/hr",
    type: "Part-time",
    posted: "2 days ago",
  },
  {
    title: "Data Analyst",
    company: "DataSphere Co.",
    description:
      "Analyze large datasets and create actionable insights. Python and SQL skills required.",
    location: "New York, NY",
    salary: "$60k/yr",
    type: "Full-time",
    posted: "1 week ago",
  },
  {
    title: "UX Research Assistant",
    company: "DesignMind Studio",
    description:
      "Conduct user interviews and usability tests. Help shape the future of our product experience.",
    location: "San Francisco, CA",
    salary: "$20/hr",
    type: "Contract",
    posted: "3 days ago",
  },
  {
    title: "Backend Engineer",
    company: "CloudStack Inc.",
    description:
      "Design and maintain scalable microservices. Experience with Node.js or Go preferred.",
    location: "Austin, TX",
    salary: "$90k/yr",
    type: "Full-time",
    posted: "Today",
  },
];

const TYPE_COLORS: Record<string, string> = {
  "Full-time": "bg-primary/15 text-primary border-0",
  "Part-time": "bg-secondary text-secondary-foreground border-0",
  Contract: "bg-accent text-accent-foreground border-0",
};

export default function JobsTab() {
  const { data: backendJobs } = useGetJobs();

  const jobs =
    backendJobs && backendJobs.length > 0
      ? backendJobs.map((j) => ({
          ...j,
          location: "Remote",
          salary: "Competitive",
          type: "Full-time",
          posted: "Recently",
        }))
      : SAMPLE_JOBS;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 py-4 flex justify-between items-center">
        <div>
          <h2 className="font-display font-bold text-lg text-foreground">
            Job Listings
          </h2>
          <p className="text-sm text-muted-foreground">
            {jobs.length} opportunities
          </p>
        </div>
        <button
          type="button"
          data-ocid="jobs.primary_button"
          className="w-9 h-9 rounded-full phoenix-gradient flex items-center justify-center shadow-md"
        >
          <Plus className="w-5 h-5 text-primary-foreground" />
        </button>
      </div>

      <div className="px-4 pb-6 flex flex-col gap-3" data-ocid="jobs.list">
        {jobs.map((job, idx) => (
          <motion.div
            key={job.title}
            data-ocid={`jobs.item.${idx + 1}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.07, duration: 0.35 }}
            className="bg-card rounded-2xl p-4 border border-border shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl phoenix-gradient flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground text-sm leading-tight group-hover:text-primary transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {job.company}
                  </p>
                </div>
              </div>
              <Badge
                className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${TYPE_COLORS[job.type] || "bg-muted text-muted-foreground border-0"}`}
              >
                {job.type}
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
              {job.description}
            </p>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                <span>{job.salary}</span>
              </div>
              <div className="flex items-center gap-1 ml-auto">
                <Clock className="w-3.5 h-3.5" />
                <span>{job.posted}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
