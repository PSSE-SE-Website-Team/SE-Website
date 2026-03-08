import { authComponent } from "../auth";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export type AppRole = "student" | "admin" | "superadmin";

const roleOrder: Record<AppRole, number> = {
	student: 0,
	admin: 1,
	superadmin: 2,
};

type ConvexCtx = QueryCtx | MutationCtx;

export interface ViewerContext {
	authUserId: string | null;
	role: AppRole | null;
	isAuthenticated: boolean;
}

export function hasMinimumRole(
	role: AppRole | null,
	requiredRole: AppRole,
): boolean {
	if (role == null) {
		return false;
	}

	return roleOrder[role] >= roleOrder[requiredRole];
}

export async function getViewerContext(ctx: ConvexCtx): Promise<ViewerContext> {
	const authUser = await authComponent.getAuthUser(ctx);

	if (!authUser?.userId) {
		return {
			authUserId: null,
			role: null,
			isAuthenticated: false,
		};
	}

	const profile = await ctx.db
		.query("userProfiles")
		.withIndex("by_auth_user_id", (q) => q.eq("authUserId", authUser.userId!))
		.unique();

	return {
		authUserId: authUser.userId,
		role: profile?.role ?? "student",
		isAuthenticated: true,
	};
}

export async function requireAuthenticated(ctx: ConvexCtx): Promise<string> {
	const viewer = await getViewerContext(ctx);

	if (!viewer.isAuthenticated || viewer.authUserId == null) {
		throw new Error("Unauthenticated");
	}

	return viewer.authUserId;
}

export async function requireRole(
	ctx: ConvexCtx,
	requiredRole: AppRole,
): Promise<{ authUserId: string; role: AppRole }> {
	const viewer = await getViewerContext(ctx);

	if (!viewer.isAuthenticated || viewer.authUserId == null || viewer.role == null) {
		throw new Error("Unauthenticated");
	}

	if (!hasMinimumRole(viewer.role, requiredRole)) {
		throw new Error("Forbidden");
	}

	return {
		authUserId: viewer.authUserId,
		role: viewer.role,
	};
}
