import { useState, useRef, useEffect } from 'react'
import { SearchIcon, PanelLeft, MoonIcon, SunIcon, LogOut, ChevronDown, X, Settings } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleTheme } from '../features/themeSlice'
import { logoutUser } from '../features/authSlice'
import { useNavigate } from 'react-router-dom'

/** Consistent avatar color based on the first letter */
const avatarColors = [
    "bg-blue-500", "bg-violet-500", "bg-emerald-500", "bg-rose-500",
    "bg-amber-500", "bg-cyan-500", "bg-fuchsia-500", "bg-teal-500",
];
const getAvatarColor = (name = "") => {
    const idx = (name.charCodeAt(0) || 0) % avatarColors.length;
    return avatarColors[idx];
};

const Navbar = ({ setIsSidebarOpen }) => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { theme } = useSelector(state => state.theme);
    const { currentUser } = useSelector(state => state.auth);
    const { currentWorkspace } = useSelector(state => state.workspace);

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);

    const dropdownRef = useRef(null);
    const searchRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Close search results on outside click
    useEffect(() => {
        const handler = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearchResults(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Perform search across projects and tasks
    useEffect(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q || !currentWorkspace) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        const results = [];
        (currentWorkspace.projects || []).forEach(project => {
            if (project.name?.toLowerCase().includes(q) || project.description?.toLowerCase().includes(q)) {
                results.push({
                    type: 'project', id: project.id,
                    title: project.name, subtitle: project.status || 'Project',
                    projectId: project.id,
                });
            }
            (project.tasks || []).forEach(task => {
                if (task.title?.toLowerCase().includes(q) || task.description?.toLowerCase().includes(q)) {
                    results.push({
                        type: 'task', id: task.id,
                        title: task.title, subtitle: project.name,
                        projectId: project.id, taskId: task.id,
                    });
                }
            });
        });

        setSearchResults(results.slice(0, 8));
        setShowSearchResults(true);
    }, [searchQuery, currentWorkspace]);

    const handleResultClick = (result) => {
        setSearchQuery('');
        setShowSearchResults(false);
        if (result.type === 'project') {
            navigate('/dashboard/projectsDetail', { state: { projectId: result.projectId } });
        } else {
            navigate('/dashboard/taskDetails', { state: { taskId: result.taskId, projectId: result.projectId } });
        }
    };

    const handleLogout = async () => {
        setDropdownOpen(false);
        await dispatch(logoutUser());
        navigate('/login', { replace: true });
    };

    const avatarColor = getAvatarColor(currentUser?.name);

    return (
        <div className="w-full bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-4 xl:px-8 py-3 flex-shrink-0 shadow-sm">
            <div className="flex items-center justify-between gap-4">
                {/* Left section */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Mobile sidebar trigger */}
                    <button
                        onClick={() => setIsSidebarOpen((prev) => !prev)}
                        className="sm:hidden p-2 rounded-lg text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
                    >
                        <PanelLeft size={18} />
                    </button>

                    {/* Search */}
                    <div className="relative flex-1 max-w-xs" ref={searchRef}>
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 size-3.5 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => searchQuery && setShowSearchResults(true)}
                            placeholder="Search projects, tasks…"
                            className="pl-9 pr-8 py-2 w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => { setSearchQuery(''); setShowSearchResults(false); }}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 transition"
                            >
                                <X className="size-3.5" />
                            </button>
                        )}

                        {/* Search Results Dropdown */}
                        {showSearchResults && (
                            <div className="absolute top-full mt-2 left-0 w-full min-w-[300px] bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-xl z-50 overflow-hidden animate-slide-down">
                                {searchResults.length > 0 ? (
                                    <>
                                        <div className="px-3 py-2 border-b border-gray-100 dark:border-zinc-800">
                                            <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium">
                                                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                        {searchResults.map((result) => (
                                            <button
                                                key={`${result.type}-${result.id}`}
                                                onClick={() => handleResultClick(result)}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-zinc-800 transition text-left"
                                            >
                                                <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium flex-shrink-0 ${result.type === 'project'
                                                    ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400'
                                                    : 'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400'
                                                    }`}>
                                                    {result.type === 'project' ? 'Project' : 'Task'}
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{result.title}</p>
                                                    <p className="text-xs text-gray-400 dark:text-zinc-500 truncate">{result.subtitle}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </>
                                ) : (
                                    <div className="px-3 py-8 text-center">
                                        <p className="text-sm text-gray-400 dark:text-zinc-500">
                                            No results for &ldquo;{searchQuery}&rdquo;
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right section */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Theme Toggle */}
                    <button
                        onClick={() => dispatch(toggleTheme())}
                        className="size-8 flex items-center justify-center rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 shadow-sm transition-all hover:scale-105 active:scale-95"
                        title="Toggle theme"
                    >
                        {theme === "light"
                            ? <MoonIcon className="size-4 text-gray-600 dark:text-zinc-300" />
                            : <SunIcon className="size-4 text-yellow-400" />
                        }
                    </button>

                    {/* User Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen((o) => !o)}
                            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
                        >
                            {currentUser?.avatar_url ? (
                                <img src={currentUser.avatar_url} alt={currentUser.name} className="size-7 rounded-full object-cover ring-2 ring-blue-500/30" />
                            ) : (
                                <div className={`size-7 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs font-bold ring-2 ring-offset-1 ring-offset-white dark:ring-offset-zinc-900 ring-blue-500/20`}>
                                    {currentUser?.name?.[0]?.toUpperCase() ?? 'U'}
                                </div>
                            )}
                            <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-zinc-200 max-w-[100px] truncate">
                                {currentUser?.name ?? 'User'}
                            </span>
                            <ChevronDown className={`size-3.5 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-xl py-1 z-50 animate-slide-down">
                                <div className="px-3 py-2.5 border-b border-gray-100 dark:border-zinc-800">
                                    <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{currentUser?.name}</p>
                                    <p className="text-xs text-gray-400 dark:text-zinc-500 truncate">{currentUser?.email}</p>
                                </div>
                                <button
                                    onClick={() => { setDropdownOpen(false); navigate('/dashboard/settings'); }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
                                >
                                    <Settings className="size-3.5 text-gray-400" />
                                    Settings
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                                >
                                    <LogOut className="size-3.5" />
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Navbar
