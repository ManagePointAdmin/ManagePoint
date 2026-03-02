import { useEffect, useState } from "react";
import { ArrowRight, Clock, AlertTriangle, User, CheckCircle2 } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const priorityBadge = {
    LOW: "bg-slate-100 text-slate-600 dark:bg-slate-700/40 dark:text-slate-400",
    MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
    HIGH: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
};

export default function TasksSummary() {
    const { currentWorkspace } = useSelector((state) => state.workspace);
    const { currentUser } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        if (currentWorkspace) {
            setTasks(currentWorkspace.projects.flatMap((p) => p.tasks));
        }
    }, [currentWorkspace]);

    const myTasks = tasks.filter((i) => i.assigneeId === currentUser?.id);
    const overdueTasks = tasks.filter((t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== "DONE");
    const inProgressTasks = tasks.filter((i) => i.status === "IN_PROGRESS");

    const summaryCards = [
        {
            title: "My Tasks",
            count: myTasks.length,
            icon: User,
            iconBg: "bg-emerald-100 dark:bg-emerald-500/15",
            iconColor: "text-emerald-600 dark:text-emerald-400",
            badgeCls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400",
            items: myTasks.slice(0, 3),
        },
        {
            title: "Overdue",
            count: overdueTasks.length,
            icon: AlertTriangle,
            iconBg: "bg-red-100 dark:bg-red-500/15",
            iconColor: "text-red-600 dark:text-red-400",
            badgeCls: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400",
            items: overdueTasks.slice(0, 3),
        },
        {
            title: "In Progress",
            count: inProgressTasks.length,
            icon: Clock,
            iconBg: "bg-blue-100 dark:bg-blue-500/15",
            iconColor: "text-blue-600 dark:text-blue-400",
            badgeCls: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400",
            items: inProgressTasks.slice(0, 3),
        },
    ];

    return (
        <div className="space-y-4">
            {summaryCards.map((card) => (
                <div
                    key={card.title}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                    {/* Card header */}
                    <div className="border-b border-zinc-100 dark:border-zinc-800 px-4 py-3 flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${card.iconBg}`}>
                            <card.icon className={`size-4 ${card.iconColor}`} />
                        </div>
                        <h3 className="text-sm font-semibold text-zinc-800 dark:text-white flex-1">{card.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${card.badgeCls}`}>
                            {card.count}
                        </span>
                    </div>

                    {/* Items */}
                    <div className="p-3 space-y-2">
                        {card.items.length === 0 ? (
                            <div className="py-4 text-center">
                                <CheckCircle2 className="size-6 mx-auto mb-1.5 text-zinc-300 dark:text-zinc-600" />
                                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                                    No {card.title.toLowerCase()}
                                </p>
                            </div>
                        ) : (
                            <>
                                {card.items.map((task) => (
                                    <button
                                        key={task.id}
                                        onClick={() => navigate(`/dashboard/taskDetails?projectId=${task.projectId}&taskId=${task.id}`)}
                                        className="w-full text-left p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                    >
                                        <h4 className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate mb-1">
                                            {task.title}
                                        </h4>
                                        <div className="flex items-center gap-1.5">
                                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${priorityBadge[task.priority] || ""}`}>
                                                {task.priority}
                                            </span>
                                            <span className="text-xs text-zinc-400 dark:text-zinc-500 capitalize">
                                                {task.type?.toLowerCase()}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                                {card.count > 3 && (
                                    <button className="flex items-center justify-center w-full text-xs text-zinc-400 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 py-1.5 transition-colors">
                                        View {card.count - 3} more <ArrowRight className="size-3 ml-1" />
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
