import { Tabs } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabLayout() {
	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: "white" }} edges={["top"]}>
			<Tabs screenOptions={{ headerShown: false, animation: "shift" }}>
				<Tabs.Screen
					name={"messages"}
					options={{
						tabBarStyle: { display: "none" },
					}}
				/>
				<Tabs.Screen
					name={"chat"}
					options={{
						tabBarStyle: { display: "none" },
					}}
				/>
				<Tabs.Screen
					name={"users"}
					options={{
						tabBarStyle: { display: "none" },
					}}
				/>
				<Tabs.Screen
					name={"profile"}
					options={{
						tabBarStyle: { display: "none" },
					}}
				/>
			</Tabs>
		</SafeAreaView>
	);
}
