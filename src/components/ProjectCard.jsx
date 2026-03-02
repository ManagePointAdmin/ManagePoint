import { Link } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, Users, ArrowRight } from "lucide-react";

const statusColors = {
    PLANNING: "bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300",
    ACTIVE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400",
    ON_HOLD: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400",
    COMPLETED: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400",
    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400",
};

const priorityDot = {
    LOW: "bg-slate-400",
    MEDIUM: "bg-amber-400",
    HIGH: "bg-emerald-500",
};

const progressColor = (p) => {
    if (p >= 66) return "from-emerald-400 to-emerald-500";
    if (p >= 33) return "from-amber-400 to-orange-400";
    return "from-blue-400 to-blue-500";
};

const safeFormat = (val, fmt) => {
    try {
        if (!val) return null;
        const d = new Date(val);
        if (isNaN(d.getTime())) return null;
        return format(d, fmt);
    } catch { return null; }
};

const ProjectCard = ({ project }) => {
    const progress = project.progress || 0;
    const endDate = safeFormat(project.end_date, "MMM d, yyyy");
    const taskCount = project.tasks?.length ?? 0;
    const doneCount = project.tasks?.filter((t) => t.status === "DONE").length ?? 0;

    return (
        <Link
            to={`/dashboard/projectsDetail?id=${project.id}&tab=tasks`}
            className="flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-zinc-200/60 dark:hover:shadow-black/30 hover:-translate-y-0.5 transition-all duration-200 group"
        >
            {/* Top accent bar */}
            <div className={`h-1 w-full bg-gradient-to-r ${progressColor(progress)}`} />

            <div className="p-5 flex flex-col flex-1">
                {/* Header */}
                <div className="flex items-start justify-between mb-3 gap-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
                            {project.name}
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                            {project.description || "No description"}
                        </p>
                    </div>
                </div>

                {/* Status + Priority row */}
                <div className="flex items-center justify-between mb-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
                        {project.status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                        <span className={`size-2 rounded-full ${priorityDot[project.priority] || "bg-zinc-400"}`} />
                        <span className="capitalize">{project.priority?.toLowerCase()} priority</span>
                    </div>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-4 mb-4 text-xs text-zinc-400 dark:text-zinc-500">
                    {taskCount > 0 && (
                        <span className="flex items-center gap-1">
                            <span className="font-medium text-zinc-600 dark:text-zinc-300">{doneCount}/{taskCount}</span> tasks done
                        </span>
                    )}
                    {project.members?.length > 0 && (
                        <span className="flex items-center gap-1">
                            <Users className="size-3" />
                            {project.members.length}
                        </span>
                    )}
                    {endDate && (
                        <span className="flex items-center gap-1">
                            <CalendarIcon className="size-3" />
                            {endDate}
                        </span>
                    )}
                </div>

                {/* Progress */}
                <div className="mt-auto space-y-1.5">
                    <div className="flex justify-between text-xs text-zinc-400 dark:text-zinc-500">
                        <span>Progress</span>
                        <span className="font-medium text-zinc-600 dark:text-zinc-400">{progress}%</span>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5">
                        <div
                            className={`h-1.5 rounded-full bg-gradient-to-r ${progressColor(progress)} transition-all duration-500`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Footer action */}
            <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">View project</span>
                <ArrowRight className="size-3.5 text-blue-600 dark:text-blue-400" />
            </div>
        </Link>
    );
};

export default ProjectCard;
