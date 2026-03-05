import { createFileRoute } from "@tanstack/react-router";
import { getAuthorization, requireMinimumRole } from "@/lib/authorization.ts";

export const Route = createFileRoute("/dashboard/")({
	beforeLoad: ({ context }) => {
		const authorization = getAuthorization(context);
		requireMinimumRole(authorization, "admin");
	},
	component: DashboardRouteComponent,
});

function DashboardRouteComponent() {
	return <main>Dashboard page (admin and superadmin)</main>;
}
