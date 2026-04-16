import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByBookingId = query({
  args: { bookingId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_booking", (q) => q.eq("bookingId", args.bookingId))
      .order("asc")
      .collect();
  },
});

export const getByConversationAndBooking = query({
  args: { conversationId: v.string(), bookingId: v.string() },
  handler: async (ctx, args) => {
    // Get messages directly from this conversation loop
    const byConv = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .collect();
      
    // Get legacy messages (or un-attached messages) for this booking to migrate UI seamlessly
    const byBooking = await ctx.db
      .query("messages")
      .withIndex("by_booking", (q) => q.eq("bookingId", args.bookingId))
      .collect();

    // Deduplicate and group by _id so we don't display a message twice
    const map = new Map();
    for (const m of byConv) map.set(m._id.toString(), m);
    for (const m of byBooking) map.set(m._id.toString(), m);
    
    // Sort combined messages by time
    const messages = Array.from(map.values()).sort((a, b) => a.createdAt - b.createdAt);
    
    // Resolve URLs for photos concurrently
    return await Promise.all(
        messages.map(async (msg) => {
            let photoUrl = null;
            if (msg.photoId) {
                photoUrl = await ctx.storage.getUrl(msg.photoId);
            }
            return { ...msg, photoUrl };
        })
    );
  },
});

export const sendMessage = mutation({
  args: {
    conversationId: v.string(),
    bookingId: v.string(),
    senderId: v.string(),
    senderRole: v.string(),
    senderName: v.string(),
    content: v.string(),
    photoId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      bookingId: args.bookingId,
      senderId: args.senderId,
      senderRole: args.senderRole,
      senderName: args.senderName,
      content: args.content,
      photoId: args.photoId,
      createdAt: Date.now(),
    });
  },
});
