import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Send a message to a conversation
export const sendMessage = mutation({
    args: {
        conversationId: v.id("conversations"),
        content: v.string(),
        messageType: v.union(v.literal("text"), v.literal("image")),
    },
    handler: async (ctx, { conversationId, content, messageType }) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError("Not authenticated");

        const me = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
        if (!me) throw new ConvexError("User not found");

        // Verify user is a member of the conversation
        const membership = await ctx.db
            .query("conversationMembers")
            .withIndex("by_conversationId_userId", (q) =>
                q.eq("conversationId", conversationId).eq("userId", me._id)
            )
            .unique();
        if (!membership) throw new ConvexError("Not a member of this conversation");

        const messageId = await ctx.db.insert("messages", {
            conversationId,
            senderId: me._id,
            content,
            messageType,
            isDeleted: false,
            reactions: [],
        });

        // Update conversation lastMessageTime
        await ctx.db.patch(conversationId, { lastMessageTime: Date.now() });

        // Mark sender as having seen this message
        await ctx.db.patch(membership._id, { lastSeenMessageId: messageId });

        // Clear typing indicator for sender
        const typing = await ctx.db
            .query("typingIndicators")
            .withIndex("by_conversationId_userId", (q) =>
                q.eq("conversationId", conversationId).eq("userId", me._id)
            )
            .unique();
        if (typing) await ctx.db.delete(typing._id);

        return messageId;
    },
});

// Get all messages in a conversation
export const getMessages = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, { conversationId }) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversationId", (q) =>
                q.eq("conversationId", conversationId)
            )
            .order("asc")
            .collect();

        // Attach sender info
        return await Promise.all(
            messages.map(async (msg) => {
                const sender = await ctx.db.get(msg.senderId);
                return { ...msg, sender };
            })
        );
    },
});

// Soft delete a message (only sender can do this)
export const deleteMessage = mutation({
    args: { messageId: v.id("messages") },
    handler: async (ctx, { messageId }) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError("Not authenticated");

        const me = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
        if (!me) throw new ConvexError("User not found");

        const message = await ctx.db.get(messageId);
        if (!message) throw new ConvexError("Message not found");
        if (message.senderId !== me._id)
            throw new ConvexError("Cannot delete other's messages");

        await ctx.db.patch(messageId, { isDeleted: true, content: "" });
    },
});

// Add or remove a reaction
export const toggleReaction = mutation({
    args: {
        messageId: v.id("messages"),
        emoji: v.string(),
    },
    handler: async (ctx, { messageId, emoji }) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError("Not authenticated");

        const me = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
        if (!me) throw new ConvexError("User not found");

        const message = await ctx.db.get(messageId);
        if (!message) throw new ConvexError("Message not found");

        const reactions = message.reactions ?? [];
        const existingIdx = reactions.findIndex(
            (r) => r.userId === me._id && r.emoji === emoji
        );

        if (existingIdx >= 0) {
            // Remove reaction
            reactions.splice(existingIdx, 1);
        } else {
            reactions.push({ userId: me._id, emoji });
        }

        await ctx.db.patch(messageId, { reactions });
    },
});
