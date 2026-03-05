import type { ComponentProps, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useFormContext } from "../form-context";

type SubmitButtonProps = {
	label?: ReactNode;
	submittingLabel?: ReactNode;
} & Omit<ComponentProps<typeof Button>, "type" | "children">;

export function SubmitButton({
	label = "Submit",
	submittingLabel = "Submitting...",
	disabled,
	...buttonProps
}: SubmitButtonProps) {
	const form = useFormContext();

	return (
		<form.Subscribe
			selector={(state) => ({
				canSubmit: state.canSubmit,
				isSubmitting: state.isSubmitting,
			})}
		>
			{({ canSubmit, isSubmitting }) => (
				<Button
					{...buttonProps}
					type="submit"
					disabled={Boolean(disabled) || !canSubmit || isSubmitting}
				>
					{isSubmitting ? submittingLabel : label}
				</Button>
			)}
		</form.Subscribe>
	);
}
