"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { internal } from "./_generated/api";

export const login = action({
  args: { username: v.string(), password: v.string() },
  handler: async (ctx, { username, password }) => {
    const admin = await ctx.runQuery(internal.auth_internal.findAdminByUsername, { username });
    if (!admin || !bcrypt.compareSync(password, admin.passwordHash)) {
      throw new Error("Invalid username or password");
    }
    const token = crypto.randomBytes(32).toString("hex");
    await ctx.runMutation(internal.auth_internal.createSession, { token, adminId: admin._id });
    return { token, username: admin.username };
  },
});

export const me = action({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.runQuery(internal.auth_internal.findSession, { token });
    if (!session) throw new Error("Invalid or expired session");
    const admin = await ctx.runQuery(internal.auth_internal.findAdminById, { id: session.adminId });
    if (!admin) throw new Error("Invalid or expired session");
    return { username: admin.username };
  },
});

export const changePassword = action({
  args: { token: v.string(), currentPassword: v.string(), newPassword: v.string() },
  handler: async (ctx, { token, currentPassword, newPassword }) => {
    const session = await ctx.runQuery(internal.auth_internal.findSession, { token });
    if (!session) throw new Error("Invalid or expired session");
    const admin = await ctx.runQuery(internal.auth_internal.findAdminById, { id: session.adminId });
    if (!admin || !bcrypt.compareSync(currentPassword, admin.passwordHash)) {
      throw new Error("Current password is incorrect");
    }
    if (!newPassword || newPassword.length < 8) {
      throw new Error("New password must be at least 8 characters");
    }
    await ctx.runMutation(internal.auth_internal.updatePasswordHash, { id: admin._id, passwordHash: bcrypt.hashSync(newPassword, 10) });
    return { ok: true };
  },
});

// One-time bootstrap: creates the first admin if none exists yet. Safe to
// call repeatedly — it's a no-op once an admin account exists.
export const bootstrapAdmin = action({
  args: {},
  handler: async (ctx) => {
    const count = await ctx.runQuery(internal.auth_internal.countAdmins, {});
    if (count > 0) return { created: false };
    const username = "admin";
    const password = crypto.randomBytes(9).toString("base64url");
    await ctx.runMutation(internal.auth_internal.createAdmin, { username, passwordHash: bcrypt.hashSync(password, 10) });
    return { created: true, username, password };
  },
});
