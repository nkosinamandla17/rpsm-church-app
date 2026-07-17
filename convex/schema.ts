import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Generic key/value store for theme, content, images (both live and _draft variants).
  kv: defineTable({
    key: v.string(),
    value: v.any(),
  }).index("by_key", ["key"]),

  admins: defineTable({
    username: v.string(),
    passwordHash: v.string(),
  }).index("by_username", ["username"]),

  sessions: defineTable({
    token: v.string(),
    adminId: v.id("admins"),
    createdAt: v.number(),
  }).index("by_token", ["token"]),

  registrations: defineTable({
    name: v.string(),
    phone: v.string(),
    email: v.string(),
    comingFrom: v.string(),
    attendingAs: v.string(),
    numberAttending: v.string(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),

  bookings: defineTable({
    name: v.string(),
    phone: v.string(),
    email: v.string(),
    sessionType: v.string(),
    preferredDate: v.optional(v.string()),
    minister: v.string(),
    slot: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),

  subscribers: defineTable({
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),
});
