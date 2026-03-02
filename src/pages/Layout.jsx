import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loadTheme } from '../features/themeSlice'
import { Loader2Icon } from 'lucide-react'

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const { loading } = useSelector((state) => state.workspace)
    const dispatch = useDispatch()

    // Initial load of theme
    useEffect(() => {
        dispatch(loadTheme())
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (loading) return (
        <div className='flex flex-col items-center justify-center h-screen gap-4 bg-white dark:bg-zinc-950'>
            <div className="relative">
                <div className="size-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/30">
                    <img src="/favicon.ico" alt="ManagePoint" className="size-8 rounded-lg" />
                </div>
                <div className="absolute -bottom-1 -right-1 p-1 bg-white dark:bg-zinc-950 rounded-full">
                    <Loader2Icon className="size-4 text-blue-500 animate-spin" />
                </div>
            </div>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 animate-pulse">Loading workspace…</p>
        </div>
    )

    return (
        <div className="flex bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-slate-100 h-screen overflow-hidden">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <div className="flex-1 flex flex-col min-w-0 h-screen">
                <Navbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
                <main className="flex-1 overflow-y-auto p-6 xl:p-10 xl:px-16 animate-fade-in">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default Layout
