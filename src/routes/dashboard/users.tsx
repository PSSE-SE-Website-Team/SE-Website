import { createFileRoute } from "@tanstack/react-router";
import { getAuthorization, requireMinimumRole } from "@/lib/authorization";

export const Route = createFileRoute("/dashboard/users")({
	beforeLoad: ({ context }) => {
		const authorization = getAuthorization(context);
		requireMinimumRole(authorization, "superadmin");
	},
	component: DashboardUsersRouteComponent,
});

function DashboardUsersRouteComponent() {
	return <main>Dashboard users page (superadmin only)</main>;
}
