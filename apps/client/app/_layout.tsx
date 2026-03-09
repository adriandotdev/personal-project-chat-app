import {
	Poppins_400Regular,
	Poppins_500Medium,
	Poppins_600SemiBold,
	Poppins_700Bold,
	useFonts,
} from "@expo-google-fonts/poppins";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
	const [fontsLoaded] = useFonts({
		Poppins_600SemiBold,
		Poppins_700Bold,
		Poppins_500Medium,
		Poppins_400Regular,
	});

	if (!fontsLoaded) return null;

	return (
		<SafeAreaProvider>
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen name="index" />
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
		</SafeAreaProvider>
	);
}
