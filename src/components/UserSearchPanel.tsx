"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Users } from "lucide-react";
import { Id } from "@convex/_generated/dataModel";

export default function UserSearchPanel({ onClose }: { onClose: () => void }) {
    const [query, setQuery] = useState("");
    const users = useQuery(api.users.searchUsers, { query });
    const getOrCreate = useMutation(api.conversations.getOrCreate);
    const router = useRouter();

    const handleUserClick = async (userId: Id<"users">) => {
        try {
            const convId = await getOrCreate({ otherUserId: userId });
            onClose();
            router.push(`/conversations/${convId}`);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Search input */}
            <div className="p-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--t3)" }} />
                    <input
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search people..."
                        className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition"
                        style={{
                            background: "var(--bgi)",
                            border: "1px solid var(--bd)",
                            color: "var(--t1)",
                        }}
                    />
                </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto px-2 pb-2">
                {users === undefined ? (
                    <div className="flex flex-col gap-2 mt-2">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
                                <div className="w-9 h-9 rounded-full animate-pulse" style={{ background: "var(--bgh)" }} />
                                <div className="flex-1 space-y-1.5">
                                    <div className="h-3 w-28 rounded animate-pulse" style={{ background: "var(--bgh)" }} />
                                    <div className="h-2 w-20 rounded animate-pulse" style={{ background: "var(--bgh)" }} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                        <Users className="w-10 h-10 mb-3" style={{ color: "var(--t3)" }} />
                        <p className="text-sm font-medium" style={{ color: "var(--t2)" }}>No users found</p>
                        <p className="text-xs mt-1" style={{ color: "var(--t3)" }}>
                            {query ? `No results for "${query}"` : "No other users yet"}
                        </p>
                    </div>
                ) : (
                    users.map((user) => (
                        <button
                            key={user._id}
                            onClick={() => handleUserClick(user._id)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left group"
                            onMouseEnter={e => (e.currentTarget.style.background = "var(--bgh)")}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                        >
                            <div className="relative flex-shrink-0">
                                {user.imageUrl ? (
                                    <img src={user.imageUrl} alt={user.name} className="w-9 h-9 rounded-full object-cover" />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-sm font-bold text-white">
                                        {user.name[0]}
                                    </div>
                                )}
                                {user.isOnline && (
                                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2" style={{ borderColor: "var(--bg2)" }} />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate" style={{ color: "var(--t1)" }}>
                                    {user.name}
                                </p>
                                <p className="text-xs truncate" style={{ color: "var(--t3)" }}>{user.email}</p>
                            </div>
                            {user.isOnline && (
                                <span className="text-[10px] text-green-400 font-medium flex-shrink-0">Online</span>
                            )}
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}
