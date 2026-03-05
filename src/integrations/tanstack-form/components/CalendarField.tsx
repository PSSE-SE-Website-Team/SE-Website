import { RiCalendarLine } from "@remixicon/react";
import type { ComponentProps, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useFieldContext } from "../form-context";
import { FieldWrapper } from "./FieldWrapper";

type CalendarFieldProps = {
	label: ReactNode;
	description?: ReactNode;
	placeholder?: ReactNode;
	formatDisplay?: (value: Date) => ReactNode;
	triggerButtonProps?: Omit<
		ComponentProps<typeof Button>,
		"type" | "children" | "id" | "aria-invalid"
	>;
	popoverProps?: Omit<ComponentProps<typeof Popover>, "children">;
	popoverContentProps?: Omit<ComponentProps<typeof PopoverContent>, "children">;
} & Omit<ComponentProps<typeof Calendar>, "mode" | "selected" | "onSelect">;

const defaultDateFormatter = new Intl.DateTimeFormat(undefined, {
	dateStyle: "medium",
});

export function CalendarField({
	label,
	description,
	placeholder = "Pick a date",
	formatDisplay,
	triggerButtonProps,
	popoverProps,
	popoverContentProps,
	...calendarProps
}: CalendarFieldProps) {
	const field = useFieldContext<Date | null>();
	const selectedDate = field.state.value ?? null;
	const displayValue =
		selectedDate == null
			? placeholder
			: (formatDisplay?.(selectedDate) ??
				defaultDateFormatter.format(selectedDate));
	const { className: triggerClassName, ...triggerProps } =
		triggerButtonProps ?? {};
	const { className: contentClassName, ...contentProps } =
		popoverContentProps ?? {};

	return (
		<FieldWrapper label={label} description={description}>
			{({ fieldId, isInvalid }) => (
				<Popover {...popoverProps}>
					<PopoverTrigger
						render={
							<Button
								{...triggerProps}
								type="button"
								id={fieldId}
								variant="outline"
								aria-invalid={isInvalid}
								className={cn(
									"w-full justify-start text-left font-normal",
									selectedDate == null && "text-muted-foreground",
									triggerClassName,
								)}
							/>
						}
						onBlur={field.handleBlur}
					>
						<RiCalendarLine className="size-4" />
						{displayValue}
					</PopoverTrigger>
					<PopoverContent
						{...contentProps}
						className={cn("w-auto p-0", contentClassName)}
					>
						<Calendar
							{...calendarProps}
							mode="single"
							selected={selectedDate ?? undefined}
							onSelect={(nextValue) => {
								field.handleChange(nextValue ?? null);
								field.handleBlur();
							}}
						/>
					</PopoverContent>
				</Popover>
			)}
		</FieldWrapper>
	);
}
