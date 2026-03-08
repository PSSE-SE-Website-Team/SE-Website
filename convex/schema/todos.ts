import { defineTable } from "convex/server";
import { v } from "convex/values";

export const todosTable = defineTable({
	text: v.string(),
	description: v.optional(v.string()),
	completed: v.boolean(),
	ownerAuthUserId: v.string(),
}).index("by_owner_auth_user_id", ["ownerAuthUserId"]);
