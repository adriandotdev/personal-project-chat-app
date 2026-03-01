import ControlledTextInput, {
	ControlledTextInputProps,
} from "@/components/core/ControlledTextInput";
import { ERROR, PRIMARY, SECONDARY } from "@/constants/colors";
import {
	PoppinsBold,
	PoppinsMedium,
	PoppinsSemibold,
} from "@/constants/fontFamily";
import { URL } from "@/constants/url";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import {
	ActivityIndicator,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";

type FormData = {
	username: string;
	name: string;
	email: string;
	password: string;
	confirmPassword: string;
};

type Input = Omit<
	ControlledTextInputProps,
	"control" | "errors" | "handleInputChange"
>;

const inputs: Input[] = [
	{
		name: "name",
		placeholder: "Name",
		rules: {
			required: {
				value: true,
				message: "Please provide your name",
			},
		},
	},
	{
		name: "email",
		placeholder: "Email",
		rules: {
			required: {
				value: true,
				message: "Please provide your email",
			},
		},
	},
	{
		name: "username",
		placeholder: "Username",
		rules: {
			required: {
				value: true,
				message: "Please provide your username",
			},
			minLength: {
				value: 8,
				message: "Username must be at least eight (8) characters long",
			},
		},
	},
	{
		name: "password",
		placeholder: "Password",
		rules: {
			required: {
				value: true,
				message: "Please provide your password",
			},
			minLength: {
				value: 8,
				message: "Password must be at least eight (8) characters long",
			},
		},
	},
	{
		name: "confirmPassword",
		placeholder: "Confirm password",
		rules: {
			required: {
				value: true,
				message: "Please provide your passord",
			},
		},
	},
];

export default function SignUp() {
	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
		watch,
		setError: setFormError,
	} = useForm<FormData>({
		defaultValues: {
			name: "",
			email: "",
			username: "",
			password: "",
		},
	});
	const router = useRouter();
	const [error, setError] = useState("");

	const watchedConfirmPasswordValue = watch("confirmPassword");

	const onSubmit = async (payload: FormData) => {
		if (watchedConfirmPasswordValue !== payload.password) {
			setError("Please confirm your password");
			setFormError("confirmPassword", {
				message: "Please confirm your password",
			});
			return;
		}

		// @TODO: Make a function for creating a request
		const signupResponse = await fetch(
			`http://${URL}:3000/api/v1/auth/signup`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: payload.name,
					email: payload.email,
					username: payload.username,
					password: payload.password,
				}),
			},
		);

		await signupResponse.json();

		if (signupResponse.status === 201) {
			// Login and redirect to messages list

			// @TODO: Make this reusable
			const loginResponse = await fetch(
				`http://${URL}:3000/api/v1/auth/login`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						username: payload.username,
						password: payload.password,
					}),
				},
			);

			await loginResponse.json();

			if (loginResponse.status === 200) {
				router.replace("/messages");
			}
		}
	};

	const handleSignInPress = useCallback(() => router.push("/login"), [router]);

	const handleInputChange = useCallback(
		(value: string, onFormInputChange: (...event: any[]) => void) => {
			onFormInputChange(value);
			setError("");
		},
		[],
	);

	return (
		<>
			<View
				style={{
					flex: 1,
					justifyContent: "center",
				}}
			>
				<Text style={styles.title}>Sign Up</Text>

				{inputs.map((input, index) => (
					<ControlledTextInput
						key={index}
						control={control as any}
						errors={errors}
						handleInputChange={handleInputChange}
						name={input.name}
						placeholder={input.placeholder}
						rules={input.rules}
					/>
				))}

				<View style={styles.signInContainer}>
					<Text style={styles.alreadyHaveAnAccountText}>
						Already have an account?
					</Text>
					<Pressable onPress={handleSignInPress}>
						<Text style={styles.loginText}>Sign In</Text>
					</Pressable>
				</View>

				{error && (
					<View style={styles.errorContainer}>
						<Text style={styles.errorText}>{error}</Text>
					</View>
				)}
			</View>

			<Pressable
				disabled={isSubmitting}
				style={({ pressed }) => [
					styles.button,
					{ backgroundColor: pressed ? SECONDARY : PRIMARY },
				]}
				onPress={handleSubmit(onSubmit)}
			>
				{!isSubmitting ? (
					<Text style={styles.buttonText}>Sign Up</Text>
				) : (
					<ActivityIndicator color={"black"} />
				)}
			</Pressable>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		padding: 24,
		backgroundColor: "#fff",
	},
	title: {
		fontSize: 32,
		color: PRIMARY,
		fontFamily: PoppinsBold,
		textAlign: "center",
		textShadowColor: "#333",
		textShadowOffset: { width: 3, height: 1 },
		textShadowRadius: 1,
		letterSpacing: 4,
		marginBottom: 16,
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
	inputContainer: {
		marginBottom: 16,
		gap: 4,
	},
	errorMessage: {
		fontFamily: PoppinsMedium,
		color: "red",
	},
	button: {
		backgroundColor: PRIMARY,
		paddingVertical: 14,
		borderRadius: 16,
		alignItems: "center",
		marginTop: "auto",
		marginBottom: Platform.OS === "ios" ? 40 : 16,
	},
	buttonText: {
		color: "black",
		fontSize: 18,
		fontWeight: "600",
	},
	signInContainer: {
		flexDirection: "row",
		justifyContent: "center",
		gap: 8,
	},
	alreadyHaveAnAccountText: {
		fontSize: 14,
		fontFamily: PoppinsSemibold,
	},
	loginText: {
		fontSize: 14,
		fontFamily: PoppinsBold,
		color: PRIMARY,
	},
	errorContainer: {
		backgroundColor: ERROR,
		padding: 16,
		flexDirection: "row",
		justifyContent: "center",
		borderRadius: 16,
		marginTop: 16,
		fontFamily: PoppinsSemibold,
	},
	errorText: {
		fontSize: 16,
		fontWeight: 600,
		color: "white",
	},
});
