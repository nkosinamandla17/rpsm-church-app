import { internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const findAdminByUsername = internalQuery({
  args: { username: v.string() },
  handler: async (ctx, { username }) =>
    ctx.db.query("admins").withIndex("by_username", (q) => q.eq("username", username)).unique(),
});

export const findAdminById = internalQuery({
  args: { id: v.id("admins") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

export const countAdmins = internalQuery({
  args: {},
  handler: async (ctx) => (await ctx.db.query("admins").collect()).length,
});

export const createAdmin = internalMutation({
  args: { username: v.string(), passwordHash: v.string() },
  handler: async (ctx, { username, passwordHash }) => ctx.db.insert("admins", { username, passwordHash }),
});

export const updatePasswordHash = internalMutation({
  args: { id: v.id("admins"), passwordHash: v.string() },
  handler: async (ctx, { id, passwordHash }) => ctx.db.patch(id, { passwordHash }),
});

export const createSession = internalMutation({
  args: { token: v.string(), adminId: v.id("admins") },
  handler: async (ctx, { token, adminId }) => ctx.db.insert("sessions", { token, adminId, createdAt: Date.now() }),
});

export const findSession = internalQuery({
  args: { token: v.string() },
  handler: async (ctx, { token }) =>
    ctx.db.query("sessions").withIndex("by_token", (q) => q.eq("token", token)).unique(),
});
