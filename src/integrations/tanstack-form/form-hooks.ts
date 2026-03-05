import { createFormHook } from "@tanstack/react-form";
import { CalendarField } from "./components/CalendarField";
import { ComboboxField } from "./components/ComboboxField";
import { SubmitButton } from "./components/SubmitButton";
import { TextareaField } from "./components/TextareaField";
import { TextField } from "./components/TextField";

import { fieldContext, formContext } from "./form-context";

export const { useAppForm } = createFormHook({
	fieldComponents: {
		TextField,
		TextareaField,
		CalendarField,
		ComboboxField,
	},
	formComponents: {
		SubmitButton,
	},
	fieldContext,
	formContext,
});
