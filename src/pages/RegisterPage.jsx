import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Eye, EyeOff, UserPlus, Loader2, AlertCircle } from "lucide-react";
import { registerUser, clearError } from "../features/authSlice";
import toast from "react-hot-toast";

/** Returns [score 0-4, label, color] */
const getPasswordStrength = (password) => {
    if (!password) return [0, "", ""];
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const levels = [
        [1, "Weak", "bg-red-500"],
        [2, "Fair", "bg-amber-500"],
        [3, "Good", "bg-blue-500"],
        [4, "Strong", "bg-emerald-500"],
    ];
    const [, label, color] = levels[score - 1] || [0, "", ""];
    return [score, label, color];
};

const RegisterPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [touched, setTouched] = useState({});

    useEffect(() => {
        if (isAuthenticated) navigate("/dashboard", { replace: true });
    }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (error) { toast.error(error); dispatch(clearError()); }
    }, [error]); // eslint-disable-line react-hooks/exhaustive-deps

    const validate = (data) => {
        const errs = {};
        if (!data.name.trim()) errs.name = "Name is required.";
        if (!data.email.trim()) errs.email = "Email is required.";
        else if (!/\S+@\S+\.\S+/.test(data.email)) errs.email = "Enter a valid email.";
        if (!data.password) errs.password = "Password is required.";
        else if (data.password.length < 6) errs.password = "At least 6 characters required.";
        if (!data.confirmPassword) errs.confirmPassword = "Please confirm your password.";
        else if (data.password !== data.confirmPassword) errs.confirmPassword = "Passwords do not match.";
        return errs;
    };

    const handleChange = (field, value) => {
        const updated = { ...formData, [field]: value };
        setFormData(updated);
        if (touched[field]) setFieldErrors(validate(updated));
    };

    const handleBlur = (field) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        setFieldErrors(validate(formData));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setTouched({ name: true, email: true, password: true, confirmPassword: true });
        const errs = validate(formData);
        setFieldErrors(errs);
        if (Object.keys(errs).length > 0) return;
        dispatch(registerUser({ name: formData.name.trim(), email: formData.email, password: formData.password }));
    };

    const inputClass = (field) =>
        `w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:border-transparent transition bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 ${fieldErrors[field] && touched[field]
            ? "border-red-400 dark:border-red-500 focus:ring-red-500/30"
            : "border-gray-200 dark:border-zinc-700 focus:ring-indigo-500"
        }`;

    const [pwScore, pwLabel, pwColor] = getPasswordStrength(formData.password);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex items-center justify-center p-4">

            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-400/20 dark:bg-indigo-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md animate-fade-in-up">
                <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/50 dark:border-zinc-800/50 rounded-2xl shadow-2xl shadow-slate-200/50 dark:shadow-black/30 p-8">

                    {/* Header */}
                    <div className="mb-7 text-center">
                        <div className="size-16 mx-auto mb-4 flex items-center justify-center">
                            <img src="/favicon.ico" alt="ManagePoint" className="size-16 drop-shadow-lg" style={{ imageRendering: 'auto' }} />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Create an account</h1>
                        <p className="text-sm text-gray-500 dark:text-zinc-400">Join your workspace today</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Full name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                onBlur={() => handleBlur("name")}
                                placeholder="John Doe"
                                autoComplete="name"
                                className={inputClass("name")}
                            />
                            {fieldErrors.name && touched.name && (
                                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="size-3 flex-shrink-0" /> {fieldErrors.name}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Email address</label>
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
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => handleChange("password", e.target.value)}
                                    onBlur={() => handleBlur("password")}
                                    placeholder="Min. 6 characters"
                                    autoComplete="new-password"
                                    className={`${inputClass("password")} pr-11`}
                                />
                                <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition">
                                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                </button>
                            </div>
                            {/* Password strength meter */}
                            {formData.password && (
                                <div className="mt-2">
                                    <div className="flex gap-1 mb-1">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className={`strength-bar flex-1 ${i <= pwScore ? pwColor : "bg-gray-200 dark:bg-zinc-700"}`} />
                                        ))}
                                    </div>
                                    <p className="text-xs text-zinc-400 dark:text-zinc-500">
                                        Strength: <span className={`font-medium ${pwColor.replace("bg-", "text-")}`}>{pwLabel || "—"}</span>
                                    </p>
                                </div>
                            )}
                            {fieldErrors.password && touched.password && (
                                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="size-3 flex-shrink-0" /> {fieldErrors.password}
                                </p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Confirm password</label>
                            <div className="relative">
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                                    onBlur={() => handleBlur("confirmPassword")}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    className={`${inputClass("confirmPassword")} pr-11`}
                                />
                                <button type="button" onClick={() => setShowConfirm((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition">
                                    {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                </button>
                            </div>
                            {fieldErrors.confirmPassword && touched.confirmPassword && (
                                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="size-3 flex-shrink-0" /> {fieldErrors.confirmPassword}
                                </p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all duration-200 mt-2 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0"
                        >
                            {loading ? (
                                <><Loader2 className="size-4 animate-spin" /> Creating account…</>
                            ) : (
                                <><UserPlus className="size-4" /> Create account</>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-6 flex items-center gap-4">
                        <div className="flex-1 h-px bg-gray-200 dark:bg-zinc-700" />
                        <span className="text-xs text-gray-400 dark:text-zinc-500">or</span>
                        <div className="flex-1 h-px bg-gray-200 dark:bg-zinc-700" />
                    </div>

                    <p className="text-center text-sm text-gray-500 dark:text-zinc-400">
                        Already have an account?{" "}
                        <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline transition">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
