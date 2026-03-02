import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

/**
 * Reusable confirmation dialog for destructive actions.
 *
 * @param {object} props
 * @param {boolean}  props.isOpen
 * @param {string}   props.title
 * @param {string}   props.message
 * @param {string}   [props.confirmLabel]
 * @param {string}   [props.cancelLabel]
 * @param {Function} props.onConfirm
 * @param {Function} props.onCancel
 * @param {boolean}  [props.loading]
 */
const ConfirmDialog = ({
    isOpen,
    title = "Are you sure?",
    message = "This action cannot be undone.",
    confirmLabel = "Delete",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
    loading = false,
}) => {
    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => { if (e.key === "Escape") onCancel(); };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in"
            onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Dialog */}
            <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl shadow-2xl animate-scale-in p-6">
                {/* Close button */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
                >
                    <X className="size-4" />
                </button>

                {/* Icon */}
                <div className="mb-4 flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/15 mx-auto">
                    <AlertTriangle className="size-6 text-red-500 dark:text-red-400" />
                </div>

                {/* Content */}
                <div className="text-center mb-6">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">{title}</h2>
                    <p className="text-sm text-gray-500 dark:text-zinc-400">{message}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition disabled:opacity-60"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? "Deleting…" : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
