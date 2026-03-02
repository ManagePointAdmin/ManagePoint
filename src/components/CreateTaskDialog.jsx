import { useState } from "react";
import { CalendarIcon, X, Loader2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import { supabase } from "../lib/supabase";
import { addTask } from "../features/workspaceSlice";
import toast from "react-hot-toast";

export default function CreateTaskDialog({ showCreateTask, setShowCreateTask, projectId }) {
    const dispatch = useDispatch();
    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace || null);
    const { currentUser } = useSelector((state) => state.auth);
    const project = currentWorkspace?.projects.find((p) => p.id === projectId);
    const teamMembers = project?.members || [];

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: "", description: "", type: "TASK", status: "TODO",
        priority: "MEDIUM", assigneeId: "", due_date: "",
    });

    const set = (key, val) => setFormData((prev) => ({ ...prev, [key]: val }));

    const handleClose = () => {
        setShowCreateTask(false);
        setFormData({ title: "", description: "", type: "TASK", status: "TODO", priority: "MEDIUM", assigneeId: "", due_date: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!projectId || !currentUser) return;
        setIsSubmitting(true);
        try {
            const { data: task, error } = await supabase
                .from("tasks")
                .insert({
                    project_id: projectId,
                    title: formData.title,
                    description: formData.description || null,
                    type: formData.type,
                    status: formData.status,
                    priority: formData.priority,
                    assignee_id: formData.assigneeId || null,
                    due_date: formData.due_date || null,
                })
                .select().single();
            if (error) throw error;

            let assignee = null;
            if (formData.assigneeId) {
                const { data: profile } = await supabase.from("profiles").select("*").eq("id", formData.assigneeId).single();
                assignee = profile;
            }
            dispatch(addTask({ ...task, projectId: task.project_id, assigneeId: task.assignee_id, assignee, comments: [] }));
            toast.success("Task created!");
            handleClose();
        } catch (err) {
            toast.error(err.message || "Failed to create task");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!showCreateTask) return null;

    const inputCls = "w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";

    return createPortal(
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 dark:bg-black/75 backdrop-blur-sm">
            <div className="flex min-h-full items-center justify-center py-4 px-4">
                <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">

                    {/* Header */}
                    <div className="flex items-start justify-between px-7 pt-6 pb-1">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Task</h2>
                            {project?.name && (
                                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                                    Project: <span className="text-blue-600 dark:text-blue-400">{project.name}</span>
                                </p>
                            )}
                        </div>
                        <button onClick={handleClose} className="size-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition mt-0.5">
                            <X className="size-4" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="px-7 pb-7 pt-5 space-y-5 max-h-[75vh] overflow-y-auto">

                        {/* Title */}
                        <div>
                            <label className="block text-sm text-gray-700 dark:text-zinc-300 mb-1.5">
                                Task title <span className="text-red-500">*</span>
                            </label>
                            <input value={formData.title} onChange={(e) => set("title", e.target.value)} placeholder="What needs to be done?" className={inputCls} required autoFocus maxLength={120} />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm text-gray-700 dark:text-zinc-300 mb-1.5">
                                Description <span className="text-gray-400 dark:text-zinc-500">(optional)</span>
                            </label>
                            <textarea value={formData.description} onChange={(e) => set("description", e.target.value)} placeholder="Add more details…" rows={3} className={`${inputCls} resize-none`} />
                        </div>

                        {/* Type & Priority */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm text-gray-700 dark:text-zinc-300 mb-1.5">Type</label>
                                <select value={formData.type} onChange={(e) => set("type", e.target.value)} className={inputCls}>
                                    <option value="TASK">Task</option>
                                    <option value="BUG">Bug</option>
                                    <option value="FEATURE">Feature</option>
                                    <option value="IMPROVEMENT">Improvement</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700 dark:text-zinc-300 mb-1.5">Priority</label>
                                <select value={formData.priority} onChange={(e) => set("priority", e.target.value)} className={inputCls}>
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                </select>
                            </div>
                        </div>

                        {/* Assignee & Status */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm text-gray-700 dark:text-zinc-300 mb-1.5">Assignee</label>
                                <select value={formData.assigneeId} onChange={(e) => set("assigneeId", e.target.value)} className={inputCls}>
                                    <option value="">Unassigned</option>
                                    {teamMembers.map((m) => (
                                        <option key={m?.user?.id} value={m?.user?.id}>
                                            {m?.user?.name || m?.user?.email}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700 dark:text-zinc-300 mb-1.5">Status</label>
                                <select value={formData.status} onChange={(e) => set("status", e.target.value)} className={inputCls}>
                                    <option value="TODO">To Do</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="DONE">Done</option>
                                </select>
                            </div>
                        </div>

                        {/* Due Date */}
                        <div>
                            <label className="block text-sm text-gray-700 dark:text-zinc-300 mb-1.5">
                                Due date <span className="text-gray-400 dark:text-zinc-500">(optional)</span>
                            </label>
                            <input type="date" value={formData.due_date} onChange={(e) => set("due_date", e.target.value)} min={new Date().toISOString().split("T")[0]} className={inputCls} />
                            {formData.due_date && (
                                <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
                                    {format(new Date(formData.due_date + "T12:00:00"), "EEEE, MMMM d, yyyy")}
                                </p>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 pt-1">
                            <button type="button" onClick={handleClose} disabled={isSubmitting} className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition">
                                Cancel
                            </button>
                            <button type="submit" disabled={isSubmitting || !formData.title.trim()} className="flex items-center gap-2 px-5 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition disabled:opacity-60 disabled:cursor-not-allowed">
                                {isSubmitting ? <><Loader2 className="size-3.5 animate-spin" /> Creating…</> : "Create Task"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        , document.body);
}
