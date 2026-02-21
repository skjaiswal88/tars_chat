"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, Check, X } from "lucide-react";

export default function NewGroupPage() {
    const [groupName, setGroupName] = useState("");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isCreating, setIsCreating] = useState(false);
    const router = useRouter();

    const users = useQuery(api.users.getAll);
    const createGroup = useMutation(api.conversations.createGroup);

    const toggleUser = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const handleCreate = async () => {
        if (!groupName.trim() || selectedIds.size < 2) return;
        setIsCreating(true);
        try {
            const convId = await createGroup({
                groupName: groupName.trim(),
                memberIds: [...selectedIds] as Id<"users">[],
            });
            router.push(`/conversations/${convId}`);
        } catch (e) {
            console.error(e);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#070710]">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/8 bg-[#0d0d1a]">
                <button
                    onClick={() => router.back()}
                    className="p-1.5 rounded-lg hover:bg-white/8 text-zinc-400 hover:text-white"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                    <p className="text-sm font-semibold text-white">New Group Chat</p>
                    <p className="text-xs text-zinc-500">Select at least 2 people</p>
                </div>
            </div>

            {/* Group name */}
            <div className="px-4 py-3 border-b border-white/8">
                <input
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Group name..."
                    className="w-full bg-white/6 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
            </div>

            {/* User list */}
            <div className="flex-1 overflow-y-auto p-3">
                {users === undefined ? (
                    <div className="flex flex-col gap-2">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
                                <div className="w-9 h-9 rounded-full bg-white/8 animate-pulse" />
                                <div className="h-3 w-32 bg-white/8 rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Users className="w-10 h-10 text-zinc-600 mb-3" />
                        <p className="text-sm text-zinc-400">No users found</p>
                    </div>
                ) : (
                    users.map((user) => (
                        <button
                            key={user._id}
                            onClick={() => toggleUser(user._id)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition text-left"
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
                                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#070710]" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                            </div>
                            <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedIds.has(user._id)
                                        ? "bg-violet-600 border-violet-600"
                                        : "border-white/20"
                                    }`}
                            >
                                {selectedIds.has(user._id) && (
                                    <Check className="w-3 h-3 text-white" />
                                )}
                            </div>
                        </button>
                    ))
                )}
            </div>

            {/* Create button */}
            <div className="px-4 py-3 border-t border-white/8 bg-[#0d0d1a]">
                <button
                    onClick={handleCreate}
                    disabled={!groupName.trim() || selectedIds.size < 2 || isCreating}
                    className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition"
                >
                    {isCreating
                        ? "Creating..."
                        : `Create Group${selectedIds.size > 0 ? ` · ${selectedIds.size} selected` : ""}`}
                </button>
                {selectedIds.size > 0 && selectedIds.size < 2 && (
                    <p className="text-xs text-zinc-500 text-center mt-2">
                        Select at least 2 people to create a group
                    </p>
                )}
            </div>
        </div>
    );
}
