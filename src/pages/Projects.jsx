import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Plus, Search, FolderOpen, Filter } from "lucide-react";
import ProjectCard from "../components/ProjectCard";
import CreateProjectDialog from "../components/CreateProjectDialog";

export default function Projects() {
    const projects = useSelector((state) => state?.workspace?.currentWorkspace?.projects || []);

    const [filteredProjects, setFilteredProjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [filters, setFilters] = useState({ status: "ALL", priority: "ALL" });

    useEffect(() => {
        let filtered = [...projects];
        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            filtered = filtered.filter((p) =>
                p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
            );
        }
        if (filters.status !== "ALL") filtered = filtered.filter((p) => p.status === filters.status);
        if (filters.priority !== "ALL") filtered = filtered.filter((p) => p.priority === filters.priority);
        setFilteredProjects(filtered);
    }, [projects, searchTerm, filters]);

    const hasFilters = filters.status !== "ALL" || filters.priority !== "ALL" || searchTerm.trim();

    return (
        <div className="space-y-6 max-w-6xl mx-auto animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
                    <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">
                        {projects.length} project{projects.length !== 1 ? "s" : ""} in this workspace
                    </p>
                </div>
                <button
                    onClick={() => setIsDialogOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0 flex-shrink-0"
                >
                    <Plus className="size-4" /> New Project
                </button>
                <CreateProjectDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
            </div>

            {/* Search and Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 size-3.5 pointer-events-none" />
                    <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="Search projects…"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter className="size-3.5 text-zinc-400" />
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="PLANNING">Planning</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="ON_HOLD">On Hold</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                    <select
                        value={filters.priority}
                        onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                        className="text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                        <option value="ALL">All Priority</option>
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                    </select>
                    {hasFilters && (
                        <button
                            onClick={() => { setSearchTerm(""); setFilters({ status: "ALL", priority: "ALL" }); }}
                            className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition px-2 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProjects.length === 0 ? (
                    <div className="col-span-full text-center py-20">
                        <div className="size-20 mx-auto mb-5 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center">
                            <FolderOpen className="size-10 text-zinc-400 dark:text-zinc-500" />
                        </div>
                        <h3 className="text-base font-semibold text-zinc-700 dark:text-zinc-200 mb-1">
                            {hasFilters ? "No projects match your filters" : "No projects yet"}
                        </h3>
                        <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-5">
                            {hasFilters ? "Try adjusting your search or filters" : "Create your first project to get started"}
                        </p>
                        {!hasFilters && (
                            <button
                                onClick={() => setIsDialogOpen(true)}
                                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg shadow-blue-500/25 transition"
                            >
                                <Plus className="size-4" /> Create Project
                            </button>
                        )}
                    </div>
                ) : (
                    filteredProjects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))
                )}
            </div>
        </div>
    );
}
