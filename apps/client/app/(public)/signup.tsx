import { ERROR, PRIMARY, SECONDARY } from "@/constants/colors";
import {
	PoppinsBold,
	PoppinsMedium,
	PoppinsSemibold,
} from "@/constants/fontFamily";
import { URL } from "@/constants/url";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
	ActivityIndicator,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";

type FormData = {
	username: string;
	name: string;
	email: string;
	password: string;
	confirmPassword: string;
};

/**
 * @TODO Make all controlled inputs reusable for consistency in forms!!!!
 */
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

	const handleSignInPress = () => router.push("/login");

	const handleInputChange = (
		value: string,
		onFormInputChange: (...event: any[]) => void,
	) => {
		onFormInputChange(value);
		setError("");
	};

	return (
		<>
			<View
				style={{
					flex: 1,
					justifyContent: "center",
				}}
			>
				<Text style={styles.title}>Sign Up</Text>
				<Controller
					control={control}
					rules={{ required: true }}
					render={({ field: { onChange, onBlur, value } }) => (
						<View style={styles.inputContainer}>
							<TextInput
								style={[
									styles.input,
									{ borderColor: errors.name ? ERROR : PRIMARY },
								]}
								placeholder="Name"
								onBlur={onBlur}
								value={value}
								onChangeText={(value) => handleInputChange(value, onChange)}
							/>
							{errors.name && (
								<Text style={styles.errorMessage}>
									Please provide your name
								</Text>
							)}
						</View>
					)}
					name="name"
				/>

				<Controller
					control={control}
					rules={{ required: true }}
					render={({ field: { onChange, onBlur, value } }) => (
						<View style={styles.inputContainer}>
							<TextInput
								style={[
									styles.input,
									{ borderColor: errors.email ? ERROR : PRIMARY },
								]}
								placeholder="Email"
								onBlur={onBlur}
								value={value}
								onChangeText={(value) => handleInputChange(value, onChange)}
								autoCapitalize="none"
							/>
							{errors.email && (
								<Text style={styles.errorMessage}>
									Please provide a valid email
								</Text>
							)}
						</View>
					)}
					name="email"
				/>

				<Controller
					control={control}
					rules={{
						required: {
							value: true,
							message: "Please provide your username",
						},
						minLength: {
							value: 8,
							message: "Username must be at least eight (8) characters long",
						},
					}}
					render={({ field: { onChange, onBlur, value } }) => (
						<View style={styles.inputContainer}>
							<TextInput
								style={[
									styles.input,
									{ borderColor: errors.username ? ERROR : PRIMARY },
								]}
								placeholder="Username"
								onBlur={onBlur}
								value={value}
								onChangeText={(value) => handleInputChange(value, onChange)}
								autoCapitalize="none"
							/>
							{errors.username && (
								<Text style={styles.errorMessage}>
									{errors.username
										? errors.username.message
										: "Username is required"}
								</Text>
							)}
						</View>
					)}
					name="username"
				/>

				<Controller
					control={control}
					rules={{
						required: {
							value: true,
							message: "Please provide your passord",
						},
						minLength: {
							value: 8,
							message: "Password must be at least eight (8) characters long",
						},
					}}
					render={({ field: { onChange, onBlur, value } }) => (
						<View style={styles.inputContainer}>
							<TextInput
								style={[
									styles.input,
									{ borderColor: errors.password ? ERROR : PRIMARY },
								]}
								placeholder="Password"
								onBlur={onBlur}
								value={value}
								onChangeText={(value) => handleInputChange(value, onChange)}
								autoCapitalize="none"
							/>
							{errors.password && (
								<Text style={styles.errorMessage}>
									Please provide your password
								</Text>
							)}
						</View>
					)}
					name="password"
				/>

				<Controller
					control={control}
					rules={{ required: true }}
					render={({ field: { onChange, onBlur, value } }) => (
						<View style={styles.inputContainer}>
							<TextInput
								style={[
									styles.input,
									{ borderColor: errors.confirmPassword ? ERROR : PRIMARY },
								]}
								placeholder="Confirm Password"
								onBlur={onBlur}
								value={value}
								onChangeText={(value) => handleInputChange(value, onChange)}
								autoCapitalize="none"
							/>
							{errors.confirmPassword && (
								<Text style={styles.errorMessage}>
									Please confirm your password
								</Text>
							)}
						</View>
					)}
					name="confirmPassword"
				/>

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
