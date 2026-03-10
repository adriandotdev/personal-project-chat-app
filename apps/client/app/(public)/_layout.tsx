import { Slot } from "expo-router";
import { useEffect, useState } from "react";
import {
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	TouchableWithoutFeedback,
} from "react-native";

export default function PublicLayout() {
	// Solutions found here: https://stackoverflow.com/questions/79643891/keyboardavoidingview-issue-on-android
	const [flexToggle, setFlexToggle] = useState(false);

	useEffect(() => {
		const keyboardShowListener = Keyboard.addListener("keyboardDidShow", () => {
			setFlexToggle(false);
		});

		const keyboardHideListener = Keyboard.addListener("keyboardDidHide", () => {
			setFlexToggle(true);
		});

		return () => {
			keyboardShowListener.remove();
			keyboardHideListener.remove();
		};
	}, []);

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={
					flexToggle
						? [{ flexGrow: 1 }, styles.container]
						: [{ flex: 1 }, styles.container]
				}
				enabled={!flexToggle}
			>
				<Slot />
			</KeyboardAvoidingView>
		</TouchableWithoutFeedback>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		padding: 24,
		backgroundColor: "#fff",
	},
});
