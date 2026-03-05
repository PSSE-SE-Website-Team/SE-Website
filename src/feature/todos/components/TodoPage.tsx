import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { api } from "#convex/_generated/api";
import CreateTodoDialog from "./CreateTodoDialog";
import TodoList from "./TodoList";

export default function TodoPage() {
	const { data: todos, isPending } = useSuspenseQuery(
		convexQuery(api.todos.list, {}),
	);

	if (isPending) {
		return <div>Loading...</div>;
	}
	return (
		<div>
			<CreateTodoDialog />
			<TodoList todos={todos} />
		</div>
	);
}
