import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Eye, EyeOff, LogIn, Loader2, AlertCircle } from "lucide-react";
import { loginUser, clearError } from "../features/authSlice";
import toast from "react-hot-toast";

const REMEMBER_EMAIL_KEY = "mp_remember_email";
const REMEMBER_ME_KEY = "mp_remember_me";

const LoginPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

    const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY) || "";
    const savedRemember = localStorage.getItem(REMEMBER_ME_KEY) === "true";

    const [formData, setFormData] = useState({ email: savedEmail, password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [rememberMe, setRememberMe] = useState(savedRemember);

    useEffect(() => {
        if (isAuthenticated) navigate("/dashboard", { replace: true });
    }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [error]); // eslint-disable-line react-hooks/exhaustive-deps

    const validate = (data) => {
        const errs = {};
        if (!data.email.trim()) errs.email = "Email is required.";
        else if (!/\S+@\S+\.\S+/.test(data.email)) errs.email = "Enter a valid email.";
        if (!data.password) errs.password = "Password is required.";
        return errs;
    };

    const handleChange = (field, value) => {
        const updated = { ...formData, [field]: value };
        setFormData(updated);
        if (touched[field]) {
            setFieldErrors(validate(updated));
        }
    };

    const handleBlur = (field) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        setFieldErrors(validate(formData));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setTouched({ email: true, password: true });
        const errs = validate(formData);
        setFieldErrors(errs);
        if (Object.keys(errs).length > 0) return;

        // Persist or clear "remember me" preference
        if (rememberMe) {
            localStorage.setItem(REMEMBER_EMAIL_KEY, formData.email);
            localStorage.setItem(REMEMBER_ME_KEY, "true");
        } else {
            localStorage.removeItem(REMEMBER_EMAIL_KEY);
            localStorage.removeItem(REMEMBER_ME_KEY);
        }

        dispatch(loginUser({ email: formData.email, password: formData.password }));
    };

    const inputClass = (field) =>
        `w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:border-transparent transition bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 ${fieldErrors[field] && touched[field]
            ? "border-red-400 dark:border-red-500 focus:ring-red-500/30"
            : "border-gray-200 dark:border-zinc-700 focus:ring-blue-500"
        }`;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex items-center justify-center p-4">

            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 dark:bg-indigo-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md animate-fade-in-up">
                <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/50 dark:border-zinc-800/50 rounded-2xl shadow-2xl shadow-slate-200/50 dark:shadow-black/30 p-8">

                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="size-16 mx-auto mb-4 flex items-center justify-center">
                            <img src="/favicon.ico" alt="ManagePoint" className="size-16 drop-shadow-lg" style={{ imageRendering: 'auto' }} />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Welcome back</h1>
                        <p className="text-sm text-gray-500 dark:text-zinc-400">Sign in to your workspace</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
                                Email address
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                                onBlur={() => handleBlur("email")}
                                placeholder="you@example.com"
                                autoComplete="email"
                                className={inputClass("email")}
                            />
                            {fieldErrors.email && touched.email && (
                                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="size-3 flex-shrink-0" /> {fieldErrors.email}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => handleChange("password", e.target.value)}
                                    onBlur={() => handleBlur("password")}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    className={`${inputClass("password")} pr-11`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((p) => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition"
                                >
                                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                </button>
                            </div>
                            {fieldErrors.password && touched.password && (
                                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="size-3 flex-shrink-0" /> {fieldErrors.password}
                                </p>
                            )}
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setRememberMe((prev) => !prev)}
                                className="flex items-center gap-2 cursor-pointer select-none group"
                            >
                                {/* Custom checkbox box */}
                                <span
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '1rem',
                                        height: '1rem',
                                        borderRadius: '4px',
                                        border: rememberMe ? '2px solid #3b82f6' : '2px solid #d1d5db',
                                        backgroundColor: rememberMe ? '#3b82f6' : 'transparent',
                                        flexShrink: 0,
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    {rememberMe && (
                                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </span>
                                <span className="text-sm text-gray-600 dark:text-zinc-300 group-hover:text-gray-900 dark:group-hover:text-white transition">
                                    Remember me
                                </span>
                            </button>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0"
                        >
                            {loading ? (
                                <><Loader2 className="size-4 animate-spin" /> Signing in…</>
                            ) : (
                                <><LogIn className="size-4" /> Sign in</>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-6 flex items-center gap-4">
                        <div className="flex-1 h-px bg-gray-200 dark:bg-zinc-700" />
                        <span className="text-xs text-gray-400 dark:text-zinc-500">or</span>
                        <div className="flex-1 h-px bg-gray-200 dark:bg-zinc-700" />
                    </div>

                    {/* Links */}
                    <p className="text-center text-sm text-gray-500 dark:text-zinc-400 mb-3">
                        Don&apos;t have an account?{" "}
                        <Link to="/register" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline transition">
                            Create one
                        </Link>
                    </p>
                    <p className="text-center text-sm text-gray-400 dark:text-zinc-500">
                        <Link to="/" className="hover:text-blue-500 dark:hover:text-blue-400 transition">
                            ← Back to home
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
