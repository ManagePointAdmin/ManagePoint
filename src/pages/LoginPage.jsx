import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Eye, EyeOff, LogIn, Loader2, AlertCircle } from "lucide-react";
import { loginUser, loginWithGoogle, clearError } from "../features/authSlice";
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
    const [emailSuggestions, setEmailSuggestions] = useState([]);
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
        if (touched[field]) setFieldErrors(validate(updated));

        if (field === "email") {
            const atIndex = value.indexOf("@");
            if (atIndex !== -1 && !value.slice(atIndex).includes(".")) {
                const afterAt = value.slice(atIndex + 1);
                const domains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"];
                setEmailSuggestions(domains.filter(d => d.startsWith(afterAt)));
            } else {
                setEmailSuggestions([]);
            }
        }
    };;

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
                <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/50 dark:border-zinc-800/50 rounded-2xl shadow-2xl shadow-slate-200/50 dark:shadow-black/30 p-6 md:p-7">

                    {/* Header */}
                    <div className="mb-5 text-center">
                        <div className="size-12 mx-auto mb-4 flex items-center justify-center">
                            <img src="/favicon.ico" alt="ManagePoint" className="size-12 drop-shadow-lg" style={{ imageRendering: 'auto' }} />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Welcome back</h1>
                        <p className="text-sm text-gray-500 dark:text-zinc-400">Sign in to your workspace</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
                                Email address
                            </label>
                                                        <div className="relative">
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange("email", e.target.value)}
                                    onBlur={() => { handleBlur("email"); setTimeout(() => setEmailSuggestions([]), 200); }}
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    className={`${inputClass("email")} relative z-10`}
                                />
                                {emailSuggestions.length > 0 && (
                                    <ul className="absolute z-20 w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl mt-1 shadow-lg py-1 max-h-40 overflow-y-auto">
                                        {emailSuggestions.map((dom) => (
                                            <li 
                                                key={dom} 
                                                onClick={() => {
                                                    const atIndex = formData.email.indexOf('@');
                                                    const base = formData.email.slice(0, atIndex + 1);
                                                    setFormData({ ...formData, email: base + dom });
                                                    setEmailSuggestions([]);
                                                }}
                                                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer text-sm text-gray-700 dark:text-zinc-300 transition-colors"
                                            >
                                                {formData.email.slice(0, formData.email.indexOf('@') + 1)}{dom}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
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
                                         {/* Divider */}
                     <div className="my-4 flex items-center gap-4">
                         <div className="flex-1 h-px bg-gray-200 dark:bg-zinc-700" />
                         <span className="text-xs text-gray-400 dark:text-zinc-500">or</span>
                         <div className="flex-1 h-px bg-gray-200 dark:bg-zinc-700" />
                     </div>

                     {/* Google Auth */}
                     <button
                         type="button"
                         onClick={() => dispatch(loginWithGoogle())}
                         className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 text-sm font-medium text-gray-700 dark:text-zinc-300 transition mb-3"
                     >
                         <svg className="size-4" viewBox="0 0 24 24">
                             <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                             <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                             <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                             <path d="M12 5.38c1.62 0 3.07.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                         </svg>
                         Connect with Google
                     </button>

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
