import { convexBetterAuthReactStart } from "@convex-dev/better-auth/react-start";
import { createServerFn } from "@tanstack/react-start";

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;
const CONVEX_SITE_URL = import.meta.env.VITE_CONVEX_SITE_URL;

if (!CONVEX_URL) {
	throw new Error("VITE_CONVEX_URL environment variable is not set");
}

if (!CONVEX_SITE_URL) {
	throw new Error("VITE_CONVEX_SITE_URL environment variable is not set");
}
export const {
	handler,
	getToken,
	fetchAuthQuery,
	fetchAuthMutation,
	fetchAuthAction,
} = convexBetterAuthReactStart({
	convexUrl: CONVEX_URL,
	convexSiteUrl: CONVEX_SITE_URL,
});

/**
 * Server side function for getting the auth information for SSR using available cookies
 */
export const getAuth = createServerFn({ method: "GET" }).handler(async () => {
	return await getToken();
});
