import { convexQuery } from "@convex-dev/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { api } from "#convex/_generated/api";

export const Route = createFileRoute("/")({
	component: RouteComponent,
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(convexQuery(api.todos.list, {}));
	},
});

function RouteComponent() {
	return (
		<main>
			Hello world
			<Link to="/sample/create-todo">Create Todo</Link>
		</main>
	);
}
