import { PRIMARY, SECONDARY } from "@/constants/colors";
import {
	PoppinsBold,
	PoppinsMedium,
	PoppinsSemibold,
} from "@/constants/fontFamily";
import { URL } from "@/constants/url";
import { getSocket } from "@/services/socket";
import { useAuthStore } from "@/store/authStore";
import { Message, useChatStore } from "@/store/chatStore";
import { apiRequest } from "@/utils/apiRequest";
import { useRouter } from "expo-router";

import { ArrowLeftIcon, SendIcon } from "lucide-react-native";
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
	conversationId: number;
};
export default function Users() {
	const accessToken = useAuthStore((state) => state.accessToken);
	const setChatName = useChatStore((state) => state.setChatName);
	const setMessages = useChatStore((state) => state.setMessages);
	const setConversationId = useChatStore((state) => state.setConversationId);
	const userId = useAuthStore((state) => state.userId);

	const [users, setUsers] = useState<User[]>([]);

	const router = useRouter();

	useEffect(() => {
		const getUsers = async () => {
			const data = (await apiRequest(`http:${URL}:3000/api/v1/users`, {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			})) as { data: User[] };

			console.log(data.data);
			setUsers(data.data);
		};

		void getUsers();
	}, [accessToken]);

	const handleChatNavigation = async (item: User) => {
		const socket = getSocket();

		if (item.conversationId) {
			console.log("JOIN ");
			const data = await apiRequest(
				`http://${URL}:3000/api/v1/chats/messages/${item.conversationId}`,
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				},
			);

			const messages = (data as any).data as Message[];
			setMessages(messages);
			setChatName(item.name);
			setConversationId(item.conversationId);

			socket.emit("join_conversation", { conversationId: item.conversationId });
		} else {
			console.log("CREATE AND JOIN ");
			setChatName(item.name);
			socket.emit("create_conversation", {
				participantIds: [item.id],
				creatorId: userId,
			});
		}

		router.push("/chat");
	};

	const handleBackPress = () => {
		router.back();
	};
	return (
		<View style={styles.container}>
			<View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
				<Pressable onPress={handleBackPress}>
					<ArrowLeftIcon />
				</Pressable>
				<Text
					style={{
						fontFamily: PoppinsBold,
						fontSize: 18,
						color: PRIMARY,
						textShadowColor: "#333",
						textShadowOffset: { width: 3, height: 1 },
						textShadowRadius: 1,
						letterSpacing: 2,
					}}
				>
					People You May Know
				</Text>
			</View>

			<TextInput
				style={[styles.input]}
				placeholder="@username"
				autoCapitalize="none"
			/>

			<FlatList
				data={users}
				keyExtractor={(item) => item.id.toString()}
				renderItem={({ item }) => (
					<Pressable
						onPress={() => handleChatNavigation(item)}
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
								style={[
									styles.avatar,
									{
										justifyContent: "center",
										alignItems: "center",
										backgroundColor: "#f8c534",
									},
								]}
							>
								<Text
									style={{ fontSize: 22, fontWeight: "bold", color: "#fff" }}
								>
									{item.name?.charAt(0).toUpperCase()}
								</Text>
							</View>
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
							<SendIcon color={SECONDARY} />
						</Pressable>
					</Pressable>
				)}
				ItemSeparatorComponent={() => <View style={styles.separator} />}
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
	separator: {
		height: 1,
		backgroundColor: "#e6e1e1",
		marginTop: 16,
	},
	avatar: {
		width: 50,
		height: 50,
		borderRadius: 25,
		marginRight: 4,
	},
});
