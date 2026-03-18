import { PRIMARY } from "@/constants/colors";
import { PoppinsBold, PoppinsSemibold } from "@/constants/fontFamily";
import { URL } from "@/constants/url";
import { useSocket } from "@/contexts/SocketConnectionContext";
import { useAuthStore } from "@/store/authStore";
import { useConversationDeleteModalStore } from "@/store/conversationDeleteModalStore";
import { apiRequest } from "@/utils/apiRequest";
import { Checkbox } from "expo-checkbox";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import {
	SafeAreaView,
	useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function ConfirmationModal() {
	const router = useRouter();
	const { top } = useSafeAreaInsets();
	const [isChecked, setChecked] = useState(false);

	const { conversationId } = useConversationDeleteModalStore();
	const { userId } = useAuthStore();

	const { socket } = useSocket();
	const handleDeleteConversation = async () => {
		const response = await apiRequest<{
			data: { id: number }[];
			message: string;
		}>(`http://${URL}:3000/api/v1/chats`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
			data: JSON.stringify({
				conversationId: conversationId,
				deleteBoth: isChecked,
			}),
		});

		let participants = response.data
			.map((item) => item.id)
			.filter((item) => item !== userId);

		socket?.emit("delete_message", participants);

		router.back();
	};

	return (
		<SafeAreaView style={[styles.safeAreaView, { top: top - 16 }]}>
			<Text style={styles.modalText}>Delete Conversation</Text>

			<Pressable
				onPress={handleDeleteConversation}
				style={styles.confirmButton}
			>
				<Text style={styles.logoutButtonText}>Delete Conversation</Text>
			</Pressable>

			<Pressable
				onPress={() => {
					if (router.canGoBack()) router.back();
				}}
				style={styles.cancelButton}
			>
				<Text style={styles.cancelButtonText}>Go Back</Text>
			</Pressable>

			<Pressable
				onPress={() => setChecked(!isChecked)}
				style={styles.checkboxContainer}
			>
				<Checkbox
					value={isChecked}
					onValueChange={setChecked}
					color={isChecked ? PRIMARY : undefined}
				/>
				<Text>Also delete for the other participant</Text>
			</Pressable>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeAreaView: {
		justifyContent: "flex-start",
		alignItems: "center",
		paddingHorizontal: 32,
	},
	modalText: {
		fontSize: 20,
		fontFamily: PoppinsBold,
	},
	confirmButton: {
		marginTop: 32,
		marginHorizontal: 24,
		backgroundColor: "#EF4444",
		paddingVertical: 14,
		paddingHorizontal: 40,
		borderRadius: 24,
		alignItems: "center",
		width: "100%",
		justifyContent: "center",
	},
	logoutButtonText: {
		color: "white",
		fontSize: 16,
		fontFamily: PoppinsSemibold,
		letterSpacing: 1,
	},
	cancelButton: {
		marginTop: 16,
		marginHorizontal: 24,
		backgroundColor: "#F3F4F6",
		paddingVertical: 14,
		paddingHorizontal: 40,
		borderRadius: 24,
		alignItems: "center",
		justifyContent: "center",
	},
	checkboxContainer: {
		flexDirection: "row",
		gap: 8,
		marginTop: 16,
	},
	cancelButtonText: {
		color: "#374151",
		fontSize: 16,
		fontWeight: "bold",
		letterSpacing: 1,
		fontFamily: PoppinsSemibold,
	},
});
