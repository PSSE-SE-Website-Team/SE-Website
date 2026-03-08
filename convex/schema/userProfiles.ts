import { defineTable } from "convex/server";
import { v } from "convex/values";

export const userProfilesTable = defineTable({
	authUserId: v.string(),
	role: v.union(
		v.literal("student"),
		v.literal("admin"),
		v.literal("superadmin"),
	),
}).index("by_auth_user_id", ["authUserId"]);
