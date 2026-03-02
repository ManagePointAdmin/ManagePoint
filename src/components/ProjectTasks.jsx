import { format } from "date-fns";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { deleteTask, updateTask } from "../features/workspaceSlice";
import { Bug, CalendarIcon, GitCommit, MessageSquare, Square, Trash, XIcon, Zap, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";

const typeIcons = {
    BUG: { icon: Bug, color: "text-red-600 dark:text-red-400" },
    FEATURE: { icon: Zap, color: "text-blue-600 dark:text-blue-400" },
    TASK: { icon: Square, color: "text-green-600 dark:text-green-400" },
    IMPROVEMENT: { icon: GitCommit, color: "text-purple-600 dark:text-purple-400" },
    OTHER: { icon: MessageSquare, color: "text-amber-600 dark:text-amber-400" },
};

const priorityConfig = {
    LOW: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-400", dot: "bg-slate-400" },
    MEDIUM: { bg: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-400" },
    HIGH: { bg: "bg-emerald-100 dark:bg-emerald-900/40", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
};

const statusConfig = {
    TODO: { label: "To Do", bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-400", icon: Square },
    IN_PROGRESS: { label: "In Progress", bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-700 dark:text-blue-400", icon: Clock },
    DONE: { label: "Done", bg: "bg-emerald-100 dark:bg-emerald-900/40", text: "text-emerald-700 dark:text-emerald-400", icon: CheckCircle2 },
};

/** Safely format a date value — returns a dash if invalid */
const safeFormat = (value, fmt = "dd MMM yyyy") => {
    try {
        if (!value) return "—";
        const d = new Date(value);
        if (isNaN(d.getTime())) return "—";
        return format(d, fmt);
    } catch {
        return "—";
    }
};

const ProjectTasks = ({ tasks }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [selectedTasks, setSelectedTasks] = useState([]);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [filters, setFilters] = useState({
        status: "",
        type: "",
        priority: "",
        assignee: "",
    });

    const assigneeList = useMemo(
        () => Array.from(new Set(tasks.map((t) => t.assignee?.name).filter(Boolean))),
        [tasks]
    );

    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const { status, type, priority, assignee } = filters;
            return (
                (!status || task.status === status) &&
                (!type || task.type === type) &&
                (!priority || task.priority === priority) &&
                (!assignee || task.assignee?.name === assignee)
            );
        });
    }, [filters, tasks]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleStatusChange = async (taskId, newStatus) => {
        const toastId = toast.loading("Updating status…");
        try {
            await new Promise((resolve) => setTimeout(resolve, 800));
            const updatedTask = structuredClone(tasks.find((t) => t.id === taskId));
            updatedTask.status = newStatus;
            dispatch(updateTask(updatedTask));
            toast.success("Status updated", { id: toastId });
        } catch (error) {
            toast.error(error?.message || "Failed to update status", { id: toastId });
        }
    };

    const handleDeleteConfirmed = async () => {
        setDeleteLoading(true);
        const toastId = toast.loading("Deleting tasks…");
        try {
            await new Promise((resolve) => setTimeout(resolve, 800));
            dispatch(deleteTask(selectedTasks));
            setSelectedTasks([]);
            toast.success("Tasks deleted", { id: toastId });
        } catch (error) {
            toast.error(error?.message || "Failed to delete tasks", { id: toastId });
        } finally {
            setDeleteLoading(false);
            setConfirmOpen(false);
        }
    };

    const filterOptions = {
        status: [
            { label: "All Statuses", value: "" },
            { label: "To Do", value: "TODO" },
            { label: "In Progress", value: "IN_PROGRESS" },
            { label: "Done", value: "DONE" },
        ],
        type: [
            { label: "All Types", value: "" },
            { label: "Task", value: "TASK" },
            { label: "Bug", value: "BUG" },
            { label: "Feature", value: "FEATURE" },
            { label: "Improvement", value: "IMPROVEMENT" },
            { label: "Other", value: "OTHER" },
        ],
        priority: [
            { label: "All Priorities", value: "" },
            { label: "Low", value: "LOW" },
            { label: "Medium", value: "MEDIUM" },
            { label: "High", value: "HIGH" },
        ],
        assignee: [
            { label: "All Assignees", value: "" },
            ...assigneeList.map((n) => ({ label: n, value: n })),
        ],
    };

    const hasActiveFilters = Object.values(filters).some(Boolean);

    return (
        <div className="space-y-4">
            {/* ── Filters Bar ── */}
            <div className="flex flex-wrap items-center gap-2">
                {["status", "type", "priority", "assignee"].map((name) => (
                    <select
                        key={name}
                        name={name}
                        value={filters[name]}
                        onChange={handleFilterChange}
                        className="border border-zinc-300 dark:border-zinc-700 outline-none px-3 py-1.5 rounded-lg text-sm text-zinc-900 dark:text-zinc-200 bg-white dark:bg-zinc-900 cursor-pointer"
                    >
                        {filterOptions[name].map((opt, idx) => (
                            <option key={idx} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                ))}

                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={() => setFilters({ status: "", type: "", priority: "", assignee: "" })}
                        className="px-3 py-1.5 flex items-center gap-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
                    >
                        <XIcon className="size-3" /> Reset
                    </button>
                )}

                {selectedTasks.length > 0 && (
                    <button
                        type="button"
                        onClick={() => setConfirmOpen(true)}
                        className="px-3 py-1.5 flex items-center gap-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 text-sm hover:bg-red-100 dark:hover:bg-red-500/20 transition"
                    >
                        <Trash className="size-3" />
                        Delete {selectedTasks.length > 1 ? `(${selectedTasks.length})` : ""}
                    </button>
                )}
            </div>

            {/* ── Tasks Table ── */}
            <div className="overflow-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="min-w-full text-sm text-left bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-300">
                        <thead className="text-xs uppercase bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                                <th className="pl-3 pr-2 py-3">
                                    <input
                                        type="checkbox"
                                        className="size-3.5 accent-blue-500"
                                        onChange={() =>
                                            selectedTasks.length === tasks.length
                                                ? setSelectedTasks([])
                                                : setSelectedTasks(tasks.map((t) => t.id))
                                        }
                                        checked={tasks.length > 0 && selectedTasks.length === tasks.length}
                                        readOnly={tasks.length === 0}
                                    />
                                </th>
                                <th className="px-4 pl-0 py-3 font-semibold">Title</th>
                                <th className="px-4 py-3 font-semibold">Type</th>
                                <th className="px-4 py-3 font-semibold">Priority</th>
                                <th className="px-4 py-3 font-semibold">Status</th>
                                <th className="px-4 py-3 font-semibold">Assignee</th>
                                <th className="px-4 py-3 font-semibold">Due Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTasks.length > 0 ? (
                                filteredTasks.map((task) => {
                                    const typeInfo = typeIcons[task.type] || {};
                                    const priorityInfo = priorityConfig[task.priority] || {};
                                    const Icon = typeInfo.icon;

                                    return (
                                        <tr
                                            key={task.id}
                                            onClick={() => navigate(`/dashboard/taskDetails?projectId=${task.projectId}&taskId=${task.id}`)}
                                            className="border-t border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                                        >
                                            <td
                                                onClick={(e) => e.stopPropagation()}
                                                className="pl-3 pr-2"
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="size-3.5 accent-blue-500"
                                                    checked={selectedTasks.includes(task.id)}
                                                    onChange={() =>
                                                        selectedTasks.includes(task.id)
                                                            ? setSelectedTasks(selectedTasks.filter((i) => i !== task.id))
                                                            : setSelectedTasks((prev) => [...prev, task.id])
                                                    }
                                                />
                                            </td>
                                            <td className="px-4 pl-0 py-3 font-medium truncate max-w-[200px]">
                                                {task.title}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5">
                                                    {Icon && <Icon className={`size-3.5 ${typeInfo.color}`} />}
                                                    <span className={`text-xs capitalize ${typeInfo.color}`}>
                                                        {task.type?.toLowerCase()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${priorityInfo.bg} ${priorityInfo.text}`}>
                                                    <span className={`size-1.5 rounded-full inline-block ${priorityInfo.dot}`} />
                                                    {task.priority}
                                                </span>
                                            </td>
                                            <td
                                                onClick={(e) => e.stopPropagation()}
                                                className="px-4 py-3"
                                            >
                                                <select
                                                    name="status"
                                                    value={task.status}
                                                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                                    className="text-xs px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 outline-none cursor-pointer hover:border-blue-400 transition"
                                                >
                                                    <option value="TODO">To Do</option>
                                                    <option value="IN_PROGRESS">In Progress</option>
                                                    <option value="DONE">Done</option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    {task.assignee?.image ? (
                                                        <img
                                                            src={task.assignee.image}
                                                            className="size-5 rounded-full object-cover ring-1 ring-zinc-200 dark:ring-zinc-700"
                                                            alt={task.assignee.name}
                                                            onError={(e) => { e.target.style.display = "none"; }}
                                                        />
                                                    ) : (
                                                        <div className="size-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                                                            {task.assignee?.name?.[0]?.toUpperCase() || "?"}
                                                        </div>
                                                    )}
                                                    <span className="truncate max-w-[100px] text-xs">
                                                        {task.assignee?.name || "—"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-xs whitespace-nowrap">
                                                    <CalendarIcon className="size-3.5 flex-shrink-0" />
                                                    {safeFormat(task.due_date, "dd MMM")}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center text-zinc-400 dark:text-zinc-500 py-12">
                                        <AlertCircle className="size-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No tasks found for the selected filters.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900 rounded-xl">
                    {filteredTasks.length > 0 ? (
                        filteredTasks.map((task) => {
                            const typeInfo = typeIcons[task.type] || {};
                            const priorityInfo = priorityConfig[task.priority] || {};
                            const Icon = typeInfo.icon;

                            return (
                                <div
                                    key={task.id}
                                    className="p-4 flex flex-col gap-3"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                                            {task.title}
                                        </h3>
                                        <input
                                            type="checkbox"
                                            className="size-4 accent-blue-500 flex-shrink-0 mt-0.5"
                                            checked={selectedTasks.includes(task.id)}
                                            onChange={() =>
                                                selectedTasks.includes(task.id)
                                                    ? setSelectedTasks(selectedTasks.filter((i) => i !== task.id))
                                                    : setSelectedTasks((prev) => [...prev, task.id])
                                            }
                                        />
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        {Icon && (
                                            <span className={`inline-flex items-center gap-1 text-xs capitalize ${typeInfo.color}`}>
                                                <Icon className="size-3" />
                                                {task.type?.toLowerCase()}
                                            </span>
                                        )}
                                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${priorityInfo.bg} ${priorityInfo.text}`}>
                                            <span className={`size-1.5 rounded-full ${priorityInfo.dot}`} />
                                            {task.priority}
                                        </span>
                                    </div>

                                    <div>
                                        <label className="text-zinc-500 dark:text-zinc-400 text-xs mb-1 block">Status</label>
                                        <select
                                            value={task.status}
                                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                            className="w-full text-xs px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 outline-none"
                                        >
                                            <option value="TODO">To Do</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="DONE">Done</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                                        <div className="flex items-center gap-1.5">
                                            <div className="size-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold">
                                                {task.assignee?.name?.[0]?.toUpperCase() || "?"}
                                            </div>
                                            {task.assignee?.name || "—"}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <CalendarIcon className="size-3.5" />
                                            {safeFormat(task.due_date, "dd MMM")}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="p-10 text-center">
                            <AlertCircle className="size-8 mx-auto mb-2 text-zinc-300 dark:text-zinc-600" />
                            <p className="text-sm text-zinc-400 dark:text-zinc-500">No tasks found for the selected filters.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Confirm Delete Dialog ── */}
            <ConfirmDialog
                isOpen={confirmOpen}
                title="Delete Tasks"
                message={`You are about to permanently delete ${selectedTasks.length} task${selectedTasks.length > 1 ? "s" : ""}. This action cannot be undone.`}
                confirmLabel="Delete"
                onConfirm={handleDeleteConfirmed}
                onCancel={() => setConfirmOpen(false)}
                loading={deleteLoading}
            />
        </div>
    );
};

export default ProjectTasks;
