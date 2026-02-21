import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        clerkId: v.string(),
        name: v.string(),
        email: v.string(),
        imageUrl: v.string(),
        isOnline: v.boolean(),
    })
        .index("by_clerkId", ["clerkId"])
        .index("by_email", ["email"]),

    conversations: defineTable({
        isGroup: v.boolean(),
        groupName: v.optional(v.string()),
        groupImage: v.optional(v.string()),
        createdBy: v.optional(v.id("users")),
        lastMessageTime: v.optional(v.number()),
    }),

    conversationMembers: defineTable({
        conversationId: v.id("conversations"),
        userId: v.id("users"),
        lastSeenMessageId: v.optional(v.id("messages")),
    })
        .index("by_conversationId", ["conversationId"])
        .index("by_userId", ["userId"])
        .index("by_conversationId_userId", ["conversationId", "userId"]),

    messages: defineTable({
        conversationId: v.id("conversations"),
        senderId: v.id("users"),
        content: v.string(),
        messageType: v.union(v.literal("text"), v.literal("image")),
        isDeleted: v.optional(v.boolean()),
        reactions: v.optional(
            v.array(
                v.object({
                    userId: v.id("users"),
                    emoji: v.string(),
                })
            )
        ),
    })
        .index("by_conversationId", ["conversationId"]),

    typingIndicators: defineTable({
        conversationId: v.id("conversations"),
        userId: v.id("users"),
        lastTypedAt: v.number(),
    })
        .index("by_conversationId", ["conversationId"])
        .index("by_conversationId_userId", ["conversationId", "userId"]),
});
