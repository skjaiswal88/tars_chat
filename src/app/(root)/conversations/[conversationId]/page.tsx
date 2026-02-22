"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useEffect, useRef, useState, useCallback } from "react";
import { format, isToday, isThisYear } from "date-fns";
import { ArrowDown, ArrowLeft, Send, Trash2, Smile } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢"];

function formatMessageTime(timestamp: number): string {
    const date = new Date(timestamp);
    if (isToday(date)) return format(date, "h:mm a");
    if (isThisYear(date)) return format(date, "MMM d, h:mm a");
    return format(date, "MMM d yyyy, h:mm a");
}

export default function ConversationPage() {
    const params = useParams();
    const conversationId = params.conversationId as string;
    const convId = conversationId as Id<"conversations">;
    const { user } = useUser();

    const messages = useQuery(api.messages.getMessages, { conversationId: convId });
    const typingUsers = useQuery(api.typing.getTypingUsers, { conversationId: convId });
    const conversations = useQuery(api.conversations.getMyConversations);
    const me = useQuery(api.users.getMe);

    const sendMessage = useMutation(api.messages.sendMessage);
    const markRead = useMutation(api.conversations.markRead);
    const deleteMsg = useMutation(api.messages.deleteMessage);
    const toggleReaction = useMutation(api.messages.toggleReaction);
    const setTyping = useMutation(api.typing.setTyping);

    const [content, setContent] = useState("");
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [newMsgCount, setNewMsgCount] = useState(0);
    const [reactionMenuMsgId, setReactionMenuMsgId] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);

    const bottomRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const prevMsgCountRef = useRef(0);
    const router = useRouter();

    const currentConv = conversations?.find((c) => c._id === convId);

    // Mark read on open
    useEffect(() => {
        markRead({ conversationId: convId }).catch(console.error);
    }, [convId, markRead]);

    // Auto-scroll logic
    useEffect(() => {
        if (messages === undefined) return;
        const msgCount = messages.length;
        if (isAtBottom) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
            setNewMsgCount(0);
            markRead({ conversationId: convId }).catch(console.error);
        } else if (msgCount > prevMsgCountRef.current) {
            setNewMsgCount((n) => n + (msgCount - prevMsgCountRef.current));
        }
        prevMsgCountRef.current = msgCount;
    }, [messages, isAtBottom, convId, markRead]);

    const handleScroll = useCallback(() => {
        const el = scrollContainerRef.current;
        if (!el) return;
        const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        setIsAtBottom(atBottom);
        if (atBottom) {
            setNewMsgCount(0);
            markRead({ conversationId: convId }).catch(console.error);
        }
    }, [convId, markRead]);

    const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        setIsAtBottom(true);
        setNewMsgCount(0);
    };

    const handleTyping = (val: string) => {
        setContent(val);
        setTyping({ conversationId: convId, isTyping: val.length > 0 }).catch(console.error);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            setTyping({ conversationId: convId, isTyping: false }).catch(console.error);
        }, 2000);
    };

    const handleSend = async () => {
        const trimmed = content.trim();
        if (!trimmed || isSending) return;
        setIsSending(true);
        setSendError(null);
        try {
            await sendMessage({
                conversationId: convId,
                content: trimmed,
                messageType: "text",
            });
            setContent("");
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            setTyping({ conversationId: convId, isTyping: false }).catch(console.error);
        } catch {
            setSendError("Failed to send. Click to retry.");
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Get other members for header
    const otherMembers =
        (currentConv?.members as any[])?.filter((m: any) => m?.clerkId !== user?.id) ?? [];
    const headerName = currentConv?.isGroup
        ? currentConv.groupName
        : otherMembers[0]?.name ?? "Conversation";
    const headerImage = !currentConv?.isGroup && otherMembers[0]?.imageUrl;
    const isOtherOnline = !currentConv?.isGroup && otherMembers[0]?.isOnline;

    return (
        <div className="flex flex-col h-full bg-[#070710] relative">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/8 bg-[#0d0d1a]">
                <button
                    onClick={() => router.back()}
                    className="md:hidden p-1.5 rounded-lg hover:bg-white/8 text-zinc-400 hover:text-white"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="relative flex-shrink-0">
                    {headerImage ? (
                        <img
                            src={headerImage}
                            alt={headerName ?? ""}
                            className="w-9 h-9 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-sm font-bold text-white">
                            {(headerName ?? "?")[0]?.toUpperCase()}
                        </div>
                    )}
                    {isOtherOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0d0d1a]" />
                    )}
                </div>
                <div>
                    <p className="text-sm font-semibold text-white">{headerName}</p>
                    <p className={`text-xs ${isOtherOnline ? "text-green-400" : "text-zinc-500"}`}>
                        {currentConv?.isGroup
                            ? `${(currentConv?.members as any[])?.length ?? 0} members`
                            : isOtherOnline
                                ? "Online"
                                : "Offline"}
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1"
            >
                {messages === undefined ? (
                    <div className="flex flex-col gap-3">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                                <div className={`rounded-2xl animate-pulse bg-white/8 h-10 ${i % 2 === 0 ? "w-48" : "w-36"}`} />
                            </div>
                        ))}
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center flex-1 text-center py-20">
                        <div className="text-4xl mb-4">👋</div>
                        <p className="text-sm font-semibold text-white">Say hello!</p>
                        <p className="text-xs text-zinc-500 mt-1">
                            This is the beginning of your conversation with {headerName}
                        </p>
                    </div>
                ) : (
                    messages.map((msg: any, idx: number) => {
                        const isMine = msg.sender?.clerkId === user?.id;
                        const showAvatar =
                            !isMine &&
                            (idx === 0 || messages[idx - 1]?.sender?._id !== msg.sender?._id);

                        return (
                            <div
                                key={msg._id}
                                className={`flex animate-fade-up ${isMine ? "justify-end" : "justify-start"} ${showAvatar ? "mt-3" : "mt-0.5"}`}
                            >
                                {/* Other user avatar */}
                                {!isMine && (
                                    <div className="flex-shrink-0 mr-2 self-end">
                                        {showAvatar ? (
                                            msg.sender?.imageUrl ? (
                                                <img
                                                    src={msg.sender.imageUrl}
                                                    alt={msg.sender.name}
                                                    className="w-7 h-7 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold text-white">
                                                    {msg.sender?.name?.[0]}
                                                </div>
                                            )
                                        ) : (
                                            <div className="w-7" />
                                        )}
                                    </div>
                                )}

                                <div className={`group max-w-[72%] flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                                    {/* Bubble */}
                                    <div
                                        className={`relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.isDeleted
                                                ? "bg-white/5 text-zinc-500 italic border border-white/8"
                                                : isMine
                                                    ? "bg-violet-600 text-white rounded-br-md"
                                                    : "bg-[#1a1a2e] text-white rounded-bl-md"
                                            }`}
                                    >
                                        <p>{msg.isDeleted ? "This message was deleted" : msg.content}</p>

                                        {/* Action buttons */}
                                        {!msg.isDeleted && (
                                            <div
                                                className={`absolute -top-7 ${isMine ? "right-0" : "left-0"} hidden group-hover:flex items-center gap-1 bg-[#1a1a2e] border border-white/10 rounded-lg px-1.5 py-1 shadow-xl z-10`}
                                            >
                                                <button
                                                    onClick={() =>
                                                        setReactionMenuMsgId(
                                                            reactionMenuMsgId === msg._id ? null : msg._id
                                                        )
                                                    }
                                                    className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white"
                                                >
                                                    <Smile className="w-3.5 h-3.5" />
                                                </button>
                                                {isMine && (
                                                    <button
                                                        onClick={() => deleteMsg({ messageId: msg._id })}
                                                        className="p-1 rounded hover:bg-red-500/20 text-zinc-400 hover:text-red-400"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {/* Reaction picker */}
                                        {reactionMenuMsgId === msg._id && (
                                            <div
                                                className={`absolute -top-14 ${isMine ? "right-0" : "left-0"} flex items-center gap-1 bg-[#1a1a2e] border border-white/10 rounded-xl px-2 py-1.5 shadow-xl z-20`}
                                            >
                                                {EMOJIS.map((emoji) => (
                                                    <button
                                                        key={emoji}
                                                        onClick={() => {
                                                            toggleReaction({ messageId: msg._id, emoji });
                                                            setReactionMenuMsgId(null);
                                                        }}
                                                        className="text-lg hover:scale-125 transition-transform"
                                                    >
                                                        {emoji}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Reactions */}
                                    {msg.reactions && msg.reactions.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {Object.entries(
                                                msg.reactions.reduce(
                                                    (acc: Record<string, number>, r: any) => {
                                                        acc[r.emoji] = (acc[r.emoji] ?? 0) + 1;
                                                        return acc;
                                                    },
                                                    {}
                                                )
                                            ).map(([emoji, count]) => (
                                                <button
                                                    key={emoji}
                                                    onClick={() =>
                                                        toggleReaction({ messageId: msg._id, emoji })
                                                    }
                                                    className="flex items-center gap-0.5 bg-white/8 hover:bg-white/15 border border-white/10 rounded-full px-2 py-0.5 text-xs text-white transition"
                                                >
                                                    <span>{emoji}</span>
                                                    <span>{String(count)}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Timestamp */}
                                    <span className="text-[10px] text-zinc-600 mt-1 px-1">
                                        {formatMessageTime(msg._creationTime)}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}

                {/* Typing indicator */}
                {typingUsers && typingUsers.length > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1 bg-[#1a1a2e] rounded-2xl px-4 py-3">
                            <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full typing-dot" />
                            <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full typing-dot" />
                            <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full typing-dot" />
                        </div>
                        <span className="text-xs text-zinc-500">
                            {(typingUsers[0] as any)?.name?.split(" ")[0]} is typing...
                        </span>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* New messages button */}
            {!isAtBottom && newMsgCount > 0 && (
                <button
                    onClick={scrollToBottom}
                    className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium px-4 py-2 rounded-full shadow-lg transition animate-fade-up z-10"
                >
                    <ArrowDown className="w-3.5 h-3.5" />
                    {newMsgCount} new message{newMsgCount > 1 ? "s" : ""}
                </button>
            )}

            {/* Input */}
            <div className="px-4 py-3 border-t border-white/8 bg-[#0d0d1a]">
                {sendError && (
                    <div className="mb-2 text-xs text-red-400 flex items-center justify-between bg-red-500/10 px-3 py-1.5 rounded-lg">
                        <span>{sendError}</span>
                        <button onClick={handleSend} className="underline hover:no-underline">
                            Retry
                        </button>
                    </div>
                )}
                <div className="flex items-end gap-2">
                    <textarea
                        value={content}
                        onChange={(e) => handleTyping(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        rows={1}
                        className="flex-1 bg-white/6 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none transition max-h-32 overflow-y-auto"
                        style={{ lineHeight: "1.5" }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!content.trim() || isSending}
                        className="p-3 rounded-2xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all hover:scale-105 active:scale-95 flex-shrink-0"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
