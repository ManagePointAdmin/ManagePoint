import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { User, Palette, LogOut, Save, Loader2, ChevronRight, Moon, Sun, Shield } from "lucide-react";
import { toggleTheme } from "../features/themeSlice";
import { updateProfile, logoutUser } from "../features/authSlice";
import toast from "react-hot-toast";

const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "account", label: "Account", icon: Shield },
];

export default function SettingsPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentUser, loading } = useSelector((state) => state.auth);
    const { theme } = useSelector((state) => state.theme);

    const [activeTab, setActiveTab] = useState("profile");
    const [name, setName] = useState(currentUser?.name || "");
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error("Name cannot be empty");
            return;
        }
        setIsSavingProfile(true);
        try {
            await dispatch(updateProfile({ userId: currentUser.id, name: name.trim() })).unwrap();
            toast.success("Profile updated successfully!");
        } catch (err) {
            toast.error(err || "Failed to update profile");
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleLogout = async () => {
        setIsSigningOut(true);
        await dispatch(logoutUser());
        navigate("/login", { replace: true });
    };

    const cardClass = "bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6";

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-200">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Settings</h1>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Manage your account preferences and workspace settings</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar tabs */}
                <div className="md:w-48 flex-shrink-0">
                    <nav className="space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                        ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                        : "text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
                                    }`}
                            >
                                <tab.icon className="size-4" />
                                {tab.label}
                                <ChevronRight className={`size-3.5 ml-auto transition-transform ${activeTab === tab.id ? "rotate-90 opacity-60" : "opacity-0"}`} />
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-6">

                    {/* ── Profile Tab ── */}
                    {activeTab === "profile" && (
                        <>
                            <div className={cardClass}>
                                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5">Profile Information</h2>
                                <form onSubmit={handleSaveProfile} className="space-y-5">
                                    {/* Avatar */}
                                    <div className="flex items-center gap-4">
                                        <div className="size-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/20">
                                            {name?.[0]?.toUpperCase() || currentUser?.name?.[0]?.toUpperCase() || "U"}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{currentUser?.name || "User"}</p>
                                            <p className="text-xs text-gray-500 dark:text-zinc-400">{currentUser?.email}</p>
                                        </div>
                                    </div>

                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
                                            Display name
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            placeholder="Enter your name"
                                        />
                                    </div>

                                    {/* Email (read-only) */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
                                            Email address
                                        </label>
                                        <input
                                            type="email"
                                            value={currentUser?.email || ""}
                                            readOnly
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 text-gray-500 dark:text-zinc-400 cursor-not-allowed"
                                        />
                                        <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">Email cannot be changed here</p>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isSavingProfile || loading}
                                            className="flex items-center gap-2 px-5 py-2 text-sm rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium shadow-lg shadow-blue-500/20 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {isSavingProfile ? (
                                                <><Loader2 className="size-4 animate-spin" /> Saving...</>
                                            ) : (
                                                <><Save className="size-4" /> Save changes</>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </>
                    )}

                    {/* ── Appearance Tab ── */}
                    {activeTab === "appearance" && (
                        <div className={cardClass}>
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5">Appearance</h2>
                            <div className="space-y-4">
                                <p className="text-sm text-gray-500 dark:text-zinc-400">Choose how ManagePoint looks to you. Select a theme preference.</p>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Light theme card */}
                                    <button
                                        onClick={() => theme === "dark" && dispatch(toggleTheme())}
                                        className={`group relative p-4 rounded-xl border-2 transition-all ${theme === "light"
                                                ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                                                : "border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600"
                                            }`}
                                    >
                                        <div className="w-full h-20 rounded-lg bg-white border border-gray-200 mb-3 flex items-center justify-center overflow-hidden">
                                            <div className="w-full h-full p-2 flex flex-col gap-1">
                                                <div className="h-2 w-full bg-gray-100 rounded" />
                                                <div className="flex gap-1 flex-1">
                                                    <div className="w-6 h-full bg-gray-100 rounded" />
                                                    <div className="flex-1 h-full bg-gray-50 rounded" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Sun className="size-4 text-amber-500" />
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">Light</span>
                                            {theme === "light" && <span className="ml-auto text-xs text-blue-600 dark:text-blue-400 font-medium">Active</span>}
                                        </div>
                                    </button>

                                    {/* Dark theme card */}
                                    <button
                                        onClick={() => theme === "light" && dispatch(toggleTheme())}
                                        className={`group relative p-4 rounded-xl border-2 transition-all ${theme === "dark"
                                                ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                                                : "border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600"
                                            }`}
                                    >
                                        <div className="w-full h-20 rounded-lg bg-zinc-900 border border-zinc-700 mb-3 overflow-hidden">
                                            <div className="w-full h-full p-2 flex flex-col gap-1">
                                                <div className="h-2 w-full bg-zinc-800 rounded" />
                                                <div className="flex gap-1 flex-1">
                                                    <div className="w-6 h-full bg-zinc-800 rounded" />
                                                    <div className="flex-1 h-full bg-zinc-800/50 rounded" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Moon className="size-4 text-blue-400" />
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">Dark</span>
                                            {theme === "dark" && <span className="ml-auto text-xs text-blue-600 dark:text-blue-400 font-medium">Active</span>}
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Account Tab ── */}
                    {activeTab === "account" && (
                        <>
                            <div className={cardClass}>
                                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Account Details</h2>
                                <p className="text-sm text-gray-500 dark:text-zinc-400 mb-5">Your account information and sign out options.</p>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-zinc-800">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Name</p>
                                            <p className="text-sm text-gray-500 dark:text-zinc-400">{currentUser?.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-zinc-800">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Email</p>
                                            <p className="text-sm text-gray-500 dark:text-zinc-400">{currentUser?.email}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <button
                                        onClick={handleLogout}
                                        disabled={isSigningOut}
                                        className="flex items-center gap-2 px-5 py-2 text-sm rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition disabled:opacity-60"
                                    >
                                        {isSigningOut ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
                                        Sign out
                                    </button>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-500/20 rounded-xl p-6">
                                <h2 className="text-base font-semibold text-red-600 dark:text-red-400 mb-2">Danger Zone</h2>
                                <p className="text-sm text-gray-500 dark:text-zinc-400 mb-4">
                                    Once you delete your account, there is no going back. Please be certain.
                                </p>
                                <button
                                    type="button"
                                    className="flex items-center gap-2 px-5 py-2 text-sm rounded-lg border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                                    onClick={() => toast.error("Account deletion requires contacting support.")}
                                >
                                    Delete account
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
