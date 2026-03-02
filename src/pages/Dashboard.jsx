import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import StatsGrid from '../components/StatsGrid'
import ProjectOverview from '../components/ProjectOverview'
import RecentActivity from '../components/RecentActivity'
import TasksSummary from '../components/TasksSummary'
import CreateProjectDialog from '../components/CreateProjectDialog'

const Dashboard = () => {

    const { currentUser } = useSelector((state) => state.auth)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const greeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Good morning'
        if (hour < 18) return 'Good afternoon'
        return 'Good evening'
    }

    return (
        <div className='max-w-6xl mx-auto space-y-8 animate-fade-in-up'>
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {greeting()}, <span className="text-blue-600 dark:text-blue-400">{currentUser?.name?.split(' ')[0] || 'there'}</span> 👋
                    </h1>
                    <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">
                        Here&apos;s an overview of your workspace today.
                    </p>
                </div>

                <button
                    onClick={() => setIsDialogOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                    <Plus size={16} /> New Project
                </button>

                <CreateProjectDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
            </div>

            <StatsGrid />

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <ProjectOverview />
                    <RecentActivity />
                </div>
                <div>
                    <TasksSummary />
                </div>
            </div>
        </div>
    )
}

export default Dashboard
