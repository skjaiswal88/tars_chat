"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Users } from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";

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
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search people..."
                        className="w-full bg-white/6 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition"
                    />
                </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto px-2 pb-2">
                {users === undefined ? (
                    <div className="flex flex-col gap-2 mt-2">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
                                <div className="w-9 h-9 rounded-full bg-white/8 animate-pulse" />
                                <div className="flex-1 space-y-1.5">
                                    <div className="h-3 w-28 bg-white/8 rounded animate-pulse" />
                                    <div className="h-2 w-20 bg-white/6 rounded animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                        <Users className="w-10 h-10 text-zinc-600 mb-3" />
                        <p className="text-sm font-medium text-zinc-400">No users found</p>
                        <p className="text-xs text-zinc-600 mt-1">
                            {query ? `No results for "${query}"` : "No other users yet"}
                        </p>
                    </div>
                ) : (
                    users.map((user) => (
                        <button
                            key={user._id}
                            onClick={() => handleUserClick(user._id)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/6 transition-colors text-left group"
                        >
                            <div className="relative flex-shrink-0">
                                {user.imageUrl ? (
                                    <img
                                        src={user.imageUrl}
                                        alt={user.name}
                                        className="w-9 h-9 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-sm font-bold text-white">
                                        {user.name[0]}
                                    </div>
                                )}
                                {user.isOnline && (
                                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0d0d1a]" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate group-hover:text-violet-300 transition-colors">
                                    {user.name}
                                </p>
                                <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                            </div>
                            {user.isOnline && (
                                <span className="text-[10px] text-green-400 font-medium flex-shrink-0">
                                    Online
                                </span>
                            )}
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}
