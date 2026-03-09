import { PoppinsBold, PoppinsSemibold } from "@/constants/fontFamily";
import { useConfirmationModalStore } from "@/store/confirmationModalStore";
import { Pressable, StyleSheet, Text } from "react-native";
import {
	SafeAreaView,
	useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function ConfirmationModal() {
	const { top } = useSafeAreaInsets();

	const { confirmationEvent, modalText, cancelEvent } =
		useConfirmationModalStore((state) => state);
	return (
		<SafeAreaView style={[styles.safeAreaView, { top: top - 16 }]}>
			<Text style={styles.modalText}>{modalText}</Text>

			<Pressable onPress={confirmationEvent} style={styles.logoutButton}>
				<Text style={styles.logoutButtonText}>Logout</Text>
			</Pressable>

			<Pressable onPress={cancelEvent} style={styles.cancelButton}>
				<Text style={styles.cancelButtonText}>Cancel</Text>
			</Pressable>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeAreaView: {
		justifyContent: "flex-start",
		alignItems: "center",
		paddingHorizontal: 16,
	},
	modalText: {
		fontSize: 20,
		fontFamily: PoppinsBold,
	},
	logoutButton: {
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
	cancelButtonText: {
		color: "#374151",
		fontSize: 16,
		fontWeight: "bold",
		letterSpacing: 1,
		fontFamily: PoppinsSemibold,
	},
});
