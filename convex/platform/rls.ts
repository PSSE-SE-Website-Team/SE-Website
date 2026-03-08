import type { GenericDatabaseReader, GenericDatabaseWriter } from "convex/server";
import {
	type Rules,
	wrapDatabaseReader,
	wrapDatabaseWriter,
} from "convex-helpers/server/rowLevelSecurity";
import type { DataModel, Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import {
	getViewerContext,
	hasMinimumRole,
	type ViewerContext,
} from "./auth";
import { wrapMutationWithTriggers } from "./triggers";

type RlsCtx = { viewer: ViewerContext };

function canAccessOwnedResource(
	viewer: ViewerContext,
	ownerAuthUserId: string,
): boolean {
	if (!viewer.isAuthenticated || viewer.authUserId == null) {
		return false;
	}

	return (
		viewer.authUserId === ownerAuthUserId || hasMinimumRole(viewer.role, "admin")
	);
}

const rules: Rules<RlsCtx, DataModel> = {
	todos: {
		read: async (ctx, todo: Doc<"todos">) =>
			canAccessOwnedResource(ctx.viewer, todo.ownerAuthUserId),
		modify: async (ctx, todo: Doc<"todos">) =>
			canAccessOwnedResource(ctx.viewer, todo.ownerAuthUserId),
		insert: async (ctx, todo) => canAccessOwnedResource(ctx.viewer, todo.ownerAuthUserId),
	},
	posts: {
		read: async (ctx, post: Doc<"posts">) =>
			post.published || hasMinimumRole(ctx.viewer.role, "admin"),
		modify: async (ctx) => hasMinimumRole(ctx.viewer.role, "admin"),
		insert: async (ctx) => hasMinimumRole(ctx.viewer.role, "admin"),
	},
	userProfiles: {
		read: async (ctx, profile: Doc<"userProfiles">) =>
			hasMinimumRole(ctx.viewer.role, "superadmin") ||
			ctx.viewer.authUserId === profile.authUserId,
		modify: async (ctx) => hasMinimumRole(ctx.viewer.role, "superadmin"),
		insert: async (ctx) => hasMinimumRole(ctx.viewer.role, "superadmin"),
	},
	auditLogs: {
		read: async (ctx) => hasMinimumRole(ctx.viewer.role, "superadmin"),
		modify: async () => false,
		insert: async () => false,
	},
};

export async function withQueryRlsContext(
	ctx: QueryCtx,
): Promise<QueryCtx & { viewer: ViewerContext }> {
	const viewer = await getViewerContext(ctx);
	const db = wrapDatabaseReader<RlsCtx, DataModel>({ viewer }, ctx.db, rules, {
		defaultPolicy: "deny",
	});

	return {
		...ctx,
		db: db as GenericDatabaseReader<DataModel>,
		viewer,
	};
}

export async function withMutationRlsContext(
	ctx: MutationCtx,
): Promise<MutationCtx & { viewer: ViewerContext }> {
	const viewer = await getViewerContext(ctx);
	const triggerCtx = wrapMutationWithTriggers(ctx);
	const db = wrapDatabaseWriter<RlsCtx, DataModel>(
		{ viewer },
		triggerCtx.db,
		rules,
		{
			defaultPolicy: "deny",
		},
	);

	return {
		...triggerCtx,
		db: db as GenericDatabaseWriter<DataModel>,
		viewer,
	};
}
