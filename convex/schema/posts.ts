import { defineTable } from "convex/server";
import { v } from "convex/values";

export const postsTable = defineTable({
	title: v.string(),
	content: v.string(),
	published: v.boolean(),
	authorAuthUserId: v.string(),
	coverImageStorageId: v.optional(v.id("_storage")),
})
	.index("by_author_auth_user_id", ["authorAuthUserId"])
	.index("by_published", ["published"]);
