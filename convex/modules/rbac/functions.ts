import { v } from "convex/values";
import { mutation, query } from "../../_generated/server";
import { getViewerContext, requireRole } from "../../platform/auth";
import { withMutationRlsContext } from "../../platform/rls";

export const viewer = query({
	handler: async (ctx) => {
		const viewerContext = await getViewerContext(ctx);

		if (!viewerContext.isAuthenticated || viewerContext.authUserId == null) {
			return null;
		}

		return {
			userId: viewerContext.authUserId,
			role: viewerContext.role ?? "student",
		};
	},
});

export const setUserRole = mutation({
	args: {
		authUserId: v.string(),
		role: v.union(
			v.literal("student"),
			v.literal("admin"),
			v.literal("superadmin"),
		),
	},
	handler: async (ctx, args) => {
		await requireRole(ctx, "superadmin");
		const secureCtx = await withMutationRlsContext(ctx);

		const existingProfile = await secureCtx.db
			.query("userProfiles")
			.withIndex("by_auth_user_id", (q) => q.eq("authUserId", args.authUserId))
			.unique();

		if (existingProfile) {
			await secureCtx.db.patch(existingProfile._id, { role: args.role });
			return;
		}

		await secureCtx.db.insert("userProfiles", {
			authUserId: args.authUserId,
			role: args.role,
		});
	},
});
