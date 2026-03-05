import type { Doc } from "#convex/_generated/dataModel";
import TodoItem from "./TodoItem";

interface TodoListProps {
	todos: Doc<"todos">[];
}

export default function TodoList({ todos }: TodoListProps) {
	return (
		<div>
			{todos.map((todo) => (
				<TodoItem key={todo._id} todo={todo} />
			))}
		</div>
	);
}
