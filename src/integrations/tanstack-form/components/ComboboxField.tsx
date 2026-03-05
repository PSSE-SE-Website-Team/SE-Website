import type { ComponentProps, ReactNode } from "react";
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from "@/components/ui/combobox";
import { useFieldContext } from "../form-context";
import { FieldWrapper } from "./FieldWrapper";

export interface ComboboxOption {
	label: string;
	value: string;
	disabled?: boolean;
}

type ComboboxFieldProps = {
	label: ReactNode;
	description?: ReactNode;
	options: Array<ComboboxOption>;
	placeholder?: string;
	emptyLabel?: ReactNode;
	disabled?: boolean;
	inputProps?: Omit<
		ComponentProps<typeof ComboboxInput>,
		"id" | "onBlur" | "placeholder" | "disabled" | "showClear"
	>;
	contentProps?: Omit<ComponentProps<typeof ComboboxContent>, "children">;
	listProps?: Omit<ComponentProps<typeof ComboboxList>, "children">;
};

export function ComboboxField({
	label,
	description,
	options,
	placeholder = "Select an option",
	emptyLabel = "No options found",
	disabled,
	inputProps,
	contentProps,
	listProps,
}: ComboboxFieldProps) {
	const field = useFieldContext<string | null>();
	const selectedOption =
		options.find((option) => option.value === field.state.value) ?? null;

	return (
		<FieldWrapper label={label} description={description}>
			{({ fieldId, isInvalid }) => (
				<Combobox
					value={selectedOption}
					onValueChange={(nextValue) => {
						field.handleChange(nextValue?.value ?? null);
					}}
					itemToStringLabel={(item) => item.label}
					itemToStringValue={(item) => item.value}
					isItemEqualToValue={(item, value) => item.value === value.value}
				>
					<ComboboxInput
						{...inputProps}
						id={fieldId}
						placeholder={placeholder}
						disabled={disabled}
						showClear
						onBlur={field.handleBlur}
						aria-invalid={isInvalid}
					/>
					<ComboboxContent {...contentProps}>
						<ComboboxList {...listProps}>
							<ComboboxEmpty>{emptyLabel}</ComboboxEmpty>
							{options.map((option) => (
								<ComboboxItem
									key={option.value}
									value={option}
									disabled={option.disabled}
								>
									{option.label}
								</ComboboxItem>
							))}
						</ComboboxList>
					</ComboboxContent>
				</Combobox>
			)}
		</FieldWrapper>
	);
}
