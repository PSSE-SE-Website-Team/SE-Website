import type { ComponentProps, ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { useFieldContext } from "../form-context";
import { FieldWrapper } from "./FieldWrapper";

type TextFieldProps = {
	label: ReactNode;
	description?: ReactNode;
} & Omit<
	ComponentProps<typeof Input>,
	"id" | "name" | "value" | "onBlur" | "onChange"
>;

export function TextField({
	label,
	description,
	type = "text",
	...inputProps
}: TextFieldProps) {
	const field = useFieldContext<string>();

	return (
		<FieldWrapper label={label} description={description}>
			{({ fieldId, isInvalid }) => (
				<Input
					{...inputProps}
					id={fieldId}
					name={field.name}
					type={type}
					value={field.state.value ?? ""}
					onBlur={field.handleBlur}
					onChange={(event) => field.handleChange(event.target.value)}
					aria-invalid={isInvalid}
				/>
			)}
		</FieldWrapper>
	);
}
