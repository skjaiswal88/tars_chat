import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get or create a 1:1 conversation between current user and another user
export const getOrCreate = mutation({
    args: { otherUserId: v.id("users") },
    handler: async (ctx, { otherUserId }) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError("Not authenticated");

        const me = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
        if (!me) throw new ConvexError("User not found");

        // Find existing 1:1 conversation
        const myMemberships = await ctx.db
            .query("conversationMembers")
            .withIndex("by_userId", (q) => q.eq("userId", me._id))
            .collect();

        for (const membership of myMemberships) {
            const conv = await ctx.db.get(membership.conversationId);
            if (!conv || conv.isGroup) continue;

            const otherMember = await ctx.db
                .query("conversationMembers")
                .withIndex("by_conversationId_userId", (q) =>
                    q
                        .eq("conversationId", membership.conversationId)
                        .eq("userId", otherUserId)
                )
                .unique();

            if (otherMember) return membership.conversationId;
        }

        // Create new 1:1 conversation
        const conversationId = await ctx.db.insert("conversations", {
            isGroup: false,
            lastMessageTime: Date.now(),
        });

        await ctx.db.insert("conversationMembers", {
            conversationId,
            userId: me._id,
        });
        await ctx.db.insert("conversationMembers", {
            conversationId,
            userId: otherUserId,
        });

        return conversationId;
    },
});

// Create a group conversation
export const createGroup = mutation({
    args: {
        memberIds: v.array(v.id("users")),
        groupName: v.string(),
    },
    handler: async (ctx, { memberIds, groupName }) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError("Not authenticated");

        const me = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
        if (!me) throw new ConvexError("User not found");

        const conversationId = await ctx.db.insert("conversations", {
            isGroup: true,
            groupName,
            createdBy: me._id,
            lastMessageTime: Date.now(),
        });

        const allMembers = [me._id, ...memberIds];
        for (const userId of allMembers) {
            await ctx.db.insert("conversationMembers", {
                conversationId,
                userId,
            });
        }

        return conversationId;
    },
});

// Get all conversations for current user with last message preview
export const getMyConversations = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const me = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
        if (!me) return [];

        const memberships = await ctx.db
            .query("conversationMembers")
            .withIndex("by_userId", (q) => q.eq("userId", me._id))
            .collect();

        const conversations = [];

        for (const membership of memberships) {
            const conv = await ctx.db.get(membership.conversationId);
            if (!conv) continue;

            // Get all members
            const members = await ctx.db
                .query("conversationMembers")
                .withIndex("by_conversationId", (q) =>
                    q.eq("conversationId", conv._id)
                )
                .collect();

            const memberUsers = await Promise.all(
                members.map((m) => ctx.db.get(m.userId))
            );

            // Get last message
            const messages = await ctx.db
                .query("messages")
                .withIndex("by_conversationId", (q) =>
                    q.eq("conversationId", conv._id)
                )
                .order("desc")
                .take(1);

            const lastMessage = messages[0] ?? null;

            // Count unread messages
            const lastSeen = membership.lastSeenMessageId;
            let unreadCount = 0;

            if (lastSeen) {
                const lastSeenMsg = await ctx.db.get(lastSeen);
                if (lastSeenMsg) {
                    const unreadMessages = await ctx.db
                        .query("messages")
                        .withIndex("by_conversationId", (q) =>
                            q.eq("conversationId", conv._id)
                        )
                        .collect();
                    unreadCount = unreadMessages.filter(
                        (m) =>
                            m._creationTime > lastSeenMsg._creationTime &&
                            m.senderId !== me._id
                    ).length;
                }
            } else {
                // Never seen any message — count all messages not from me
                const allMessages = await ctx.db
                    .query("messages")
                    .withIndex("by_conversationId", (q) =>
                        q.eq("conversationId", conv._id)
                    )
                    .collect();
                unreadCount = allMessages.filter((m) => m.senderId !== me._id).length;
            }

            conversations.push({
                ...conv,
                members: memberUsers.filter(Boolean),
                lastMessage,
                unreadCount,
                myMembershipId: membership._id,
            });
        }

        return conversations.sort(
            (a, b) => (b.lastMessageTime ?? 0) - (a.lastMessageTime ?? 0)
        );
    },
});

// Mark conversation as read
export const markRead = mutation({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, { conversationId }) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return;

        const me = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
        if (!me) return;

        const membership = await ctx.db
            .query("conversationMembers")
            .withIndex("by_conversationId_userId", (q) =>
                q.eq("conversationId", conversationId).eq("userId", me._id)
            )
            .unique();

        if (!membership) return;

        const lastMessage = await ctx.db
            .query("messages")
            .withIndex("by_conversationId", (q) =>
                q.eq("conversationId", conversationId)
            )
            .order("desc")
            .first();

        if (lastMessage) {
            await ctx.db.patch(membership._id, {
                lastSeenMessageId: lastMessage._id,
            });
        }
    },
});
