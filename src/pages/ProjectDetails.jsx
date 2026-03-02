import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    ArrowLeftIcon, PlusIcon, SettingsIcon, BarChart3Icon,
    CalendarIcon, FileStackIcon, CheckCircle2, Clock, Users, Hash
} from "lucide-react";
import ProjectAnalytics from "../components/ProjectAnalytics";
import ProjectSettings from "../components/ProjectSettings";
import CreateTaskDialog from "../components/CreateTaskDialog";
import ProjectCalendar from "../components/ProjectCalendar";
import ProjectTasks from "../components/ProjectTasks";

const statusColors = {
    PLANNING: "bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300",
    ACTIVE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400",
    ON_HOLD: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400",
    COMPLETED: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400",
    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400",
};

const TABS = [
    { key: "tasks", label: "Tasks", icon: FileStackIcon },
    { key: "calendar", label: "Calendar", icon: CalendarIcon },
    { key: "analytics", label: "Analytics", icon: BarChart3Icon },
    { key: "settings", label: "Settings", icon: SettingsIcon },
];

export default function ProjectDetail() {
    const [searchParams, setSearchParams] = useSearchParams();
    const tab = searchParams.get("tab");
    const id = searchParams.get("id");

    const navigate = useNavigate();
    const projects = useSelector((state) => state?.workspace?.currentWorkspace?.projects || []);

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [showCreateTask, setShowCreateTask] = useState(false);
    const [activeTab, setActiveTab] = useState(tab || "tasks");

    useEffect(() => { if (tab) setActiveTab(tab); }, [tab]);

    useEffect(() => {
        if (projects.length > 0) {
            const proj = projects.find((p) => p.id === id);
            setProject(proj);
            setTasks(proj?.tasks || []);
        }
    }, [id, projects]);

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
                <div className="size-20 mb-6 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center">
                    <FileStackIcon className="size-10 text-zinc-400 dark:text-zinc-500" />
                </div>
                <p className="text-xl font-semibold text-zinc-700 dark:text-zinc-200 mb-2">Project not found</p>
                <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-6">The project you are looking for does not exist.</p>
                <button
                    onClick={() => navigate("/dashboard/projects")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-sm font-medium transition"
                >
                    <ArrowLeftIcon className="size-4" /> Back to Projects
                </button>
            </div>
        );
    }

    const doneTasks = tasks.filter((t) => t.status === "DONE").length;
    const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS").length;
    const teamCount = project.members?.length || 0;

    const infoCards = [
        { label: "Total Tasks", value: tasks.length, icon: Hash, color: "text-zinc-700 dark:text-white", iconBg: "bg-zinc-100 dark:bg-zinc-800" },
        { label: "Completed", value: doneTasks, icon: CheckCircle2, color: "text-emerald-700 dark:text-emerald-400", iconBg: "bg-emerald-100 dark:bg-emerald-500/15" },
        { label: "In Progress", value: inProgressTasks, icon: Clock, color: "text-amber-700 dark:text-amber-400", iconBg: "bg-amber-100 dark:bg-amber-500/15" },
        { label: "Team Members", value: teamCount, icon: Users, color: "text-blue-700 dark:text-blue-400", iconBg: "bg-blue-100 dark:bg-blue-500/15" },
    ];

    return (
        <div className="space-y-6 max-w-6xl mx-auto animate-fade-in-up">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/dashboard/projects")}
                        className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition"
                    >
                        <ArrowLeftIcon className="size-4" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h1 className="text-xl font-bold text-zinc-900 dark:text-white">{project.name}</h1>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
                                {project.status.replace("_", " ")}
                            </span>
                        </div>
                        {project.description && (
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">{project.description}</p>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => setShowCreateTask(true)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0 flex-shrink-0"
                >
                    <PlusIcon className="size-4" /> New Task
                </button>
            </div>

            {/* ── Info Cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {infoCards.map((card, idx) => (
                    <div key={idx} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${card.iconBg} flex-shrink-0`}>
                            <card.icon className={`size-4 ${card.color}`} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{card.label}</p>
                            <p className={`text-2xl font-bold tabular-nums ${card.color}`}>{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Tab Bar ── */}
            <div>
                <div className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800">
                    {TABS.map((tabItem) => (
                        <button
                            key={tabItem.key}
                            onClick={() => { setActiveTab(tabItem.key); setSearchParams({ id, tab: tabItem.key }); }}
                            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${activeTab === tabItem.key
                                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                                    : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                                }`}
                        >
                            <tabItem.icon className="size-3.5" />
                            {tabItem.label}
                        </button>
                    ))}
                </div>

                <div className="mt-6">
                    {activeTab === "tasks" && <ProjectTasks tasks={tasks} />}
                    {activeTab === "analytics" && <ProjectAnalytics tasks={tasks} project={project} />}
                    {activeTab === "calendar" && <ProjectCalendar tasks={tasks} />}
                    {activeTab === "settings" && <ProjectSettings project={project} />}
                </div>
            </div>

            {showCreateTask && (
                <CreateTaskDialog showCreateTask={showCreateTask} setShowCreateTask={setShowCreateTask} projectId={id} />
            )}
        </div>
    );
}
