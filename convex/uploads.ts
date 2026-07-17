"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { v2 as cloudinary } from "cloudinary";
import { internal } from "./_generated/api";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// `dataUrl` is a base64 data: URI (Cloudinary accepts these directly) —
// Convex actions take JSON args, so the browser reads the file as a data
// URL via FileReader before calling this instead of a multipart upload.
export const uploadImage = action({
  args: { token: v.string(), dataUrl: v.string() },
  handler: async (ctx, { token, dataUrl }) => {
    const session = await ctx.runQuery(internal.auth_internal.findSession, { token });
    if (!session) throw new Error("Invalid or expired session");
    const result = await cloudinary.uploader.upload(dataUrl, { folder: "rpsm", resource_type: "image" });
    return { url: result.secure_url };
  },
});
