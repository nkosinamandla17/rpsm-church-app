import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

async function getKV(ctx: any, key: string, fallback: any) {
  const row = await ctx.db.query("kv").withIndex("by_key", (q: any) => q.eq("key", key)).unique();
  return row ? row.value : fallback;
}
async function setKV(ctx: any, key: string, value: any) {
  const row = await ctx.db.query("kv").withIndex("by_key", (q: any) => q.eq("key", key)).unique();
  if (row) await ctx.db.patch(row._id, { value });
  else await ctx.db.insert("kv", { key, value });
}
async function requireSession(ctx: any, token: string) {
  if (!token) throw new Error("Missing token");
  const session = await ctx.db.query("sessions").withIndex("by_token", (q: any) => q.eq("token", token)).unique();
  if (!session) throw new Error("Invalid or expired session");
  return session;
}

/* ---------- content ----------
   "theme"/"images"/"content" = LIVE (published, what public visitors get).
   "*_draft" = the admin's working copy. Authenticated writes always land
   in the draft; publish() is the only thing that copies draft -> live. */
export const getLive = query({
  args: {},
  handler: async (ctx) => ({
    theme: await getKV(ctx, "theme", {}),
    images: await getKV(ctx, "images", {}),
    content: await getKV(ctx, "content", {}),
  }),
});

export const getDraft = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireSession(ctx, token);
    return {
      theme: (await getKV(ctx, "theme_draft", null)) ?? (await getKV(ctx, "theme", {})),
      images: (await getKV(ctx, "images_draft", null)) ?? (await getKV(ctx, "images", {})),
      content: (await getKV(ctx, "content_draft", null)) ?? (await getKV(ctx, "content", {})),
    };
  },
});

export const saveDraftTheme = mutation({
  args: { token: v.string(), value: v.any() },
  handler: async (ctx, { token, value }) => { await requireSession(ctx, token); await setKV(ctx, "theme_draft", value); },
});
export const saveDraftImages = mutation({
  args: { token: v.string(), value: v.any() },
  handler: async (ctx, { token, value }) => { await requireSession(ctx, token); await setKV(ctx, "images_draft", value); },
});
export const saveDraftText = mutation({
  args: { token: v.string(), value: v.any() },
  handler: async (ctx, { token, value }) => { await requireSession(ctx, token); await setKV(ctx, "content_draft", value); },
});

export const publish = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireSession(ctx, token);
    await setKV(ctx, "theme", (await getKV(ctx, "theme_draft", null)) ?? (await getKV(ctx, "theme", {})));
    await setKV(ctx, "images", (await getKV(ctx, "images_draft", null)) ?? (await getKV(ctx, "images", {})));
    await setKV(ctx, "content", (await getKV(ctx, "content_draft", null)) ?? (await getKV(ctx, "content", {})));
  },
});
