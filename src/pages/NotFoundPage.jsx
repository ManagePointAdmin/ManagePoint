import { Link } from 'react-router-dom';
import { HomeIcon, CompassIcon } from 'lucide-react';

const NotFoundPage = () => {
    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
            <div className="relative flex flex-col items-center">
                {/* 404 Visual - Glowing effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-72 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl -z-10" />

                {/* Main 404 Text with gradient */}
                <h1 className="text-9xl font-black bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 bg-clip-text text-transparent select-none animate-bounce-subtle">
                    404
                </h1>

                {/* Compass Visual using Lucide */}
                <div className="size-24 rounded-3xl bg-white dark:bg-zinc-900 flex items-center justify-center shadow-xl shadow-blue-500/10 dark:shadow-blue-500/5 mb-6 animate-spin-slow">
                    <CompassIcon className="size-12 text-blue-600 dark:text-blue-500" />
                </div>

                <h2 className="text-2xl font-bold font-heading text-neutral-800 dark:text-neutral-100 mb-2">
                    Lost in Space?
                </h2>
                
                <p className="text-neutral-500 dark:text-neutral-400 text-center max-w-md mb-8">
                    The page you are looking for doesn't exist or has been moved. Let's get you back on track.
                </p>

                {/* Back to Home Button */}
                <Link 
                    to="/" 
                    className="group relative flex items-center justify-center h-12 px-6 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/25 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
                >
                    <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                    <HomeIcon className="size-4 mr-2 group-hover:-translate-y-0.5 transition-transform" />
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage;
