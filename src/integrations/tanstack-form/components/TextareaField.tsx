import type { ComponentProps, ReactNode } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useFieldContext } from "../form-context";
import { FieldWrapper } from "./FieldWrapper";

type TextareaFieldProps = {
	label: ReactNode;
	description?: ReactNode;
} & Omit<
	ComponentProps<typeof Textarea>,
	"id" | "name" | "value" | "onBlur" | "onChange"
>;

export function TextareaField({
	label,
	description,
	...textareaProps
}: TextareaFieldProps) {
	const field = useFieldContext<string>();

	return (
		<FieldWrapper label={label} description={description}>
			{({ fieldId, isInvalid }) => (
				<Textarea
					{...textareaProps}
					id={fieldId}
					name={field.name}
					value={field.state.value ?? ""}
					onBlur={field.handleBlur}
					onChange={(event) => field.handleChange(event.target.value)}
					aria-invalid={isInvalid}
				/>
			)}
		</FieldWrapper>
	);
}
