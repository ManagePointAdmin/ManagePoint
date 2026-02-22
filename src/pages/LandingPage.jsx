import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "../features/themeSlice";
import {
    CheckCircle2, BarChart3, Users, Calendar, ArrowRight,
    Shield, Globe, Moon, Sun, Layers, Target, TrendingUp,
    MessageSquare, Star
} from "lucide-react";

const features = [
    {
        icon: Layers,
        title: "Project Management",
        description: "Organize projects with tasks, milestones, and timelines. Get a bird's-eye view of everything happening across your team.",
        color: "from-blue-500 to-blue-600",
        bg: "bg-blue-50 dark:bg-blue-500/10",
    },
    {
        icon: Users,
        title: "Team Collaboration",
        description: "Invite members, assign roles, and work together seamlessly. Everyone stays on the same page, all the time.",
        color: "from-violet-500 to-violet-600",
        bg: "bg-violet-50 dark:bg-violet-500/10",
    },
    {
        icon: BarChart3,
        title: "Analytics & Insights",
        description: "Track project progress, team velocity, and task completion rates with beautiful, actionable dashboards.",
        color: "from-emerald-500 to-emerald-600",
        bg: "bg-emerald-50 dark:bg-emerald-500/10",
    },
    {
        icon: Calendar,
        title: "Smart Calendar",
        description: "Visualize deadlines and sprints on an interactive calendar. Never miss a milestone again.",
        color: "from-orange-500 to-orange-600",
        bg: "bg-orange-50 dark:bg-orange-500/10",
    },
    {
        icon: Target,
        title: "Task Prioritization",
        description: "Set priorities and statuses to keep the team focused on what matters most — right now.",
        color: "from-rose-500 to-rose-600",
        bg: "bg-rose-50 dark:bg-rose-500/10",
    },
    {
        icon: TrendingUp,
        title: "Progress Tracking",
        description: "Real-time progress indicators and completion stats give you instant clarity on project health.",
        color: "from-cyan-500 to-cyan-600",
        bg: "bg-cyan-50 dark:bg-cyan-500/10",
    },
];

const stats = [
    { value: "10k+", label: "Teams using ManagePoint" },
    { value: "99.9%", label: "Uptime guaranteed" },
    { value: "50+", label: "Integrations available" },
    { value: "4.9★", label: "Average user rating" },
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
    { step: "01", title: "Create your workspace", desc: "Set up your team workspace in seconds. Invite your colleagues and you're ready to go." },
    { step: "02", title: "Add your projects", desc: "Create projects, set priorities, and define milestones to keep everyone aligned." },
    { step: "03", title: "Assign & collaborate", desc: "Assign tasks, track progress, and communicate — all in one beautiful interface." },
];

export default function LandingPage() {
    const dispatch = useDispatch();
    const { theme } = useSelector((state) => state.theme);

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 text-gray-900 dark:text-white overflow-x-hidden">

            {/* ── Navbar ─────────────────────────────────────────────── */}
            <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src="/favicon.ico" alt="ManagePoint" className="w-8 h-8 rounded-lg" />
                        <span className="text-lg font-bold text-gray-900 dark:text-white">ManagePoint</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm text-gray-600 dark:text-zinc-400">
                        <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Features</a>
                        <a href="#how-it-works" className="hover:text-blue-600 dark:hover:text-blue-400 transition">How it works</a>
                        <a href="#testimonials" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Testimonials</a>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => dispatch(toggleTheme())}
                            className="size-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
                        >
                            {theme === "light"
                                ? <Moon className="size-4 text-gray-600" />
                                : <Sun className="size-4 text-yellow-400" />}
                        </button>
                        <Link
                            to="/login"
                            className="text-sm font-medium text-gray-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition px-3 py-1.5"
                        >
                            Sign in
                        </Link>
                        <Link
                            to="/register"
                            className="text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-1.5 rounded-lg shadow-lg shadow-blue-500/20 transition"
                        >
                            Get started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ── Hero Section ────────────────────────────────────────── */}
            <section className="relative overflow-hidden pt-20 pb-24 px-4">
                {/* Background blobs */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-violet-400/20 dark:bg-violet-500/10 rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-medium mb-8">
                        <Star className="size-3 fill-current" />
                        Trusted by 10,000+ teams worldwide
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6 leading-tight">
                        Manage projects with{" "}
                        <span className="bg-gradient-to-r from-blue-500 to-violet-600 bg-clip-text text-transparent">
                            clarity and purpose
                        </span>
                    </h1>

                    <p className="text-lg sm:text-xl text-gray-600 dark:text-zinc-400 max-w-3xl mx-auto mb-10 leading-relaxed">
                        ManagePoint brings your team, projects, and work together in one powerful workspace.
                        Plan smarter, collaborate better, and ship faster.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/register"
                            className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium shadow-xl shadow-blue-500/30 transition-all duration-200 hover:shadow-blue-500/40 hover:-translate-y-0.5"
                        >
                            Get started free
                            <ArrowRight className="size-4" />
                        </Link>
                        <Link
                            to="/login"
                            className="flex items-center gap-2 px-7 py-3.5 rounded-xl border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 font-medium hover:bg-gray-50 dark:hover:bg-zinc-800/60 transition-all duration-200"
                        >
                            Sign in to workspace
                        </Link>
                    </div>

                    {/* Trust badges */}
                    <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 dark:text-zinc-500">
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="size-4 text-emerald-500" /> No credit card required</span>
                        <span className="flex items-center gap-1.5"><Shield className="size-4 text-blue-500" /> Enterprise-grade security</span>
                        <span className="flex items-center gap-1.5"><Globe className="size-4 text-violet-500" /> Available worldwide</span>
                    </div>
                </div>
            </section>

            {/* ── Stats ───────────────────────────────────────────────── */}
            <section className="py-16 bg-gray-50 dark:bg-zinc-900/50 border-y border-gray-200 dark:border-zinc-800">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat) => (
                            <div key={stat.label} className="text-center">
                                <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-500 to-violet-600 bg-clip-text text-transparent">{stat.value}</p>
                                <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Features ────────────────────────────────────────────── */}
            <section id="features" className="py-24 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Features</span>
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-4">
                            Everything your team needs
                        </h2>
                        <p className="text-gray-600 dark:text-zinc-400 max-w-xl mx-auto">
                            A complete project management solution built for modern teams that move fast.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature) => (
                            <div
                                key={feature.title}
                                className="group p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-blue-300 dark:hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-200"
                            >
                                <div className={`inline-flex p-3 rounded-xl ${feature.bg} mb-4`}>
                                    <feature.icon className={`size-6 bg-gradient-to-br ${feature.color} bg-clip-text`} style={{ color: 'transparent', filter: 'none' }} />
                                    <feature.icon className={`size-6 hidden`} />
                                    {/* simple icon with color */}
                                    <feature.icon className={`size-6 text-blue-600 dark:text-blue-400 -ml-6`} />
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── How it works ────────────────────────────────────────── */}
            <section id="how-it-works" className="py-24 px-4 bg-gray-50 dark:bg-zinc-900/50">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">How it works</span>
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-4">
                            Up and running in minutes
                        </h2>
                        <p className="text-gray-600 dark:text-zinc-400">
                            No complex setup. No steep learning curve. Just results.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {steps.map((step, i) => (
                            <div key={step.step} className="relative text-center">
                                {i < steps.length - 1 && (
                                    <div className="hidden md:block absolute top-10 left-[60%] w-full h-px border-t-2 border-dashed border-gray-300 dark:border-zinc-700" />
                                )}
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white text-2xl font-bold shadow-lg shadow-blue-500/20 mb-4">
                                    {step.step}
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-zinc-400">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Testimonials ────────────────────────────────────────── */}
            <section id="testimonials" className="py-24 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Testimonials</span>
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mt-2">
                            Loved by teams everywhere
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {testimonials.map((t) => (
                            <div key={t.name} className="p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="size-3.5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-sm text-gray-700 dark:text-zinc-300 mb-5 leading-relaxed">"{t.text}"</p>
                                <div className="flex items-center gap-3">
                                    <div className={`size-9 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold`}>
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{t.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-zinc-500">{t.role}, {t.company}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA Section ─────────────────────────────────────────── */}
            <section className="py-24 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="p-10 rounded-3xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-2xl shadow-blue-500/20 relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/5 rounded-3xl" />
                        <div className="relative z-10">
                            <MessageSquare className="size-10 text-white/80 mx-auto mb-4" />
                            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                                Ready to take control?
                            </h2>
                            <p className="text-blue-100 mb-8 text-lg">
                                Join thousands of teams who use ManagePoint to get more done.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link
                                    to="/register"
                                    className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-blue-600 font-semibold hover:bg-blue-50 transition shadow-lg"
                                >
                                    Start for free
                                    <ArrowRight className="size-4" />
                                </Link>
                                <Link
                                    to="/login"
                                    className="flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/30 text-white font-medium hover:bg-white/10 transition"
                                >
                                    Sign in
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Footer ──────────────────────────────────────────────── */}
            <footer className="border-t border-gray-200 dark:border-zinc-800 py-10 px-4">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-zinc-500">
                    <div className="flex items-center gap-2">
                        <img src="/favicon.ico" alt="ManagePoint" className="w-6 h-6 rounded" />
                        <span className="font-semibold text-gray-700 dark:text-zinc-300">ManagePoint</span>
                    </div>
                    <p>© {new Date().getFullYear()} ManagePoint. All rights reserved.</p>
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Sign in</Link>
                        <Link to="/register" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Register</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
