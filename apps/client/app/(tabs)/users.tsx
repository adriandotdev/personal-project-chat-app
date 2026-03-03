import { PRIMARY, SECONDARY } from "@/constants/colors";
import {
	PoppinsBold,
	PoppinsMedium,
	PoppinsSemibold,
} from "@/constants/fontFamily";
import { URL } from "@/constants/url";
import { useAuthStore } from "@/store/authStore";
import { apiRequest } from "@/utils/apiRequest";
import { UserPlus } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
	FlatList,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";

type User = {
	id: number;
	username: string;
	name: string;
};
export default function Users() {
	const accessToken = useAuthStore((state) => state.accessToken);

	const [users, setUsers] = useState<User[]>([]);

	useEffect(() => {
		const getUsers = async () => {
			const data = await apiRequest(`http:${URL}:3000/api/v1/users`, {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			setUsers(data.data as User[]);
		};

		void getUsers();
	}, []);
	return (
		<View style={styles.container}>
			<Text
				style={{
					fontFamily: PoppinsBold,
					fontSize: 24,
					color: PRIMARY,
					textShadowColor: "#333",
					textShadowOffset: { width: 3, height: 1 },
					textShadowRadius: 1,
					letterSpacing: 2,
				}}
			>
				People You May Know
			</Text>

			<TextInput
				style={[styles.input]}
				placeholder="@username"
				autoCapitalize="none"
			/>

			<FlatList
				data={users}
				keyExtractor={(item) => item.id.toString()}
				renderItem={({ item }) => (
					<View
						style={{
							flexDirection: "row",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<View
							style={{
								flexDirection: "row",
								gap: 8,
								marginTop: 16,
								alignItems: "center",
							}}
						>
							<View
								style={{
									height: 50,
									width: 50,
									borderRadius: "100%",
									backgroundColor: PRIMARY,
								}}
							></View>
							<View style={{ gap: 2 }}>
								<Text
									style={{
										fontSize: 16,
										fontFamily: PoppinsSemibold,
										color: PRIMARY,
										textShadowColor: "#333",
										textShadowOffset: { width: 1, height: 1 },
										textShadowRadius: 1,
										letterSpacing: 2,
									}}
								>
									{item.name}
								</Text>
								<Text style={{ fontFamily: PoppinsMedium }}>
									@{item.username}
								</Text>
							</View>
						</View>

						<Pressable style={{ marginTop: 16 }}>
							<UserPlus color={SECONDARY} />
						</Pressable>
					</View>
				)}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		padding: 16,
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
		marginTop: 16,
	},
});
