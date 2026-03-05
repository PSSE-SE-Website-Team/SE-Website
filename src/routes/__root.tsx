import type { ConvexQueryClient } from "@convex-dev/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import type { ReactNode } from "react";
import { getAuth } from "@/integrations/better-auth/auth-server.ts";
import type { AppRole } from "@/lib/authorization.ts";
import { isAppRole } from "@/lib/authorization.ts";
import { seo } from "@/lib/seo.ts";
import { api } from "../../convex/_generated/api";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools.tsx";
import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner.tsx";

interface AppRouterContext {
	queryClient: QueryClient;
	convexQueryClient: ConvexQueryClient;
}

export const Route = createRootRouteWithContext<AppRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "TanStack Start Starter",
			},
			...seo({
				title: "Software Engineering Website",
				description:
					"A software engineering website built with TanStack Router and React Query.",
				keywords: "tanstack, router, query, devtools, react",
			}),
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	shellComponent: RootDocument,
	beforeLoad: async ({ context }) => {
		const token = await getAuth();
		let role: AppRole | null = null;
		// all queries, mutations and actions through TanStack Query will be
		// authenticated during SSR if we have a valid token
		if (token) {
			// During SSR only (the only time serverHttpClient exists),
			// set the auth token to make HTTP queries with.
			context.convexQueryClient.serverHttpClient?.setAuth(token);

			const viewer = await context.queryClient.ensureQueryData(
				convexQuery(api.rbac.viewer, {}),
			);

			role = isAppRole(viewer?.role) ? viewer.role : "student";
		}

		return {
			authorization: {
				isAuthenticated: !!token,
				role,
			},
		};
	},
});

function RootDocument({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						TanStackQueryDevtools,
					]}
				/>
				<Toaster />
				<Scripts />
			</body>
		</html>
	);
}
