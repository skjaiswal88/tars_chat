import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Called on sign-in to upsert the user into the users table
export const store = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError("Not authenticated");

        const existing = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (existing) {
            // Update details in case they changed
            await ctx.db.patch(existing._id, {
                name: identity.name ?? existing.name,
                email: identity.email ?? existing.email,
                imageUrl: identity.pictureUrl ?? existing.imageUrl,
                isOnline: true,
            });
            return existing._id;
        }

        const userId = await ctx.db.insert("users", {
            clerkId: identity.subject,
            name: identity.name ?? "Unknown",
            email: identity.email ?? "",
            imageUrl: identity.pictureUrl ?? "",
            isOnline: true,
        });
        return userId;
    },
});

// Get the currently logged-in user
export const getMe = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        return await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
    },
});

// Get all users except the current user
export const getAll = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const users = await ctx.db.query("users").collect();
        return users.filter((u) => u.clerkId !== identity.subject);
    },
});

// Get a user by their Convex ID
export const getById = query({
    args: { userId: v.id("users") },
    handler: async (ctx, { userId }) => {
        return await ctx.db.get(userId);
    },
});

// Search users by name (case-insensitive done client-side with filtering)
export const searchUsers = query({
    args: { query: v.string() },
    handler: async (ctx, { query: q }) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const users = await ctx.db.query("users").collect();
        const lower = q.toLowerCase();
        return users.filter(
            (u) =>
                u.clerkId !== identity.subject &&
                u.name.toLowerCase().includes(lower)
        );
    },
});

// Set online status
export const setOnlineStatus = mutation({
    args: { isOnline: v.boolean() },
    handler: async (ctx, { isOnline }) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (user) {
            await ctx.db.patch(user._id, { isOnline });
        }
    },
});
