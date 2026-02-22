import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Layout from "./pages/Layout";
import { Toaster } from "react-hot-toast";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Team from "./pages/Team";
import ProjectDetails from "./pages/ProjectDetails";
import TaskDetails from "./pages/TaskDetails";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import LandingPage from "./pages/LandingPage";
import SettingsPage from "./pages/SettingsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { loadAuth } from "./features/authSlice";
import { loadTheme } from "./features/themeSlice";
import { fetchWorkspaces } from "./features/workspaceSlice";

const App = () => {
    const dispatch = useDispatch();
    const { currentUser, isAuthenticated } = useSelector((state) => state.auth);

    // Run auth + theme restore at the very top level, BEFORE any route renders
    useEffect(() => {
        dispatch(loadAuth());
        dispatch(loadTheme());
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // When user authenticates, load their workspaces
    useEffect(() => {
        if (isAuthenticated && currentUser?.id) {
            dispatch(fetchWorkspaces(currentUser.id));
        }
    }, [isAuthenticated, currentUser?.id, dispatch]);


    return (
        <>
            <Toaster />
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Layout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="projects" element={<Projects />} />
                        <Route path="team" element={<Team />} />
                        <Route path="projectsDetail" element={<ProjectDetails />} />
                        <Route path="taskDetails" element={<TaskDetails />} />
                        <Route path="settings" element={<SettingsPage />} />
                    </Route>
                </Route>
            </Routes>
        </>
    );
};

export default App;
