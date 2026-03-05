import { redirect } from "@tanstack/react-router";

export type AppRole = "student" | "admin" | "superadmin";

export interface AuthorizationContext {
	isAuthenticated: boolean;
	role: AppRole | null;
}

const roleOrder: Record<AppRole, number> = {
	student: 0,
	admin: 1,
	superadmin: 2,
};

export function isAppRole(value: unknown): value is AppRole {
	return value === "student" || value === "admin" || value === "superadmin";
}

export function getAuthorization(
	context: unknown,
): AuthorizationContext | undefined {
	if (typeof context !== "object" || context === null) {
		return undefined;
	}

	return (context as { authorization?: AuthorizationContext }).authorization;
}

export function hasMinimumRole(
	role: AppRole | null | undefined,
	requiredRole: AppRole,
) {
	if (!role) {
		return false;
	}

	return roleOrder[role] >= roleOrder[requiredRole];
}

export function requireAuthenticated(
	authorization: AuthorizationContext | undefined,
) {
	if (!authorization?.isAuthenticated) {
		throw redirect({ href: "/public" });
	}
}

export function requireMinimumRole(
	authorization: AuthorizationContext | undefined,
	requiredRole: AppRole,
) {
	requireAuthenticated(authorization);

	if (!hasMinimumRole(authorization?.role, requiredRole)) {
		throw redirect({ href: "/public" });
	}
}
