import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { Loader2Icon } from "lucide-react";

const ProtectedRoute = () => {
    const { isAuthenticated, authLoading } = useSelector((state) => state.auth);

    if (authLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-white dark:bg-zinc-950">
                <Loader2Icon className="size-7 text-blue-500 animate-spin" />
            </div>
        );
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
