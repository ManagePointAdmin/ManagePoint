import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Plus, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentWorkspace, deleteWorkspace } from "../features/workspaceSlice";
import { useNavigate } from "react-router-dom";
import CreateWorkspaceDialog from "./CreateWorkspaceDialog";
import ConfirmDialog from "./ConfirmDialog";
import toast from "react-hot-toast";

function WorkspaceDropdown() {

    const { workspaces } = useSelector((state) => state.workspace);
    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace || null);
    const { currentUser } = useSelector((state) => state.auth);
    const [isOpen, setIsOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    
    // Deletion states
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [wsToDelete, setWsToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const dropdownRef = useRef(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const onSelectWorkspace = (workspaceId) => {
        dispatch(setCurrentWorkspace(workspaceId))
        setIsOpen(false);
        navigate('/dashboard')
    }

    const handleDeleteClick = (e, ws) => {
        e.stopPropagation(); // prevent selecting the workspace
        setWsToDelete(ws);
        setIsConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!wsToDelete) return;
        setIsDeleting(true);
        try {
            await dispatch(deleteWorkspace(wsToDelete.id)).unwrap();
            toast.success("Workspace deleted successfully!");
            setIsConfirmOpen(false);
            setWsToDelete(null);
        } catch (err) {
            toast.error(err || "Failed to delete workspace");
        } finally {
            setIsDeleting(false);
        }
    };

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <>
            <div className="relative m-4" ref={dropdownRef}>
                <button onClick={() => setIsOpen(prev => !prev)} className="w-full flex items-center justify-between p-3 h-auto text-left rounded hover:bg-gray-100 dark:hover:bg-zinc-800" >
                    <div className="flex items-center gap-3">
                        {currentWorkspace?.image_url ? (
                            <img src={currentWorkspace.image_url} alt={currentWorkspace.name} className="w-8 h-8 rounded-lg shadow object-cover flex-shrink-0" />
                        ) : (
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shadow flex-shrink-0">
                                {currentWorkspace?.name?.[0]?.toUpperCase() || "W"}
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">
                                {currentWorkspace?.name || "Select Workspace"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                                {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-zinc-400 flex-shrink-0" />
                </button>

                {isOpen && (
                    <div className="absolute z-50 w-64 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded shadow-lg top-full left-0">
                        <div className="p-2">
                            <p className="text-xs text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2 px-2">
                                Workspaces
                            </p>
                            {workspaces.map((ws) => {
                                // Check if current user is ADMIN of this workspace
                                const isAdmin = ws.members?.find(m => m.userId === currentUser?.id)?.role === 'ADMIN';

                                return (
                                    <div key={ws.id} onClick={() => onSelectWorkspace(ws.id)} className="flex items-center gap-3 p-2 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-zinc-800 group" >
                                        {ws.image_url ? (
                                            <img src={ws.image_url} alt={ws.name} className="w-6 h-6 rounded" />
                                        ) : (
                                            <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                {ws.name?.[0]?.toUpperCase()}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                                                {ws.name}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                                                {ws.members?.length || 0} members
                                            </p>
                                        </div>
                                        {currentWorkspace?.id === ws.id && (
                                            <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                        )}
                                        {isAdmin && (
                                            <button 
                                                onClick={(e) => handleDeleteClick(e, ws)}
                                                className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition"
                                                title="Delete Workspace"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                            {workspaces.length === 0 && (
                                <p className="text-xs text-gray-400 dark:text-zinc-500 px-2 py-2">No workspaces yet.</p>
                            )}
                        </div>

                        <hr className="border-gray-200 dark:border-zinc-700" />

                        <div
                            className="p-2 cursor-pointer rounded group hover:bg-gray-100 dark:hover:bg-zinc-800"
                            onClick={() => {
                                setIsOpen(false);
                                setIsCreateDialogOpen(true);
                            }}
                        >
                            <p className="flex items-center text-xs gap-2 my-1 w-full text-blue-600 dark:text-blue-400 group-hover:text-blue-500 dark:group-hover:text-blue-300">
                                <Plus className="w-4 h-4" /> Create Workspace
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <CreateWorkspaceDialog
                isDialogOpen={isCreateDialogOpen}
                setIsDialogOpen={setIsCreateDialogOpen}
            />

            <ConfirmDialog 
                isOpen={isConfirmOpen}
                loading={isDeleting}
                title="Delete Workspace"
                message={`Are you sure you want to delete "${wsToDelete?.name}"? This will permanently remove all related projects and tasks. This action cannot be undone.`}
                confirmLabel="Delete Workspace"
                onConfirm={handleConfirmDelete}
                onCancel={() => { setIsConfirmOpen(false); setWsToDelete(null); }}
            />
        </>
    );
}

export default WorkspaceDropdown;
