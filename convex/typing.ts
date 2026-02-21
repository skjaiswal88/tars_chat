import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

const TYPING_TIMEOUT_MS = 3000;

// Set typing indicator
export const setTyping = mutation({
    args: {
        conversationId: v.id("conversations"),
        isTyping: v.boolean(),
    },
    handler: async (ctx, { conversationId, isTyping }) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return;

        const me = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
        if (!me) return;

        const existing = await ctx.db
            .query("typingIndicators")
            .withIndex("by_conversationId_userId", (q) =>
                q.eq("conversationId", conversationId).eq("userId", me._id)
            )
            .unique();

        if (isTyping) {
            if (existing) {
                await ctx.db.patch(existing._id, { lastTypedAt: Date.now() });
            } else {
                await ctx.db.insert("typingIndicators", {
                    conversationId,
                    userId: me._id,
                    lastTypedAt: Date.now(),
                });
            }
        } else {
            if (existing) await ctx.db.delete(existing._id);
        }
    },
});

// Get who is currently typing in a conversation (excluding current user)
export const getTypingUsers = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, { conversationId }) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const me = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
        if (!me) return [];

        const now = Date.now();
        const indicators = await ctx.db
            .query("typingIndicators")
            .withIndex("by_conversationId", (q) =>
                q.eq("conversationId", conversationId)
            )
            .collect();

        const active = indicators.filter(
            (t) => t.userId !== me._id && now - t.lastTypedAt < TYPING_TIMEOUT_MS
        );

        return await Promise.all(
            active.map(async (t) => {
                const user = await ctx.db.get(t.userId);
                return user;
            })
        );
    },
});
