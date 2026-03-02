import { FolderOpen, CheckCircle, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function StatsGrid() {
    const currentWorkspace = useSelector((state) => state?.workspace?.currentWorkspace || null);

    const [stats, setStats] = useState({
        totalProjects: 0,
        completedProjects: 0,
        myTasks: 0,
        overdueIssues: 0,
    });

    useEffect(() => {
        if (currentWorkspace) {
            const allTasks = currentWorkspace.projects.flatMap((p) => p.tasks);
            const now = new Date();
            setStats({
                totalProjects: currentWorkspace.projects.length,
                completedProjects: currentWorkspace.projects.filter((p) => p.status === "COMPLETED").length,
                myTasks: allTasks.filter((t) => t.assignee?.email === currentWorkspace.owner?.email).length,
                overdueIssues: allTasks.filter((t) => t.due_date && new Date(t.due_date) < now && t.status !== "DONE").length,
            });
        }
    }, [currentWorkspace]);

    const statCards = [
        {
            icon: FolderOpen,
            title: "Total Projects",
            value: stats.totalProjects,
            subtitle: `in ${currentWorkspace?.name || "workspace"}`,
            iconBg: "bg-blue-500/10 dark:bg-blue-500/15",
            iconColor: "text-blue-600 dark:text-blue-400",
            borderAccent: "border-t-blue-500",
        },
        {
            icon: CheckCircle,
            title: "Completed",
            value: stats.completedProjects,
            subtitle: `of ${stats.totalProjects} total`,
            iconBg: "bg-emerald-500/10 dark:bg-emerald-500/15",
            iconColor: "text-emerald-600 dark:text-emerald-400",
            borderAccent: "border-t-emerald-500",
        },
        {
            icon: Clock,
            title: "My Tasks",
            value: stats.myTasks,
            subtitle: "assigned to me",
            iconBg: "bg-violet-500/10 dark:bg-violet-500/15",
            iconColor: "text-violet-600 dark:text-violet-400",
            borderAccent: "border-t-violet-500",
        },
        {
            icon: AlertTriangle,
            title: "Overdue",
            value: stats.overdueIssues,
            subtitle: "need attention",
            iconBg: "bg-amber-500/10 dark:bg-amber-500/15",
            iconColor: "text-amber-600 dark:text-amber-400",
            borderAccent: "border-t-amber-500",
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map(({ icon: Icon, title, value, subtitle, iconBg, iconColor, borderAccent }, i) => (
                <div
                    key={i}
                    className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 border-t-2 ${borderAccent} rounded-xl p-5 hover:shadow-md transition-shadow duration-200 animate-fade-in-up stagger-${i + 1}`}
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1 truncate">{title}</p>
                            <p className="text-3xl font-bold text-zinc-800 dark:text-white tabular-nums">{value}</p>
                            {subtitle && (
                                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 truncate">{subtitle}</p>
                            )}
                        </div>
                        <div className={`p-2.5 rounded-xl ${iconBg} flex-shrink-0`}>
                            <Icon size={18} className={iconColor} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
