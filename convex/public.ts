import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

async function requireSession(ctx: any, token: string) {
  if (!token) throw new Error("Missing token");
  const session = await ctx.db.query("sessions").withIndex("by_token", (q: any) => q.eq("token", token)).unique();
  if (!session) throw new Error("Invalid or expired session");
  return session;
}

/* ---------- public site forms — anyone can submit, no auth needed ---------- */
export const submitRegistration = mutation({
  args: {
    name: v.string(), phone: v.string(), email: v.string(), comingFrom: v.string(),
    attendingAs: v.string(), numberAttending: v.string(), notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("registrations", { ...args, createdAt: Date.now() });
  },
});

export const submitBooking = mutation({
  args: {
    name: v.string(), phone: v.string(), email: v.string(), sessionType: v.string(),
    preferredDate: v.optional(v.string()), minister: v.string(), slot: v.optional(v.string()), notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("bookings", { ...args, createdAt: Date.now() });
  },
});

export const submitSubscriber = mutation({
  args: { email: v.optional(v.string()), phone: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await ctx.db.insert("subscribers", { ...args, createdAt: Date.now() });
  },
});

/* ---------- admin-only listing (reactive — auto-updates live) ---------- */
export const listRegistrations = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireSession(ctx, token);
    return ctx.db.query("registrations").withIndex("by_createdAt").order("desc").collect();
  },
});

export const listBookings = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireSession(ctx, token);
    return ctx.db.query("bookings").withIndex("by_createdAt").order("desc").collect();
  },
});

export const listSubscribers = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireSession(ctx, token);
    return ctx.db.query("subscribers").withIndex("by_createdAt").order("desc").collect();
  },
});
