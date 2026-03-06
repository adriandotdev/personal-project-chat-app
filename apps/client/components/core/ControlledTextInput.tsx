import { ERROR, PRIMARY } from "@/constants/colors";
import { PoppinsMedium } from "@/constants/fontFamily";
import {
	Control,
	Controller,
	FieldErrors,
	FieldPath,
	FieldValues,
	RegisterOptions,
} from "react-hook-form";
import { StyleSheet, Text, TextInput, View } from "react-native";

export interface ControlledTextInputProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
	TTransformedValues = TFieldValues,
> {
	control: Control<TFieldValues, any, TTransformedValues>;
	errors: FieldErrors<TFieldValues>;
	name: TName;
	rules?: Omit<
		RegisterOptions<TFieldValues, TName>,
		"valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"
	>;
	placeholder?: string;
	handleInputChange: (
		value: string,
		onFormInputChange: (...event: any[]) => void,
	) => void;
	secureTextEntry?: boolean;
}

export default function ControlledTextInput<
	TFieldValues extends FieldValues,
	TName extends FieldPath<TFieldValues>,
>({
	control,
	errors,
	name,
	rules,
	placeholder,
	handleInputChange,
	secureTextEntry,
}: ControlledTextInputProps<TFieldValues, TName>) {
	const error = errors[name];
	const errorMessage =
		error && typeof error.message === "string" ? error.message : undefined;

	return (
		<Controller
			control={control}
			rules={rules}
			render={({ field: { onChange, onBlur, value } }) => (
				<View style={styles.inputContainer}>
					<TextInput
						style={[
							styles.input,
							{ borderColor: errors[name] ? ERROR : PRIMARY },
						]}
						placeholder={placeholder}
						onBlur={onBlur}
						value={value}
						onChangeText={(value) => handleInputChange(value, onChange)}
						autoCapitalize="none"
						secureTextEntry={secureTextEntry}
					/>
					{errors[name] && (
						<Text style={styles.errorMessage}>{errorMessage}</Text>
					)}
				</View>
			)}
			name={name}
		/>
	);
}

const styles = StyleSheet.create({
	inputContainer: {
		marginBottom: 16,
		gap: 4,
	},
	input: {
		height: 48,
		borderColor: PRIMARY,
		borderWidth: 1,
		borderRadius: 14,

		paddingHorizontal: 12,
		fontSize: 14,
		backgroundColor: "#f9f9f9",
		fontFamily: PoppinsMedium,
	},
	errorMessage: {
		fontFamily: PoppinsMedium,
		color: "red",
	},
});
