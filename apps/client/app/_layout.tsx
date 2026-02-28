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
			<Stack screenOptions={{ headerShown: false }} />
		</SafeAreaProvider>
	);
}
