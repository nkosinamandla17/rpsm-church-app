// One-time helpers for porting data from the old SQLite-backed server into
// Convex. Safe to leave in place afterward (idempotent upserts), but not
// used by the running app.
import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

// internalMutation — not callable by any external client (browser, curl,
// another deployment's frontend). Only reachable from the Convex dashboard
// or `npx convex run` with a deploy key, which is all a one-time seed needs.
export const seedKV = internalMutation({
  args: { key: v.string(), value: v.any() },
  handler: async (ctx, { key, value }) => {
    const row = await ctx.db.query("kv").withIndex("by_key", (q) => q.eq("key", key)).unique();
    if (row) await ctx.db.patch(row._id, { value });
    else await ctx.db.insert("kv", { key, value });
  },
});

export const seedAdmin = internalMutation({
  args: { username: v.string(), passwordHash: v.string() },
  handler: async (ctx, { username, passwordHash }) => {
    const existing = await ctx.db.query("admins").withIndex("by_username", (q) => q.eq("username", username)).unique();
    if (existing) { await ctx.db.patch(existing._id, { passwordHash }); return; }
    await ctx.db.insert("admins", { username, passwordHash });
  },
});
