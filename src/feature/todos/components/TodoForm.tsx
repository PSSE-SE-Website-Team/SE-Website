import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { api } from "#convex/_generated/api";
import { useAppForm } from "@/integrations/tanstack-form/form-hooks";

const useCreateTodoForm = () => {
	type TodoFormValues = {
		text: string;
		description: string;
	};

	const convexMutationFn = useConvexMutation(api.todos.add);
	const { mutateAsync: createTodo } = useMutation({
		mutationFn: convexMutationFn,
	});

	const defaultValues: TodoFormValues = {
		text: "",
		description: "",
	};
	const form = useAppForm({
		defaultValues,
		onSubmit: async ({ value }) => {
			await createTodo(value);
		},
	});

	return form;
};

export default function TodoForm() {
	const form = useCreateTodoForm();
	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
		>
			<form.AppField name="text">
				{(field) => <field.TextField label="Text" />}
			</form.AppField>
			<form.AppField name="description">
				{(field) => <field.TextareaField label="Description" />}
			</form.AppField>
			<form.AppForm>
				<form.SubmitButton
					label="Create Todo"
					submittingLabel="Creating Todo"
				/>
			</form.AppForm>
		</form>
	);
}
