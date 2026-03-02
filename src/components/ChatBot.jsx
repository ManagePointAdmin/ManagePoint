import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, ChevronDown, Sparkles } from "lucide-react";

// ── Knowledge base ───────────────────────────────────────────────────────────
const KB = [
    {
        patterns: ["create project", "new project", "add project", "make project"],
        answer: "To create a new project: go to **Projects** in the sidebar → click **\"New Project\"** in the top-right → fill in the name, description, status, priority, dates, and lead → click **Create Project**."
    },
    {
        patterns: ["create task", "new task", "add task", "make task"],
        answer: "To create a task: open any project → go to the **Tasks** tab → click **\"New Task\"** → fill in the title, type, priority, assignee, and due date → click **Create Task**."
    },
    {
        patterns: ["invite", "add member", "team member", "add user"],
        answer: "To invite a team member: open the **Team** page → click **\"Invite Member\"** → enter their email address → click **Send Invite**. If they're already registered, they'll be added instantly. Otherwise, they'll receive an email invitation."
    },
    {
        patterns: ["profile", "avatar", "photo", "picture", "change photo"],
        answer: "To update your profile photo: go to **Settings** → **Profile** tab → click the circular avatar (or \"Change profile photo\") → select a JPG/PNG image → preview it → click **Save photo**."
    },
    {
        patterns: ["dark mode", "theme", "light mode", "appearance"],
        answer: "To toggle dark/light mode: go to **Settings** → **Appearance** tab → click either the **Light** or **Dark** card. You can also click the 🌙 icon in the top Navbar for quick toggle."
    },
    {
        patterns: ["workspace", "create workspace", "new workspace", "switch workspace"],
        answer: "To create a workspace: click the **workspace name** in the top-left sidebar → choose **Create Workspace** → give it a name and optional description. To switch workspaces, click the same workspace name and select from your list."
    },
    {
        patterns: ["delete task", "remove task"],
        answer: "To delete a task: open the task from the **Tasks** tab inside a project → look for the delete/trash icon in the task details or task card menu."
    },
    {
        patterns: ["delete project", "remove project"],
        answer: "To delete a project: open the project → go to **Settings** tab inside the project → scroll to the **Danger Zone** → click **Delete Project** and confirm."
    },
    {
        patterns: ["analytics", "chart", "progress", "stats"],
        answer: "Each project has an **Analytics** tab that shows task distribution by status, priority breakdown, progress over time, and member activity charts."
    },
    {
        patterns: ["calendar", "due date", "deadline", "schedule"],
        answer: "Each project has a **Calendar** tab that shows all tasks plotted by their due dates. You can navigate by month to see upcoming deadlines."
    },
    {
        patterns: ["search", "find", "look up"],
        answer: "Use the **Search bar** at the top (Navbar) to quickly search across projects and tasks by name. Click any result to navigate directly to it."
    },
    {
        patterns: ["assign", "assignee", "who", "responsible"],
        answer: "Tasks can be assigned to any project member. When creating or editing a task, select the **Assignee** from the dropdown. Assigned tasks appear on the member's personal task list."
    },
    {
        patterns: ["priority", "urgent", "high", "low", "medium"],
        answer: "Both projects and tasks support **Low / Medium / High** priority levels. You can filter and sort by priority in the task board view."
    },
    {
        patterns: ["status", "planning", "active", "completed", "on hold", "cancelled"],
        answer: "Projects can have the status: **Planning, Active, Completed, On Hold, or Cancelled**. Tasks have: **To Do, In Progress, or Done**. You can update these from the task/project settings."
    },
    {
        patterns: ["password", "change password", "reset password"],
        answer: "Password changes are handled via **Supabase Auth**. Currently, password reset is done through the login page's \"Forgot password\" flow. Email changes are not supported directly in the app."
    },
    {
        patterns: ["logout", "sign out", "log out"],
        answer: "To log out: go to **Settings** → **Account** tab → click **Sign out**. Or click your name/avatar in the top-right Navbar → select **Sign out** from the dropdown."
    },
    {
        patterns: ["hello", "hi", "hey", "greetings", "good morning", "good evening"],
        answer: "Hey there! 👋 I'm the ManagePoint assistant. I can help you with projects, tasks, team management, settings, and more. What do you need help with?"
    },
    {
        patterns: ["thank", "thanks", "appreciate", "helpful"],
        answer: "You're welcome! 😊 Let me know if there's anything else I can help you with."
    },
    {
        patterns: ["help", "what can you do", "commands", "options"],
        answer: "I can help you with:\n• **Creating** projects, tasks, workspaces\n• **Inviting** team members\n• **Settings** — profile photo, theme, account\n• **Navigation** — finding features\n• **Analytics & Calendar** views\n\nJust type your question naturally!"
    },
];

const SUGGESTIONS = [
    "How do I create a project?",
    "How to invite a team member?",
    "How to change my profile photo?",
    "How to switch dark mode?",
];

function findAnswer(input) {
    const lower = input.toLowerCase();
    for (const entry of KB) {
        if (entry.patterns.some((p) => lower.includes(p))) {
            return entry.answer;
        }
    }
    return "I'm not sure about that one. Try asking about **creating projects**, **inviting members**, **task management**, **settings**, or **navigation**. 🤔";
}

// Simple markdown-ish bold renderer
function renderText(text) {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
        i % 2 === 1
            ? <strong key={i} className="font-semibold">{part}</strong>
            : part.split("\n").map((line, j, arr) => (
                <span key={`${i}-${j}`}>{line}{j < arr.length - 1 && <br />}</span>
            ))
    );
}

// ── Component ────────────────────────────────────────────────────────────────
export default function ChatBot() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, from: "bot", text: "Hi! I'm your ManagePoint assistant 🤖\n\nI can help you navigate the app, manage projects, tasks, and your team. What do you need?" }
    ]);
    const [input, setInput] = useState("");
    const [typing, setTyping] = useState(false);
    const [unread, setUnread] = useState(0);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, typing]);

    useEffect(() => {
        if (open) {
            setUnread(0);
            setTimeout(() => inputRef.current?.focus(), 150);
        }
    }, [open]);

    const sendMessage = (text) => {
        const trimmed = (text || input).trim();
        if (!trimmed) return;

        const userMsg = { id: Date.now(), from: "user", text: trimmed };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setTyping(true);

        setTimeout(() => {
            const answer = findAnswer(trimmed);
            const botMsg = { id: Date.now() + 1, from: "bot", text: answer };
            setMessages((prev) => [...prev, botMsg]);
            setTyping(false);
            if (!open) setUnread((n) => n + 1);
        }, 700 + Math.random() * 400);
    };

    const handleKey = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* ── Floating button ──────────────────────────────────────── */}
            <button
                onClick={() => setOpen((o) => !o)}
                className="fixed bottom-5 right-5 z-[300] size-14 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-2xl shadow-blue-500/40 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center"
                aria-label="Open chat assistant"
            >
                {open ? <ChevronDown className="size-6" /> : <MessageCircle className="size-6" />}
                {!open && unread > 0 && (
                    <span className="absolute -top-1 -right-1 size-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {unread}
                    </span>
                )}
            </button>

            {/* ── Chat window ──────────────────────────────────────────── */}
            <div
                className={`fixed bottom-24 right-5 z-[299] w-[90vw] sm:w-96 transition-all duration-300 ease-out origin-bottom-right ${open
                        ? "opacity-100 scale-100 pointer-events-auto"
                        : "opacity-0 scale-90 pointer-events-none"
                    }`}
            >
                <div className="flex flex-col bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-white/40 dark:border-zinc-700/60 rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/60 overflow-hidden"
                    style={{ maxHeight: "min(560px, 75vh)" }}
                >
                    {/* Header */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-zinc-800 bg-gradient-to-r from-blue-500/10 to-violet-500/10 dark:from-blue-500/5 dark:to-violet-500/5">
                        <div className="size-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
                            <Sparkles className="size-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">ManagePoint Assistant</p>
                            <p className="text-xs text-gray-500 dark:text-zinc-400 flex items-center gap-1">
                                <span className="size-1.5 rounded-full bg-green-500 inline-block" />
                                Online · Here to help
                            </p>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            className="size-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
                        >
                            <X className="size-4" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex items-end gap-2 ${msg.from === "user" ? "flex-row-reverse" : "flex-row"}`}>
                                {/* Avatar */}
                                <div className={`size-6 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold ${msg.from === "bot"
                                        ? "bg-gradient-to-br from-blue-500 to-violet-600 shadow-sm shadow-blue-500/30"
                                        : "bg-gradient-to-br from-gray-400 to-gray-600"
                                    }`}>
                                    {msg.from === "bot" ? <Bot className="size-3.5" /> : <User className="size-3.5" />}
                                </div>

                                {/* Bubble */}
                                <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.from === "bot"
                                        ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 rounded-bl-sm"
                                        : "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-sm shadow-lg shadow-blue-500/20"
                                    }`}>
                                    {renderText(msg.text)}
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {typing && (
                            <div className="flex items-end gap-2">
                                <div className="size-6 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                                    <Bot className="size-3.5 text-white" />
                                </div>
                                <div className="bg-gray-100 dark:bg-zinc-800 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
                                    {[0, 150, 300].map((delay) => (
                                        <span key={delay} className="size-1.5 rounded-full bg-gray-400 dark:bg-zinc-500 animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                                    ))}
                                </div>
                            </div>
                        )}

                        <div ref={bottomRef} />
                    </div>

                    {/* Quick suggestions (only show when few messages) */}
                    {messages.length <= 2 && (
                        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                            {SUGGESTIONS.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => sendMessage(s)}
                                    className="text-xs px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="px-3 pb-3 pt-2 border-t border-gray-100 dark:border-zinc-800">
                        <div className="flex items-end gap-2 bg-gray-100 dark:bg-zinc-800 rounded-xl px-3 py-2">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKey}
                                placeholder="Ask me anything…"
                                rows={1}
                                className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 resize-none outline-none max-h-24 leading-relaxed"
                                style={{ fieldSizing: "content" }}
                            />
                            <button
                                onClick={() => sendMessage()}
                                disabled={!input.trim() || typing}
                                className="size-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white flex items-center justify-center shadow-sm shadow-blue-500/30 transition disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                            >
                                <Send className="size-3.5" />
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-400 dark:text-zinc-600 mt-1.5 text-center">
                            Press Enter to send · Shift+Enter for new line
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
