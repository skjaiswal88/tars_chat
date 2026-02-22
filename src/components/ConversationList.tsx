"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { formatDistanceToNow, format, isToday, isThisYear } from "date-fns";
import { Id } from "@convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";

function formatLastMessageTime(timestamp: number): string {
    const date = new Date(timestamp);
    if (isToday(date)) return format(date, "h:mm a");
    if (isThisYear(date)) return format(date, "MMM d");
    return format(date, "MMM d, yyyy");
}

export default function ConversationList() {
    const conversations = useQuery(api.conversations.getMyConversations);
    const { user } = useUser();
    const params = useParams();
    const router = useRouter();
    const activeConvId = params?.conversationId as string | undefined;

    if (conversations === undefined) {
        return (
            <div className="flex flex-col gap-1 p-2">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
                        <div className="w-11 h-11 rounded-full bg-white/8 animate-pulse flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="h-3 w-32 bg-white/8 rounded animate-pulse" />
                            <div className="h-2 w-44 bg-white/6 rounded animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                <div className="p-5 rounded-2xl bg-white/5 mb-4">
                    <MessageSquare className="w-10 h-10 text-violet-400" />
                </div>
                <p className="text-sm font-semibold text-white">No conversations yet</p>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                    Click the search icon to find someone and start chatting
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-0.5 p-2">
            <p className="px-2 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Messages
            </p>
            {conversations.map((conv) => {
                const isActive = conv._id === activeConvId;
                const otherMembers = (conv.members as any[]).filter(
                    (m: any) => m?.clerkId !== user?.id
                );
                const displayName = conv.isGroup
                    ? conv.groupName
                    : otherMembers[0]?.name ?? "Unknown";
                const displayImage = conv.isGroup
                    ? null
                    : otherMembers[0]?.imageUrl;
                const isOnline = !conv.isGroup && otherMembers[0]?.isOnline;

                const lastMsgContent = conv.lastMessage
                    ? (conv.lastMessage as any).isDeleted
                        ? "This message was deleted"
                        : (conv.lastMessage as any).content
                    : "Start a conversation";

                return (
                    <button
                        key={conv._id}
                        onClick={() => router.push(`/conversations/${conv._id}`)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group ${isActive
                            ? "bg-violet-600/20 border border-violet-500/30"
                            : "hover:bg-white/5 border border-transparent"
                            }`}
                    >
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            {displayImage ? (
                                <img
                                    src={displayImage}
                                    alt={displayName ?? ""}
                                    className="w-11 h-11 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-sm font-bold text-white">
                                    {(displayName ?? "?")[0]?.toUpperCase()}
                                </div>
                            )}
                            {isOnline && (
                                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0d0d1a]" />
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-1">
                                <span className={`text-sm font-semibold truncate ${isActive ? "text-violet-300" : "text-white"}`}>
                                    {displayName}
                                </span>
                                {conv.lastMessageTime && (
                                    <span className="text-[10px] text-zinc-500 flex-shrink-0">
                                        {formatLastMessageTime(conv.lastMessageTime)}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center justify-between gap-1 mt-0.5">
                                <p className={`text-xs truncate max-w-[160px] ${(conv.lastMessage as any)?.isDeleted ? "text-zinc-600 italic" : "text-zinc-500"}`}>
                                    {lastMsgContent}
                                </p>
                                {conv.unreadCount > 0 && (
                                    <span className="flex-shrink-0 bg-violet-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                        {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                                    </span>
                                )}
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
