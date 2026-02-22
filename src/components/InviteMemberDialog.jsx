import { useState } from "react";
import { Mail, UserPlus, XIcon, CheckCircle, Send } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { supabase } from "../lib/supabase";
import { addWorkspaceMember } from "../features/workspaceSlice";
import toast from "react-hot-toast";
import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

const InviteMemberDialog = ({ isDialogOpen, setIsDialogOpen }) => {
    const dispatch = useDispatch();
    const { currentWorkspace } = useSelector((state) => state.workspace);
    const { currentUser } = useSelector((state) => state.auth);

    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sent, setSent] = useState(false);

    const appUrl = window.location.origin;

    // ── Send email via EmailJS ────────────────────────────────────────────────
    const sendInviteEmail = async ({ toEmail, isExistingUser }) => {
        const templateParams = {
            to_email: toEmail,
            workspace_name: currentWorkspace?.name || "the workspace",
            inviter_name: currentUser?.name || currentUser?.email || "A team member",
            invite_link: isExistingUser ? appUrl : `${appUrl}/register`,
        };

        console.log("[EmailJS] Sending with params:", templateParams);

        const result = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            templateParams,
            EMAILJS_PUBLIC_KEY
        );

        console.log("[EmailJS] Result:", result);
        return result;
    };

    // ── Main handler ─────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmedEmail = email.trim().toLowerCase();
        if (!trimmedEmail) return;
        if (!currentWorkspace) {
            toast.error("No workspace selected. Please select a workspace first.");
            return;
        }

        setIsSubmitting(true);
        console.log("[Invite] Starting invite for:", trimmedEmail);

        try {
            // ── Step 1: Look up profile with maybeSingle (never throws on 0 rows) ──
            console.log("[Invite] Step 1: looking up profile...");
            const { data: profile, error: profileErr } = await supabase
                .from("profiles")
                .select("id, name, email")
                .eq("email", trimmedEmail)
                .maybeSingle();          // ← safe: returns null if not found

            if (profileErr) {
                console.error("[Invite] Profile lookup error:", profileErr);
                throw new Error("Could not look up user: " + profileErr.message);
            }

            console.log("[Invite] Profile found:", profile);

            if (profile) {
                // ──── EXISTING USER ─────────────────────────────────────────────

                // Check if already a member
                const alreadyMember = currentWorkspace.members?.some(
                    (m) => m.userId === profile.id
                );
                if (alreadyMember) {
                    toast.error("This user is already a member of this workspace.");
                    return;
                }

                // Add to workspace_members
                console.log("[Invite] Step 2a: inserting workspace_member...");
                const { data: membership, error: memErr } = await supabase
                    .from("workspace_members")
                    .insert({
                        workspace_id: currentWorkspace.id,
                        user_id: profile.id,
                        role: "MEMBER",
                    })
                    .select()
                    .single();

                if (memErr) {
                    console.error("[Invite] workspace_members insert error:", memErr);
                    throw new Error(memErr.message);
                }

                // Update Redux immediately so the UI shows the new member
                dispatch(
                    addWorkspaceMember({
                        workspaceId: currentWorkspace.id,
                        member: {
                            id: membership.id,
                            userId: profile.id,
                            workspaceId: currentWorkspace.id,
                            role: "MEMBER",
                            user: profile,
                        },
                    })
                );

                // Send notification email  
                console.log("[Invite] Step 3a: sending email...");
                try {
                    await sendInviteEmail({ toEmail: trimmedEmail, isExistingUser: true });
                    toast.success(`✅ ${profile.name || trimmedEmail} added & notified by email!`);
                } catch (emailErr) {
                    console.error("[Invite] Email send error (non-fatal):", emailErr);
                    // Member was added — email failure is non-fatal
                    toast.success(`✅ ${profile.name || trimmedEmail} added to workspace!`);
                    toast.error("Could not send email notification. Check your EmailJS settings.");
                }

            } else {
                // ──── NEW USER (not registered) ─────────────────────────────────

                console.log("[Invite] Step 2b: new user, sending invite email...");
                try {
                    await sendInviteEmail({ toEmail: trimmedEmail, isExistingUser: false });
                    toast.success(`📧 Invite sent to ${trimmedEmail}!`);
                } catch (emailErr) {
                    console.error("[Invite] Email send error:", emailErr);
                    throw new Error(
                        "Email failed: " + (emailErr?.text || emailErr?.message || "Unknown EmailJS error")
                    );
                }
            }

            // ── Success ──
            setSent(true);
            setTimeout(() => {
                setSent(false);
                setIsDialogOpen(false);
                setEmail("");
            }, 2000);

        } catch (err) {
            console.error("[Invite] Fatal error:", err);
            toast.error(err?.message || "Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (isSubmitting) return;
        setIsDialogOpen(false);
        setEmail("");
        setSent(false);
    };

    if (!isDialogOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur flex items-center justify-center z-50">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md relative text-zinc-900 dark:text-zinc-200 shadow-2xl">

                {/* Close */}
                <button
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors disabled:opacity-30"
                >
                    <XIcon className="size-5" />
                </button>

                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <UserPlus className="size-5" /> Invite to Workspace
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        Add a new member to{" "}
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                            {currentWorkspace?.name}
                        </span>
                    </p>
                </div>

                {/* Success state */}
                {sent ? (
                    <div className="flex flex-col items-center gap-3 py-6">
                        <CheckCircle className="size-12 text-green-500" />
                        <p className="text-base font-medium text-green-600 dark:text-green-400">
                            Invitation sent!
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
                            Email delivered to <span className="font-medium">{email}</span>
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 size-4" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="colleague@example.com"
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                            <p className="text-xs text-zinc-400 dark:text-zinc-500">
                                Works for registered users and new users alike.
                            </p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !email.trim()}
                                className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                                        Sending…
                                    </>
                                ) : (
                                    <>
                                        <Send className="size-4" />
                                        Send Invite
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default InviteMemberDialog;
