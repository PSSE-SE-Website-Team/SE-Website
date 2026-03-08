import { defineSchema } from "convex/server";
import { auditLogsTable } from "./schema/auditLogs";
import { postsTable } from "./schema/posts";
import { todosTable } from "./schema/todos";
import { userProfilesTable } from "./schema/userProfiles";

export default defineSchema({
	todos: todosTable,
	posts: postsTable,
	auditLogs: auditLogsTable,
	userProfiles: userProfilesTable,
});
