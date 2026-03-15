import { ERROR, PRIMARY, SECONDARY } from "@/constants/colors";
import {
	PoppinsBold,
	PoppinsMedium,
	PoppinsSemibold,
} from "@/constants/fontFamily";
import { URL } from "@/constants/url";
import { useAuthStore } from "@/store/authStore";
import { apiRequest } from "@/utils/apiRequest";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
	password: string;
};

const Login = () => {
	const { setAccessToken, setUserId, setAuthenticated } = useAuthStore(
		(state) => state,
	);
	const [error, setError] = useState("");
	const router = useRouter();

	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<FormData>({
		defaultValues: {
			username: "username",
			password: "password",
		},
	});

	const onSubmit = async (payload: FormData) => {
		try {
			const response = await apiRequest<{
				accessToken: string;
				refreshToken: string;
				userId: number;
			}>(
				`http://${URL}:3000/api/v1/auth/login`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					data: JSON.stringify({
						username: payload.username,
						password: payload.password,
					}),
				},
				false,
			);

			setAccessToken(response.accessToken);
			setUserId(response.userId);
			setAuthenticated(true);

			router.push("/messages");
		} catch (err) {
			if (err instanceof Error) setError(err.message);
		}
	};

	const handleSignUpPress = () => {
		router.push("/signup");
	};

	return (
		<>
			<View
				style={{
					flex: 1,
					justifyContent: "center",
				}}
			>
				<Text style={styles.title}>Daily Bytes</Text>

				<Controller
					control={control}
					rules={{ required: true }}
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
								onChangeText={(value) => {
									onChange(value);
									setError("");
								}}
								autoCapitalize="none"
							/>
							{errors.username && (
								<Text style={styles.errorMessage}>Username is required</Text>
							)}
						</View>
					)}
					name="username"
				/>

				<Controller
					control={control}
					rules={{ required: true }}
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
								onChangeText={(value) => {
									onChange(value);
									setError("");
								}}
								secureTextEntry
							/>
							{errors.password && (
								<Text style={styles.errorMessage}>Password is required</Text>
							)}
						</View>
					)}
					name="password"
				/>
				<View style={styles.signupSection}>
					<Text style={styles.dontHaveAccount}>
						{"Don't have an account yet?"}
					</Text>
					<Pressable onPress={handleSignUpPress}>
						<Text style={styles.signupText}>Sign Up</Text>
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
					<Text style={styles.buttonText}>Log In</Text>
				) : (
					<ActivityIndicator color={"black"} />
				)}
			</Pressable>
		</>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		padding: 24,
		backgroundColor: "#fff",
	},
	title: {
		fontSize: 28,
		marginBottom: 24,
		textAlign: "center",
		color: PRIMARY,
		fontFamily: PoppinsBold,
		textShadowColor: "#333",
		textShadowOffset: { width: 3, height: 1 },
		textShadowRadius: 1,
		letterSpacing: 4,
	},
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
	signupSection: {
		flexDirection: "row",
		justifyContent: "center",
		gap: 8,
	},
	dontHaveAccount: {
		fontSize: 14,
		fontFamily: PoppinsSemibold,
	},
	signupText: {
		fontSize: 14,
		fontFamily: PoppinsBold,
		color: PRIMARY,
	},
	button: {
		backgroundColor: PRIMARY,
		paddingVertical: 14,
		borderRadius: 16,
		alignItems: "center",

		marginTop: "auto",
		marginBottom: Platform.OS === "ios" ? 40 : 16,
		boxShadow: "5px 5px 0px rgba(0, 0, 0, 1)",
	},
	buttonText: {
		color: "black",
		fontSize: 18,
		fontWeight: "600",
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
	errorMessage: {
		fontFamily: PoppinsMedium,
		color: "red",
	},
});

export default Login;
