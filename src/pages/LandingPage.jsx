import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "../features/themeSlice";
import {
    CheckCircle2, BarChart3, Users, Calendar, ArrowRight,
    Shield, Globe, Moon, Sun, Layers, Target, TrendingUp,
    MessageSquare, Star, Zap
} from "lucide-react";

const features = [
    {
        icon: Layers,
        title: "Project Management",
        description: "Organize projects with tasks, milestones, and timelines for complete visibility.",
        iconColor: "text-blue-500",
        bg: "bg-blue-50 dark:bg-blue-500/10",
    },
    {
        icon: Users,
        title: "Team Collaboration",
        description: "Invite members, assign roles, and keep everyone perfectly in sync.",
        iconColor: "text-violet-500",
        bg: "bg-violet-50 dark:bg-violet-500/10",
    },
    {
        icon: BarChart3,
        title: "Analytics & Insights",
        description: "Track velocity, completion rates, and project health at a glance.",
        iconColor: "text-emerald-500",
        bg: "bg-emerald-50 dark:bg-emerald-500/10",
    },
    {
        icon: Calendar,
        title: "Smart Calendar",
        description: "Visualize deadlines and sprints on an interactive, drag-friendly calendar.",
        iconColor: "text-orange-500",
        bg: "bg-orange-50 dark:bg-orange-500/10",
    },
    {
        icon: Target,
        title: "Task Prioritization",
        description: "Set priorities to keep the team laser-focused on what matters most.",
        iconColor: "text-rose-500",
        bg: "bg-rose-50 dark:bg-rose-500/10",
    },
    {
        icon: TrendingUp,
        title: "Progress Tracking",
        description: "Real-time progress indicators give you instant clarity on project health.",
        iconColor: "text-cyan-500",
        bg: "bg-cyan-50 dark:bg-cyan-500/10",
    },
];

const stats = [
    { value: "10k+", label: "Teams worldwide" },
    { value: "99.9%", label: "Uptime SLA" },
    { value: "50+", label: "Integrations" },
    { value: "4.9★", label: "User rating" },
];

const testimonials = [
    {
        name: "Sarah Chen",
        role: "Engineering Lead",
        company: "TechCorp",
        text: "ManagePoint transformed how our team works. We ship 40% faster now.",
        avatar: "SC",
        color: "bg-blue-500",
    },
    {
        name: "Marcus Rivera",
        role: "Product Manager",
        company: "Startup Inc.",
        text: "The analytics features are incredible. I finally have full visibility across all my projects.",
        avatar: "MR",
        color: "bg-violet-500",
    },
    {
        name: "Priya Patel",
        role: "Design Director",
        company: "CreativeStudio",
        text: "Clean, intuitive, powerful. This is the project tool we always wished existed.",
        avatar: "PP",
        color: "bg-emerald-500",
    },
];

const steps = [
    { step: "01", title: "Create your workspace", desc: "Set up your team workspace in seconds and invite your colleagues." },
    { step: "02", title: "Add your projects", desc: "Create projects, set priorities, and define milestones to align everyone." },
    { step: "03", title: "Assign and collaborate", desc: "Assign tasks, track progress, and communicate — all in one place." },
];

export default function LandingPage() {
    const dispatch = useDispatch();
    const { theme } = useSelector((state) => state.theme);

    return (
        <div className="min-h-screen bg-white dark:bg-[#0d0f1a] text-gray-900 dark:text-white overflow-x-hidden">

            {/* ── Navbar ─────────────────────────────────────────────── */}
            <nav className="sticky top-0 z-50 bg-white/90 dark:bg-[#0d0f1a]/90 backdrop-blur-xl border-b border-gray-200 dark:border-white/5">
                <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2.5 flex-shrink-0">
                        <img src="/favicon.ico" alt="ManagePoint" className="w-8 h-8 rounded-lg" />
                        <span className="text-base font-bold text-gray-900 dark:text-white">ManagePoint</span>
                    </div>

                    {/* Nav links */}
                    <div className="hidden md:flex items-center gap-8 text-sm text-gray-500 dark:text-zinc-400">
                        <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Features</a>
                        <a href="#how-it-works" className="hover:text-blue-600 dark:hover:text-blue-400 transition">How it works</a>
                        <a href="#testimonials" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Testimonials</a>
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => dispatch(toggleTheme())}
                            className="size-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition"
                        >
                            {theme === "light"
                                ? <Moon className="size-4 text-gray-500" />
                                : <Sun className="size-4 text-yellow-400" />}
                        </button>
                        <Link
                            to="/login"
                            className="hidden sm:block text-sm font-medium text-gray-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition px-4 py-2"
                        >
                            Sign in
                        </Link>
                        <Link
                            to="/register"
                            className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg shadow-blue-600/20 transition"
                        >
                            Get started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ── Hero ───────────────────────────────────────────────── */}
            <section className="relative overflow-hidden">
                {/* Background glows */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl" />
                    <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-violet-500/10 dark:bg-violet-600/5 rounded-full blur-3xl" />
                    <div className="absolute top-20 left-0 w-[400px] h-[400px] bg-cyan-500/10 dark:bg-cyan-600/5 rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-24 pb-28 text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-semibold mb-8 tracking-wide">
                        <Star className="size-3 fill-current" />
                        Trusted by 10,000+ teams worldwide
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 leading-[1.1]">
                        Manage projects with{" "}
                        <span className="bg-gradient-to-r from-blue-500 via-violet-500 to-purple-600 bg-clip-text text-transparent">
                            clarity &amp; purpose
                        </span>
                    </h1>

                    {/* Sub-headline */}
                    <p className="text-lg sm:text-xl text-gray-500 dark:text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        ManagePoint brings your team, projects, and work together in one powerful workspace.
                        Plan smarter, collaborate better, ship faster.
                    </p>

                    {/* CTA buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
                        <Link
                            to="/register"
                            className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xl shadow-blue-600/25 transition-all hover:-translate-y-0.5 text-base"
                        >
                            Get started free <ArrowRight className="size-4" />
                        </Link>
                        <Link
                            to="/login"
                            className="flex items-center gap-2 px-8 py-3.5 rounded-xl border border-gray-300 dark:border-white/10 text-gray-700 dark:text-zinc-200 font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-base"
                        >
                            Sign in to workspace
                        </Link>
                    </div>

                    {/* Trust badges */}
                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400 dark:text-zinc-500">
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="size-4 text-emerald-500" /> No credit card required</span>
                        <span className="flex items-center gap-1.5"><Shield className="size-4 text-blue-500" /> Enterprise-grade security</span>
                        <span className="flex items-center gap-1.5"><Globe className="size-4 text-violet-500" /> Available worldwide</span>
                    </div>
                </div>
            </section>

            {/* ── Stats ───────────────────────────────────────────────── */}
            <section className="border-y border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
                <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat) => (
                            <div key={stat.label} className="text-center">
                                <p className="text-4xl font-extrabold bg-gradient-to-r from-blue-500 to-violet-600 bg-clip-text text-transparent tabular-nums">
                                    {stat.value}
                                </p>
                                <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Features ────────────────────────────────────────────── */}
            <section id="features" className="py-24 scroll-mt-16">
                <div className="max-w-7xl mx-auto px-6 lg:px-10">
                    <div className="text-center mb-16">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">
                            <Zap className="size-3.5" /> Features
                        </span>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                            Everything your team needs
                        </h2>
                        <p className="text-gray-500 dark:text-zinc-400 max-w-xl mx-auto text-lg">
                            A complete project management solution built for modern teams that move fast.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature) => (
                            <div
                                key={feature.title}
                                className="group p-7 rounded-2xl border border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.02] hover:border-blue-300 dark:hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5 dark:hover:shadow-blue-500/5 transition-all duration-200"
                            >
                                <div className={`inline-flex p-3 rounded-xl ${feature.bg} mb-5`}>
                                    <feature.icon className={`size-6 ${feature.iconColor}`} />
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── How it works ────────────────────────────────────────── */}
            <section id="how-it-works" className="py-24 bg-gray-50 dark:bg-white/[0.02] border-y border-gray-100 dark:border-white/5 scroll-mt-16">
                <div className="max-w-7xl mx-auto px-6 lg:px-10">
                    <div className="text-center mb-16">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3 block">
                            How it works
                        </span>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                            Up and running in minutes
                        </h2>
                        <p className="text-gray-500 dark:text-zinc-400 text-lg">
                            No complex setup. No steep learning curve. Just results.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {steps.map((step, i) => (
                            <div key={step.step} className="relative text-center">
                                {i < steps.length - 1 && (
                                    <div className="hidden md:block absolute top-10 left-[62%] w-full h-px border-t-2 border-dashed border-gray-300 dark:border-white/10" />
                                )}
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-white text-2xl font-extrabold shadow-lg shadow-blue-500/20 mb-5">
                                    {step.step}
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Testimonials ──────────────────────────────────────── */}
            <section id="testimonials" className="py-24 scroll-mt-16">
                <div className="max-w-7xl mx-auto px-6 lg:px-10">
                    <div className="text-center mb-16">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3 block">
                            Testimonials
                        </span>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                            Loved by teams everywhere
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {testimonials.map((t) => (
                            <div key={t.name} className="flex flex-col p-7 rounded-2xl border border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.02]">
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="size-3.5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-zinc-300 mb-6 leading-relaxed flex-1">"{t.text}"</p>
                                <div className="flex items-center gap-3">
                                    <div className={`size-10 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</p>
                                        <p className="text-xs text-gray-400 dark:text-zinc-500">{t.role} · {t.company}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ────────────────────────────────────────────────── */}
            <section className="py-24 bg-gray-50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/5">
                <div className="max-w-7xl mx-auto px-6 lg:px-10">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-violet-700 p-12 sm:p-16 text-center shadow-2xl shadow-blue-600/20">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none" />
                        <div className="relative z-10">
                            <MessageSquare className="size-12 text-white/70 mx-auto mb-6" />
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
                                Ready to take control?
                            </h2>
                            <p className="text-blue-100 mb-10 text-lg max-w-xl mx-auto">
                                Join thousands of teams who use ManagePoint to plan smarter and ship faster.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link
                                    to="/register"
                                    className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-blue-700 font-bold hover:bg-blue-50 transition shadow-xl text-base"
                                >
                                    Start for free <ArrowRight className="size-4" />
                                </Link>
                                <Link
                                    to="/login"
                                    className="flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/30 text-white font-medium hover:bg-white/10 transition text-base"
                                >
                                    Sign in
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Footer ──────────────────────────────────────────────── */}
            <footer className="border-t border-gray-200 dark:border-white/5 py-10">
                <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400 dark:text-zinc-500">
                    <div className="flex items-center gap-2">
                        <img src="/favicon.ico" alt="ManagePoint" className="w-6 h-6 rounded" />
                        <span className="font-semibold text-gray-700 dark:text-zinc-300">ManagePoint</span>
                    </div>
                    <p>© {new Date().getFullYear()} ManagePoint. All rights reserved.</p>
                    <div className="flex items-center gap-5">
                        <Link to="/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Sign in</Link>
                        <Link to="/register" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Register</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
