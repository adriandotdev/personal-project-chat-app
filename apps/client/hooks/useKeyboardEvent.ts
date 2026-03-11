import { useEffect, useState } from "react";
import { Keyboard } from "react-native";

export const useKeyboardEvent = () => {
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

	return flexToggle;
};
