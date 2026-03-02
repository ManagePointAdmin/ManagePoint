import { useState } from "react";
import { XIcon } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { createPortal } from "react-dom";
import { supabase } from "../lib/supabase";
import { addProject } from "../features/workspaceSlice";
import toast from "react-hot-toast";

const CreateProjectDialog = ({ isDialogOpen, setIsDialogOpen }) => {
    const dispatch = useDispatch();
    const { currentWorkspace } = useSelector((state) => state.workspace);
    const { currentUser } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        status: "PLANNING",
        priority: "MEDIUM",
        start_date: "",
        end_date: "",
        team_lead: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleClose = () => {
        setIsDialogOpen(false);
        setFormData({ name: "", description: "", status: "PLANNING", priority: "MEDIUM", start_date: "", end_date: "", team_lead: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentWorkspace || !currentUser) return;
        setIsSubmitting(true);

        try {
            const { data: project, error: projErr } = await supabase
                .from("projects")
                .insert({
                    workspace_id: currentWorkspace.id,
                    name: formData.name,
                    description: formData.description || null,
                    status: formData.status,
                    priority: formData.priority,
                    start_date: formData.start_date || null,
                    end_date: formData.end_date || null,
                    team_lead: formData.team_lead || null,
                    progress: 0,
                })
                .select()
                .single();

            if (projErr) throw projErr;

            // Add creator as project member
            await supabase.from("project_members").insert({
                project_id: project.id,
                user_id: currentUser.id,
            });

            // Fetch creator profile
            const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", currentUser.id)
                .single();

            const newProject = {
                ...project,
                projectId: project.id,
                workspaceId: project.workspace_id,
                members: [{
                    id: `${project.id}_${currentUser.id}`,
                    userId: currentUser.id,
                    projectId: project.id,
                    user: profile,
                }],
                tasks: [],
            };

            dispatch(addProject(newProject));
            toast.success("Project created!");
            handleClose();
        } catch (err) {
            toast.error(err.message || "Failed to create project");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isDialogOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 dark:bg-black/75 backdrop-blur-sm">
            <div className="flex min-h-full items-center justify-center py-4 px-4">
                <div className="relative w-full max-w-2xl flex flex-col bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden">

                    {/* ── Header (never scrolls away) ─────────────── */}
                    <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100 dark:border-zinc-800 flex-shrink-0">
                        <div>
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Create New Project</h2>
                            {currentWorkspace && (
                                <p className="text-xs text-gray-500 dark:text-zinc-400">
                                    Workspace: <span className="text-blue-600 dark:text-blue-400">{currentWorkspace.name}</span>
                                </p>
                            )}
                        </div>
                        <button
                            onClick={handleClose}
                            className="size-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
                        >
                            <XIcon className="size-4" />
                        </button>
                    </div>

                    {/* ── Scrollable form body ─────────────────────── */}
                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-7 py-6 space-y-5">

                        {/* Project Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Project name <span className="text-red-500">*</span></label>
                            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter project name" className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" required />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Description <span className="text-gray-400 dark:text-zinc-500 font-normal">(optional)</span></label>
                            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe your project" className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 text-sm h-20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none" />
                        </div>

                        {/* Status & Priority */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Status</label>
                                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                                    <option value="PLANNING">Planning</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="ON_HOLD">On Hold</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Priority</label>
                                <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                </select>
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Start date</label>
                                <input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">End date</label>
                                <input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} min={formData.start_date || undefined} className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                            </div>
                        </div>

                        {/* Lead */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Project lead</label>
                            <select value={formData.team_lead} onChange={(e) => setFormData({ ...formData, team_lead: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                                <option value="">No lead</option>
                                {currentWorkspace?.members?.map((member) => (
                                    <option key={member.userId} value={member.userId}>
                                        {member.user?.name || member.user?.email}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Footer inside form */}
                        <div className="flex items-center justify-end gap-3 pt-1">
                            <button type="button" onClick={handleClose} className="px-4 py-2 text-sm rounded-xl border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition">
                                Cancel
                            </button>
                            <button type="submit" disabled={isSubmitting || !currentWorkspace} className="flex items-center gap-2 px-5 py-2 text-sm rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium shadow-lg shadow-blue-500/20 disabled:opacity-50 transition">
                                {isSubmitting ? "Creating…" : "Create Project"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        , document.body);
};

export default CreateProjectDialog;