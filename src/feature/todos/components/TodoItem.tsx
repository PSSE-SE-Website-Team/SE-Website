import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Doc } from "#convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { api } from "../../../../convex/_generated/api";

interface TodoItemProps {
	todo: Doc<"todos">;
}

export default function TodoItem({ todo }: TodoItemProps) {
	// toggle completed
	const { mutateAsync: toggleTodo } = useMutation({
		mutationFn: useConvexMutation(api.todos.toggle),
	});

	const handleToggleTodo = async () => {
		console.log("Toggling todo", todo._id, "to", !todo.completed);
		await toggleTodo({ id: todo._id });
		toast.success(
			`Todo marked as ${!todo.completed ? "completed" : "incomplete"}`,
		);
		console.log("Todo toggled", todo._id);
	};

	const { mutateAsync: deleteTodo } = useMutation({
		mutationFn: useConvexMutation(api.todos.remove),
	});

	const handleDeleteTodo = async () => {
		console.log("Deleting todo", todo._id);
		await deleteTodo({ id: todo._id });
		toast.success("Todo deleted");
		console.log("Todo deleted", todo._id);
	};
	return (
		<Card>
			<CardTitle>
				{todo.text} {todo.completed ? "(Completed)" : ""}
			</CardTitle>
			<CardContent>{todo.description}</CardContent>
			<CardFooter>
				<Button
					variant="outline"
					className={todo.completed ? "bg-green-500 text-white" : "bg-gray-200"}
					onClick={handleToggleTodo}
				>
					Toggle
				</Button>
				<Button variant="outline" onClick={handleDeleteTodo}>
					Delete
				</Button>
			</CardFooter>
		</Card>
	);
}
