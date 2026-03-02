import { useEffect, useState } from "react";
import { UsersIcon, Search, UserPlus, Shield, Activity, X } from "lucide-react";
import InviteMemberDialog from "../components/InviteMemberDialog";
import { useSelector } from "react-redux";

/** Hash-based avatar color for visual variety */
const AVATAR_COLORS = [
    "bg-blue-500", "bg-violet-500", "bg-emerald-500", "bg-rose-500",
    "bg-amber-500", "bg-cyan-500", "bg-fuchsia-500", "bg-teal-500",
];
const getAvatarColor = (name = "") => {
    const code = (name || "").split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return AVATAR_COLORS[code % AVATAR_COLORS.length];
};

const Team = () => {
    const [tasks, setTasks] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const currentWorkspace = useSelector((state) => state?.workspace?.currentWorkspace || null);
    const projects = currentWorkspace?.projects || [];

    const filteredUsers = users.filter(
        (user) =>
            user?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user?.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        setUsers(currentWorkspace?.members || []);
        setTasks(currentWorkspace?.projects?.reduce((acc, p) => [...acc, ...p.tasks], []) || []);
    }, [currentWorkspace]);

    const statsCards = [
        {
            label: "Total Members",
            value: users.length,
            icon: UsersIcon,
            iconBg: "bg-blue-100 dark:bg-blue-500/15",
            iconColor: "text-blue-600 dark:text-blue-400",
        },
        {
            label: "Active Projects",
            value: projects.filter((p) => p.status !== "CANCELLED" && p.status !== "COMPLETED").length,
            icon: Activity,
            iconBg: "bg-emerald-100 dark:bg-emerald-500/15",
            iconColor: "text-emerald-600 dark:text-emerald-400",
        },
        {
            label: "Total Tasks",
            value: tasks.length,
            icon: Shield,
            iconBg: "bg-violet-100 dark:bg-violet-500/15",
            iconColor: "text-violet-600 dark:text-violet-400",
        },
    ];

    return (
        <div className="space-y-6 max-w-6xl mx-auto animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team</h1>
                    <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">
                        {users.length} member{users.length !== 1 ? "s" : ""} in this workspace
                    </p>
                </div>
                <button
                    onClick={() => setIsDialogOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0 flex-shrink-0"
                >
                    <UserPlus className="size-4" /> Invite Member
                </button>
                <InviteMemberDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {statsCards.map((card, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${card.iconBg} flex-shrink-0`}>
                            <card.icon className={`size-5 ${card.iconColor}`} />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">{card.label}</p>
                            <p className="text-2xl font-bold text-zinc-900 dark:text-white tabular-nums">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 size-3.5 pointer-events-none" />
                <input
                    placeholder="Search team members…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-9 py-2 w-full text-sm rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
                    >
                        <X className="size-3.5" />
                    </button>
                )}
            </div>

            {/* Team Members */}
            {filteredUsers.length === 0 ? (
                <div className="text-center py-16">
                    <div className="size-20 mx-auto mb-5 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center">
                        <UsersIcon className="size-10 text-zinc-400 dark:text-zinc-500" />
                    </div>
                    <h3 className="text-base font-semibold text-zinc-700 dark:text-zinc-200 mb-1">
                        {users.length === 0 ? "No team members yet" : "No members match your search"}
                    </h3>
                    <p className="text-sm text-zinc-400 dark:text-zinc-500">
                        {users.length === 0 ? "Invite team members to start collaborating" : "Try a different search term"}
                    </p>
                </div>
            ) : (
                <div className="max-w-4xl">
                    {/* Desktop Table */}
                    <div className="hidden sm:block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800">
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                                        Member
                                    </th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                                        Email
                                    </th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                                        Role
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {filteredUsers.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                                    >
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`size-8 rounded-full ${getAvatarColor(user.user?.name)} flex items-center justify-center text-white text-xs font-bold ring-2 ring-white dark:ring-zinc-900`}>
                                                    {user.user?.name?.[0]?.toUpperCase() || "?"}
                                                </div>
                                                <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                                    {user.user?.name || "Unknown User"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-sm text-zinc-500 dark:text-zinc-400">
                                            {user.user?.email}
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === "ADMIN"
                                                    ? "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400"
                                                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                                                }`}>
                                                {user.role || "Member"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="sm:hidden space-y-3">
                        {filteredUsers.map((user) => (
                            <div
                                key={user.id}
                                className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center gap-3"
                            >
                                <div className={`size-10 rounded-full ${getAvatarColor(user.user?.name)} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                                    {user.user?.name?.[0]?.toUpperCase() || "?"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-zinc-900 dark:text-white truncate">
                                        {user.user?.name || "Unknown User"}
                                    </p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{user.user?.email}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${user.role === "ADMIN"
                                        ? "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400"
                                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                                    }`}>
                                    {user.role || "Member"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Team;
