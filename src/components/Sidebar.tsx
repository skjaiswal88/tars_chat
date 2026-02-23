"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { UserButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import ConversationList from "./ConversationList";
import UserSearchPanel from "./UserSearchPanel";
import { Users, MessageSquare, Search, X, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/hooks/useTheme";

export default function Sidebar() {
    const [showSearch, setShowSearch] = useState(false);
    const { user } = useUser();
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="w-full md:w-80 flex-shrink-0 flex flex-col h-full" style={{ background: "var(--bg2)", borderRight: "1px solid var(--bd)" }}>
            {/* Header */}
            <div className="px-4 py-4" style={{ borderBottom: "1px solid var(--bd)" }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-lg tracking-tight" style={{ color: "var(--t1)" }}>TarsChat</span>
                    </div>
                    <div className="flex items-center gap-1">
                        {/* Theme toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: "var(--t2)" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "var(--bgh)")}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                        >
                            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                        {/* New Group */}
                        <Link
                            href="/conversations/new-group"
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: "var(--t2)" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "var(--bgh)")}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                            title="New Group"
                        >
                            <Users className="w-4 h-4" />
                        </Link>
                        {/* Search toggle */}
                        <button
                            onClick={() => setShowSearch((s) => !s)}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: "var(--t2)" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "var(--bgh)")}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                            title={showSearch ? "Close search" : "Find people"}
                        >
                            {showSearch ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                        </button>
                        <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
                    </div>
                </div>

                {/* Logged-in user info */}
                <div className="mt-3 flex items-center gap-2">
                    <div className="relative">
                        {user?.imageUrl ? (
                            <img src={user.imageUrl} alt={user.firstName ?? "User"} className="w-7 h-7 rounded-full object-cover ring-2 ring-violet-500/30" />
                        ) : (
                            <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold text-white">
                                {user?.firstName?.[0] ?? "U"}
                            </div>
                        )}
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2" style={{ borderColor: "var(--bg2)" }} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-medium leading-tight" style={{ color: "var(--t1)" }}>
                            {user?.fullName ?? user?.firstName ?? "You"}
                        </span>
                        <span className="text-[10px] text-green-400 leading-tight">Online</span>
                    </div>
                </div>
            </div>

            {/* Tabs / Search */}
            <div className="flex-1 overflow-y-auto">
                {showSearch ? (
                    <UserSearchPanel onClose={() => setShowSearch(false)} />
                ) : (
                    <ConversationList />
                )}
            </div>
        </div>
    );
}
