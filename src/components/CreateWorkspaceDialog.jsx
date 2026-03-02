import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Loader2, Building2 } from "lucide-react";
import { createWorkspace } from "../features/workspaceSlice";
import toast from "react-hot-toast";
import { createPortal } from 'react-dom';

export default function CreateWorkspaceDialog({ isDialogOpen, setIsDialogOpen }) {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({ name: "", description: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleClose = () => {
        if (isSubmitting) return;
        setFormData({ name: "", description: "" });
        setIsDialogOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error("Workspace name is required");
            return;
        }
        if (!currentUser?.id) {
            toast.error("You must be logged in");
            return;
        }

        setIsSubmitting(true);
        try {
            await dispatch(
                createWorkspace({
                    name: formData.name.trim(),
                    description: formData.description.trim() || null,
                    userId: currentUser.id,
                })
            ).unwrap();
            toast.success("Workspace created!");
            handleClose();
        } catch (err) {
            toast.error(err || "Failed to create workspace");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isDialogOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 dark:bg-black/75 backdrop-blur-sm">
            <div className="flex min-h-full items-center justify-center py-4 px-4">
                <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">

                    {/* Header */}
                    <div className="flex items-start justify-between px-7 pt-6 pb-1">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create Workspace</h2>
                            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">Set up a new collaborative workspace</p>
                        </div>
                        <button
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="size-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition mt-0.5"
                        >
                            <X className="size-4" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="px-7 pb-7 pt-5 space-y-5">

                        <div>
                            <label className="block text-sm text-gray-700 dark:text-zinc-300 mb-1.5">
                                Workspace name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Acme Corp, My Projects…"
                                required
                                maxLength={80}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-700 dark:text-zinc-300 mb-1.5">
                                Description <span className="text-gray-400 dark:text-zinc-500">(optional)</span>
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="What's this workspace for?"
                                rows={3}
                                maxLength={300}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-1">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isSubmitting}
                                className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition disabled:opacity-60"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !formData.name.trim()}
                                className="flex items-center gap-2 px-5 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <><Loader2 className="size-3.5 animate-spin" /> Creating…</>
                                ) : (
                                    "Create Workspace"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        , document.body);
}
