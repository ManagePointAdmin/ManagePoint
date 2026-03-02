import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, UsersIcon, FolderOpen } from "lucide-react";
import { format } from "date-fns";
import { useSelector } from "react-redux";
import CreateProjectDialog from "./CreateProjectDialog";

const statusColors = {
    PLANNING: "bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300",
    ACTIVE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400",
    ON_HOLD: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400",
    COMPLETED: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400",
    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400",
};

const progressColors = {
    low: "from-blue-400 to-blue-500",
    medium: "from-amber-400 to-orange-500",
    high: "from-emerald-400 to-emerald-500",
};

const safeFormat = (value, fmt = "MMM d, yyyy") => {
    try {
        if (!value) return null;
        const d = new Date(value);
        if (isNaN(d.getTime())) return null;
        return format(d, fmt);
    } catch { return null; }
};

const ProjectOverview = () => {
    const currentWorkspace = useSelector((state) => state?.workspace?.currentWorkspace || null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        setProjects(currentWorkspace?.projects || []);
    }, [currentWorkspace]);

    if (!currentWorkspace) return null;

    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200">
            {/* Header */}
            <div className="border-b border-zinc-200 dark:border-zinc-800 px-5 py-4 flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Project Overview</h2>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
                </div>
                <Link
                    to="/dashboard/projects"
                    className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition"
                >
                    View all <ArrowRight className="size-3.5" />
                </Link>
            </div>

            {/* Body */}
            {projects.length === 0 ? (
                <div className="p-12 text-center">
                    <div className="size-16 mx-auto mb-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center">
                        <FolderOpen className="size-8 text-zinc-400 dark:text-zinc-500" />
                    </div>
                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">No projects yet</p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-4">Create your first project to get started</p>
                    <button
                        onClick={() => setIsDialogOpen(true)}
                        className="px-4 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25 transition"
                    >
                        Create Project
                    </button>
                    <CreateProjectDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
                </div>
            ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {projects.slice(0, 5).map((project) => {
                        const progress = project.progress || 0;
                        const pColor = progress < 33 ? "low" : progress < 66 ? "medium" : "high";
                        const formatted = safeFormat(project.end_date);

                        return (
                            <Link
                                key={project.id}
                                to={`/dashboard/projectsDetail?id=${project.id}&tab=tasks`}
                                className="block px-5 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
                            >
                                <div className="flex items-start justify-between mb-2 gap-3">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                            {project.name}
                                        </h3>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                                            {project.description || "No description"}
                                        </p>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusColors[project.status]}`}>
                                        {project.status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 mb-2.5">
                                    <div className="flex items-center gap-3">
                                        {project.members?.length > 0 && (
                                            <span className="flex items-center gap-1">
                                                <UsersIcon className="size-3" />
                                                {project.members.length}
                                            </span>
                                        )}
                                        {formatted && (
                                            <span className="flex items-center gap-1">
                                                <Calendar className="size-3" />
                                                {formatted}
                                            </span>
                                        )}
                                    </div>
                                    <span className="font-medium text-zinc-600 dark:text-zinc-400">{progress}%</span>
                                </div>

                                {/* Progress bar */}
                                <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5">
                                    <div
                                        className={`h-1.5 rounded-full bg-gradient-to-r ${progressColors[pColor]} transition-all duration-500`}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ProjectOverview;
