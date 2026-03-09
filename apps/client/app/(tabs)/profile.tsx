import { PRIMARY } from "@/constants/colors";
import { PoppinsBold, PoppinsSemibold } from "@/constants/fontFamily";
import { URL } from "@/constants/url";
import { useAuthStore } from "@/store/authStore";
import { useConfirmationModalStore } from "@/store/confirmationModalStore";
import { apiRequest } from "@/utils/apiRequest";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type UserProfile = {
	name: string;
	username: string;
	email: string;
	password: string;
	mobileNumber: string;
};

function getInitials(name: string) {
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase();
}

export default function ProfileScreen() {
	const router = useRouter();
	const { bottom } = useSafeAreaInsets();

	const accessToken = useAuthStore((state) => state.accessToken);
	const { setModalText, setConfirmationEvent, setCancelEvent } =
		useConfirmationModalStore((state) => state);
	const [profile, setProfile] = useState<UserProfile | null>(null);

	const getUserProfile = useCallback(async () => {
		const result = await apiRequest<{ data: UserProfile }>(
			`http://${URL}:3000/api/v1/users/profile`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
			},
		);

		setProfile(result.data);
	}, [accessToken]);

	useEffect(() => {
		void getUserProfile();
	}, [getUserProfile]);

	if (!profile)
		return (
			<View style={styles.container}>
				<Text>Loading...</Text>
			</View>
		);

	return (
		<View style={styles.container}>
			<Pressable
				onPress={() => {
					router.back();
				}}
				style={styles.backButton}
			>
				<ArrowLeft />
			</Pressable>
			<View style={styles.avatar}>
				<Text style={styles.avatarText}>{getInitials(profile.name)}</Text>
			</View>
			<Text style={styles.name}>{profile.name}</Text>
			<Text style={styles.username}>@{profile.username}</Text>
			<View style={styles.infoContainer}>
				<Text style={styles.label}>Email</Text>
				<Text style={styles.value}>{profile.email ?? "N/A"}</Text>
				<Text style={styles.label}>Mobile</Text>
				<Text style={styles.value}>{profile.mobileNumber ?? "N/A"}</Text>
			</View>
			<Pressable
				onPress={() => {
					setModalText("Are you sure you want to logout?");
					setConfirmationEvent(() => {
						useAuthStore.persist.clearStorage();
						router.replace("/login");
					});
					setCancelEvent(() => {
						router.back();
					});
					router.push("/confirmation-modal");
				}}
				style={[styles.logoutButton, { bottom }]}
			>
				<Text style={styles.logoutButtonText}>Logout</Text>
			</Pressable>
		</View>
	);
}

const colors = {
	background: "white",
	card: "white",
	primary: PRIMARY,
	text: "black",
	secondaryText: "#a1a1aa",
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.background,
		alignItems: "center",

		paddingHorizontal: 32,
	},
	backButton: { alignSelf: "flex-start" },
	avatar: {
		width: 96,
		height: 96,
		borderRadius: 48,
		backgroundColor: colors.primary,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 24,
		boxShadow: "2px 1px 0px rgba(0,0,0,1)",
	},
	avatarText: {
		color: colors.text,
		fontSize: 36,
		fontFamily: PoppinsBold,
	},
	name: {
		color: colors.text,
		fontSize: 24,
		fontFamily: PoppinsSemibold,
		marginBottom: 4,
	},
	username: {
		color: colors.secondaryText,
		fontSize: 16,
		marginBottom: 24,
	},
	infoContainer: {
		backgroundColor: colors.card,
		borderRadius: 12,
		padding: 20,
		width: "100%",
		marginTop: 16,
		boxShadow: "5px 5px 0px rgba(0, 0, 0, 1)",
		borderWidth: 0.5,
		borderColor: "#ccc",
	},
	label: {
		color: colors.secondaryText,
		fontSize: 14,
		marginTop: 8,
	},
	value: {
		color: colors.text,
		fontSize: 16,
		marginBottom: 8,
	},
	logoutButton: {
		marginTop: "auto",
		backgroundColor: colors.primary,
		paddingVertical: 14,
		paddingHorizontal: 40,
		borderRadius: 24,
		alignItems: "center",
		justifyContent: "center",
		width: "100%",
		boxShadow: "3px 3px 0px rgba(0, 0, 0, 1)",
	},
	logoutButtonText: {
		color: "white",
		fontSize: 16,
		fontFamily: PoppinsSemibold,
		letterSpacing: 1,
	},
});
