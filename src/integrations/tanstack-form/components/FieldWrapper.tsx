import type { ReactNode } from "react";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { useFieldContext } from "../form-context";

function normalizeErrors(errors: ReadonlyArray<unknown>) {
	return errors
		.map((error) => {
			if (typeof error === "string") {
				return { message: error };
			}

			if (typeof error === "object" && error !== null && "message" in error) {
				const message = (error as { message?: unknown }).message;

				if (typeof message === "string") {
					return { message };
				}
			}

			if (error == null) {
				return undefined;
			}

			return { message: String(error) };
		})
		.filter((error): error is { message: string } => Boolean(error?.message));
}

export function FieldWrapper({
	label,
	description,
	children,
}: {
	label: ReactNode;
	description?: ReactNode;
	children: (args: { fieldId: string; isInvalid: boolean }) => ReactNode;
}) {
	const field = useFieldContext<unknown>();
	const fieldId = `field-${field.name.replaceAll(".", "-")}`;
	const isInvalid =
		field.state.meta.isTouched && field.state.meta.errors.length > 0;
	const errors = isInvalid ? normalizeErrors(field.state.meta.errors) : [];

	return (
		<Field data-invalid={isInvalid}>
			<FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
			<FieldContent>
				{children({ fieldId, isInvalid })}
				{description ? (
					<FieldDescription>{description}</FieldDescription>
				) : null}
				<FieldError errors={errors} />
			</FieldContent>
		</Field>
	);
}
