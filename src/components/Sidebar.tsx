"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { UserButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ConversationList from "./ConversationList";
import UserSearchPanel from "./UserSearchPanel";
import { Users, MessageSquare, Search, X } from "lucide-react";
import Link from "next/link";

export default function Sidebar() {
    const [showSearch, setShowSearch] = useState(false);
    const me = useQuery(api.users.getMe);
    const { user } = useUser();

    return (
        <div className="w-full md:w-80 flex-shrink-0 flex flex-col border-r border-white/8 bg-[#0d0d1a] h-full">
            {/* Header */}
            <div className="px-4 py-4 border-b border-white/8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-white text-lg tracking-tight">TarsChat</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Link
                            href="/conversations/new-group"
                            className="p-2 rounded-lg hover:bg-white/8 transition-colors text-zinc-400 hover:text-white"
                            title="New Group"
                        >
                            <Users className="w-4 h-4" />
                        </Link>
                        <button
                            onClick={() => setShowSearch((s) => !s)}
                            className="p-2 rounded-lg hover:bg-white/8 transition-colors text-zinc-400 hover:text-white"
                            title={showSearch ? "Close search" : "Find people"}
                        >
                            {showSearch ? (
                                <X className="w-4 h-4" />
                            ) : (
                                <Search className="w-4 h-4" />
                            )}
                        </button>
                        <UserButton
                            appearance={{
                                elements: {
                                    avatarBox: "w-8 h-8",
                                },
                            }}
                        />
                    </div>
                </div>

                {/* Logged-in user info */}
                <div className="mt-3 flex items-center gap-2">
                    <div className="relative">
                        {user?.imageUrl ? (
                            <img
                                src={user.imageUrl}
                                alt={user.firstName ?? "User"}
                                className="w-7 h-7 rounded-full object-cover ring-2 ring-violet-500/30"
                            />
                        ) : (
                            <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold text-white">
                                {user?.firstName?.[0] ?? "U"}
                            </div>
                        )}
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0d0d1a]" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-white leading-tight">
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
