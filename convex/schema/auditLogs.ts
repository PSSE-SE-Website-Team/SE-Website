import { defineTable } from "convex/server";
import { v } from "convex/values";

export const auditLogsTable = defineTable({
	tableName: v.string(),
	resourceId: v.string(),
	operation: v.union(v.literal("insert"), v.literal("update"), v.literal("delete")),
	actorAuthUserId: v.optional(v.string()),
	message: v.optional(v.string()),
	at: v.number(),
})
	.index("by_table_name", ["tableName"])
	.index("by_actor_auth_user_id", ["actorAuthUserId"]);
