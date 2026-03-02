import { useEffect, useState } from "react";
import { GitCommit, MessageSquare, Clock, Bug, Zap, Square, Activity } from "lucide-react";
import { format } from "date-fns";
import { useSelector } from "react-redux";

const typeIcons = {
    BUG: { icon: Bug, color: "text-red-500 dark:text-red-400", bg: "bg-red-100 dark:bg-red-500/15" },
    FEATURE: { icon: Zap, color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-500/15" },
    TASK: { icon: Square, color: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-500/15" },
    IMPROVEMENT: { icon: MessageSquare, color: "text-amber-500 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-500/15" },
    OTHER: { icon: GitCommit, color: "text-purple-500 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-500/15" },
};

const statusLabels = {
    TODO: { label: "To Do", cls: "bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300" },
    IN_PROGRESS: { label: "In Progress", cls: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400" },
    DONE: { label: "Done", cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400" },
};

const safeFormat = (value, fmt = "MMM d, h:mm a") => {
    try {
        if (!value) return "";
        const d = new Date(value);
        if (isNaN(d.getTime())) return "";
        return format(d, fmt);
    } catch { return ""; }
};

const RecentActivity = () => {
    const [tasks, setTasks] = useState([]);
    const { currentWorkspace } = useSelector((state) => state.workspace);

    useEffect(() => {
        if (!currentWorkspace) return;
        const allTasks = currentWorkspace.projects.flatMap((p) => p.tasks);
        setTasks(allTasks.slice(0, 10));
    }, [currentWorkspace]);

    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200">
            <div className="border-b border-zinc-200 dark:border-zinc-800 px-5 py-4 flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Recent Activity</h2>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{tasks.length} recent item{tasks.length !== 1 ? 's' : ''}</p>
                </div>
                <Activity className="size-4 text-zinc-400 dark:text-zinc-500" />
            </div>

            {tasks.length === 0 ? (
                <div className="p-12 text-center">
                    <div className="size-16 mx-auto mb-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center">
                        <Clock className="size-8 text-zinc-400 dark:text-zinc-500" />
                    </div>
                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">No recent activity</p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">Tasks you create will appear here</p>
                </div>
            ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {tasks.map((task) => {
                        const typeInfo = typeIcons[task.type] || typeIcons.OTHER;
                        const statusInfo = statusLabels[task.status] || { label: task.status, cls: "bg-slate-100 text-slate-700" };
                        const TypeIcon = typeInfo.icon;
                        const timeStr = safeFormat(task.updatedAt);

                        return (
                            <div key={task.id} className="px-5 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg ${typeInfo.bg} flex-shrink-0 mt-0.5`}>
                                        <TypeIcon className={`size-3.5 ${typeInfo.color}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h4 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                                                {task.title}
                                            </h4>
                                            <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 font-medium ${statusInfo.cls}`}>
                                                {statusInfo.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500">
                                            <span className="capitalize">{task.type?.toLowerCase()}</span>
                                            {task.assignee && (
                                                <span className="flex items-center gap-1">
                                                    <div className="size-3.5 rounded-full bg-zinc-300 dark:bg-zinc-600 flex items-center justify-center text-[8px] font-bold">
                                                        {task.assignee.name?.[0]?.toUpperCase()}
                                                    </div>
                                                    {task.assignee.name}
                                                </span>
                                            )}
                                            {timeStr && <span>{timeStr}</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default RecentActivity;
