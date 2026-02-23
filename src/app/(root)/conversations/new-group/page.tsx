"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, Check } from "lucide-react";

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
        if (!groupName.trim() || selectedIds.size < 1) return;
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
        <div className="flex flex-col h-full" style={{ background: "var(--bg1)" }}>
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid var(--bd)", background: "var(--bg2)" }}>
                <button
                    onClick={() => router.back()}
                    className="p-1.5 rounded-lg transition"
                    style={{ color: "var(--t2)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--bgh)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--t1)" }}>New Group Chat</p>
                    <p className="text-xs" style={{ color: "var(--t3)" }}>Select at least 1 person</p>
                </div>
            </div>

            {/* Group name input */}
            <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--bd)" }}>
                <input
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Group name..."
                    className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition"
                    style={{
                        background: "var(--bgi)",
                        border: "1px solid var(--bd)",
                        color: "var(--t1)",
                    }}
                />
            </div>

            {/* User list */}
            <div className="flex-1 overflow-y-auto p-3">
                {users === undefined ? (
                    <div className="flex flex-col gap-2">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
                                <div className="w-9 h-9 rounded-full animate-pulse" style={{ background: "var(--bgh)" }} />
                                <div className="h-3 w-32 rounded animate-pulse" style={{ background: "var(--bgh)" }} />
                            </div>
                        ))}
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Users className="w-10 h-10 mb-3" style={{ color: "var(--t3)" }} />
                        <p className="text-sm" style={{ color: "var(--t2)" }}>No users found</p>
                    </div>
                ) : (
                    users.map((user) => (
                        <button
                            key={user._id}
                            onClick={() => toggleUser(user._id)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl transition text-left"
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
                                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2" style={{ borderColor: "var(--bg1)" }} />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate" style={{ color: "var(--t1)" }}>{user.name}</p>
                            </div>
                            <div
                                className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                                style={selectedIds.has(user._id)
                                    ? { background: "#7c3aed", borderColor: "#7c3aed" }
                                    : { borderColor: "var(--bds)" }
                                }
                            >
                                {selectedIds.has(user._id) && <Check className="w-3 h-3 text-white" />}
                            </div>
                        </button>
                    ))
                )}
            </div>

            {/* Create button */}
            <div className="px-4 py-3" style={{ borderTop: "1px solid var(--bd)", background: "var(--bg2)" }}>
                <button
                    onClick={handleCreate}
                    disabled={!groupName.trim() || selectedIds.size < 1 || isCreating}
                    className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition"
                >
                    {isCreating
                        ? "Creating..."
                        : `Create Group${selectedIds.size > 0 ? ` · ${selectedIds.size} selected` : ""}`}
                </button>
                {selectedIds.size === 0 && (
                    <p className="text-xs text-center mt-2" style={{ color: "var(--t3)" }}>
                        Select at least 1 person to create a group
                    </p>
                )}
            </div>
        </div>
    );
}
