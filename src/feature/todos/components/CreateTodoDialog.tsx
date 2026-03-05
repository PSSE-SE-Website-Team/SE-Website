import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import TodoForm from "./TodoForm";

export default function CreateTodoDialog() {
	return (
		<Dialog>
			<DialogTrigger>Open Create Todo Form</DialogTrigger>
			<DialogContent>
				<TodoForm />
			</DialogContent>
		</Dialog>
	);
}
