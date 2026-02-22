import { useState } from "react";
import { Mail, UserPlus } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { addProjectMember } from "../features/workspaceSlice";
import toast from "react-hot-toast";

const AddProjectMember = ({ isDialogOpen, setIsDialogOpen }) => {
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');

    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace || null);
    const project = currentWorkspace?.projects.find((p) => p.id === id);
    const projectMemberIds = project?.members.map((m) => m.userId) || [];

    const [email, setEmail] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !id) return;
        setIsAdding(true);

        try {
            // Find user by email in profiles
            const { data: profile, error: profileErr } = await supabase
                .from("profiles")
                .select("*")
                .eq("email", email)
                .single();

            if (profileErr || !profile) {
                toast.error("No user found with that email. They must be registered first.");
                return;
            }

            if (projectMemberIds.includes(profile.id)) {
                toast.error("This user is already a project member.");
                return;
            }

            // Add to project_members
            const { data: membership, error: memErr } = await supabase
                .from("project_members")
                .insert({ project_id: id, user_id: profile.id })
                .select()
                .single();

            if (memErr) throw memErr;

            // Also add to workspace_members if not already there
            await supabase.from("workspace_members").upsert({
                workspace_id: currentWorkspace.id,
                user_id: profile.id,
                role: "MEMBER",
            }, { onConflict: "workspace_id,user_id" });

            dispatch(addProjectMember({
                projectId: id,
                member: {
                    id: membership.id,
                    userId: profile.id,
                    projectId: id,
                    user: profile,
                },
            }));

            toast.success(`${profile.name} added to project!`);
            setIsDialogOpen(false);
            setEmail('');
        } catch (err) {
            toast.error(err.message || "Failed to add member");
        } finally {
            setIsAdding(false);
        }
    };

    if (!isDialogOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur flex items-center justify-center z-50">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md text-zinc-900 dark:text-zinc-200">
                {/* Header */}
                <div className="mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <UserPlus className="size-5 text-zinc-900 dark:text-zinc-200" /> Add Member to Project
                    </h2>
                    {project && (
                        <p className="text-sm text-zinc-700 dark:text-zinc-400">
                            Adding to Project: <span className="text-blue-600 dark:text-blue-400">{project.name}</span>
                        </p>
                    )}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-200">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 w-4 h-4" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter user's email address"
                                className="pl-10 mt-1 w-full rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 text-sm py-2 focus:outline-none focus:border-blue-500"
                                required
                            />
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            The user must already have an account in this app.
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setIsDialogOpen(false)} className="px-5 py-2 text-sm rounded border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition">
                            Cancel
                        </button>
                        <button type="submit" disabled={isAdding} className="px-5 py-2 text-sm rounded bg-gradient-to-br from-blue-500 to-blue-600 hover:opacity-90 text-white disabled:opacity-50 transition">
                            {isAdding ? "Adding..." : "Add Member"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProjectMember;
