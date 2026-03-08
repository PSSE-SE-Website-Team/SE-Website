import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "#convex/_generated/api";
import type { Doc } from "#convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";

interface TodoItemProps {
	todo: Doc<"todos">;
}

export default function TodoItem({ todo }: TodoItemProps) {
	const toggleMutationFn = useConvexMutation(api.todos.toggle);
	const { mutateAsync: toggleTodo } = useMutation({
		mutationFn: toggleMutationFn,
	});

	const removeMutationFn = useConvexMutation(api.todos.remove);
	const { mutateAsync: deleteTodo } = useMutation({
		mutationFn: removeMutationFn,
	});

	const handleToggleTodo = async () => {
		await toggleTodo({ id: todo._id });
		toast.success(
			`Todo marked as ${!todo.completed ? "completed" : "incomplete"}`,
		);
	};

	const handleDeleteTodo = async () => {
		await deleteTodo({ id: todo._id });
		toast.success("Todo deleted");
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
