import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { api } from "#convex/_generated/api";
import type { Doc } from "#convex/_generated/dataModel";
import { useAppForm } from "@/integrations/tanstack-form/form-hooks";

const useCreateTodoForm = () => {
	type TodoForm = Omit<
		Doc<"todos">,
		"_id" | "_createdAt" | "_updatedAt" | "_creationTime"
	>;

	const { mutateAsync: createTodo } = useMutation({
		mutationFn: useConvexMutation(api.todos.add),
	});

	const defaultValues: TodoForm = {
		text: "",
		description: "",
		completed: false,
	};
	const form = useAppForm({
		defaultValues,
		onSubmit: async ({ value }) => {
			console.log(value);
			await createTodo(value);
		},
	});

	return form;
};

export default function TodoForm() {
	const form = useCreateTodoForm();
	return (
		<form onSubmit={e => {
      e.preventDefault()
      e.stopPropagation()
      form.handleSubmit()
    }}>
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
