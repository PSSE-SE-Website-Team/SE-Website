import { convexQuery } from "@convex-dev/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "#convex/_generated/api";
import TodoPage from "@/feature/todos/components/TodoPage";

export const Route = createFileRoute("/sample/todos")({
	component: RouteComponent,
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(convexQuery(api.todos.list, {}));
	},
});

function RouteComponent() {
	return <TodoPage />;
}
