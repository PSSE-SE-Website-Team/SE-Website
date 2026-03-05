import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/public/")({
	component: PublicRouteComponent,
});

function PublicRouteComponent() {
	return <main>Public page</main>;
}
