import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import MyTasksSidebar from './MyTasksSidebar'
import ProjectSidebar from './ProjectsSidebar'
import WorkspaceDropdown from './WorkspaceDropdown'
import { FolderOpenIcon, LayoutDashboardIcon, SettingsIcon, UsersIcon } from 'lucide-react'

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {

    const menuItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboardIcon, end: true },
        { name: 'Projects', href: '/dashboard/projects', icon: FolderOpenIcon },
        { name: 'Team', href: '/dashboard/team', icon: UsersIcon },
        { name: 'Settings', href: '/dashboard/settings', icon: SettingsIcon },
    ]

    const sidebarRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setIsSidebarOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setIsSidebarOpen]);

    return (
        <div
            ref={sidebarRef}
            className={`z-10 bg-white dark:bg-zinc-900 w-64 flex-shrink-0 flex flex-col h-screen border-r border-gray-200 dark:border-zinc-800 max-sm:absolute transition-all duration-300 ${isSidebarOpen ? 'left-0' : '-left-full'} `}
        >
            <WorkspaceDropdown />
            <hr className='border-gray-200 dark:border-zinc-800' />
            <div className='flex-1 overflow-y-auto no-scrollbar flex flex-col'>
                <div className='p-3 space-y-0.5'>
                    {menuItems.map((item) => (
                        <NavLink
                            to={item.href}
                            end={item.end}
                            key={item.name}
                            onClick={() => setIsSidebarOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 py-2 px-3 rounded-lg text-gray-700 dark:text-zinc-300 cursor-pointer transition-all text-sm ${isActive
                                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-medium border-l-[3px] border-blue-500 pl-[9px]'
                                    : 'hover:bg-gray-100 dark:hover:bg-zinc-800/60 border-l-[3px] border-transparent'
                                }`
                            }
                        >
                            <item.icon size={16} />
                            <p className='truncate'>{item.name}</p>
                        </NavLink>
                    ))}
                </div>
                <MyTasksSidebar />
                <ProjectSidebar />
            </div>
        </div>
    )
}

export default Sidebar
