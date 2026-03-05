import { createFileRoute } from "@tanstack/react-router";
import { getAuthorization, requireAuthenticated } from "@/lib/authorization.ts";

export const Route = createFileRoute("/profile/")({
	beforeLoad: ({ context }) => {
		const authorization = getAuthorization(context);
		requireAuthenticated(authorization);
	},
	component: ProfileRouteComponent,
});

function ProfileRouteComponent() {
	return <main>Profile page (authenticated roles)</main>;
}
