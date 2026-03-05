import { createFileRoute } from "@tanstack/react-router";
import TodoForm from "@/feature/todos/components/TodoForm";

export const Route = createFileRoute("/sample/create-todo")({
	component: RouteComponent,
});

function RouteComponent() {
	return <TodoForm />;
}
