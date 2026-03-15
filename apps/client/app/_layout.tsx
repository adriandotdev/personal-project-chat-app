import { useAuthStore } from "@/store/authStore";
import {
	Poppins_400Regular,
	Poppins_500Medium,
	Poppins_600SemiBold,
	Poppins_700Bold,
	useFonts,
} from "@expo-google-fonts/poppins";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { Platform, UIManager } from "react-native";

if (Platform.OS === "android") {
	if (UIManager.setLayoutAnimationEnabledExperimental) {
		UIManager.setLayoutAnimationEnabledExperimental(true);
	}
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [fontsLoaded] = useFonts({
		Poppins_600SemiBold,
		Poppins_700Bold,
		Poppins_500Medium,
		Poppins_400Regular,
	});
	const { authenticated } = useAuthStore();

	useEffect(() => {
		if (fontsLoaded) {
			SplashScreen.hideAsync();
		}
	}, [fontsLoaded]);

	if (!fontsLoaded) {
		console.log("FONTS LOADED");
		return null;
	}

	return (
		// <SafeAreaProvider>
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Protected guard={authenticated}>
				<Stack.Screen name="(tabs)" />
			</Stack.Protected>
			<Stack.Protected guard={!authenticated}>
				<Stack.Screen name="index" />
			</Stack.Protected>

			<Stack.Screen
				name="confirmation-modal"
				options={{
					presentation: "formSheet",
					animation: "slide_from_bottom",
					sheetAllowedDetents: [0.45],
					sheetGrabberVisible: true,
				}}
			/>
		</Stack>
		// </SafeAreaProvider>
	);
}
