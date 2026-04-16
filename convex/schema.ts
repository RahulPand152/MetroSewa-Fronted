import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    conversationId: v.optional(v.string()), // Format: user_ID_technician_ID
    bookingId: v.string(),
    senderId: v.string(),
    senderRole: v.string(), // e.g. "USER" or "TECHNICIAN"
    senderName: v.string(),
    content: v.string(),
    photoId: v.optional(v.id("_storage")),
    createdAt: v.number(),
  })
    .index("by_booking", ["bookingId"])
    .index("by_conversation", ["conversationId"]),
});
