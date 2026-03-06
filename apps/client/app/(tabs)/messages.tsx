import { PRIMARY } from "@/constants/colors";
import { PoppinsMedium } from "@/constants/fontFamily";
import { URL } from "@/constants/url";
import { connectSocket, disconnectSocket, getSocket } from "@/services/socket";
import { useAuthStore } from "@/store/authStore";
import { Message, useChatStore } from "@/store/chatStore";
import { apiRequest } from "@/utils/apiRequest";
import { useFocusEffect, useRouter } from "expo-router";
import { SquarePen } from "lucide-react-native";

import React, { useCallback, useEffect, useState } from "react";
import {
	FlatList,
	Pressable,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

interface ChatItem {
	conversationId: number;
	messageId: number;
	message: string;
	content: string;
	senderId: number;
	conversationName: string;
}

export default function MessagesScreen() {
	const accessToken = useAuthStore((state) => state.accessToken);
	const userId = useAuthStore((state) => state.userId);

	const setChatName = useChatStore((state) => state.setChatName);
	const setMessages = useChatStore((state) => state.setMessages);
	const setConversationId = useChatStore((state) => state.setConversationId);

	const [chatList, setChatList] = useState<ChatItem[]>([]);

	const router = useRouter();

	const fetchMessages = useCallback(async () => {
		try {
			const response = await fetch(`http://${URL}:3000/api/v1/chats`, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			const data = await response.json();

			console.log(data);

			setChatList(data.data.chats);
		} catch {
			// Silent handler
		}
	}, [accessToken]);

	const handleChatPress = async (item: ChatItem) => {
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
		setChatName(item.conversationName);
		setConversationId(item.conversationId);
		const socket = getSocket();
		socket.emit("join_conversation", { conversationId: item.conversationId });
		router.push("/chat");
	};

	useFocusEffect(() => void fetchMessages());
	useEffect(() => {
		void fetchMessages();
	}, [accessToken, fetchMessages]);

	useEffect(() => {
		if (userId) {
			connectSocket(userId);
		}

		return () => {
			disconnectSocket();
		};
	}, [userId]);

	useEffect(() => {
		const socket = getSocket();

		if (socket) {
			socket.on("chat_list_update", async () => {
				await fetchMessages();
			});
		}
	}, [fetchMessages]);

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<View style={styles.headerRow}>
					<Pressable style={styles.profileIconStyled}>
						<Text style={styles.profileIconText}>
							{"A"?.charAt(0).toUpperCase()}
						</Text>
					</Pressable>
					<Text style={styles.headerTitle}>Chats</Text>
				</View>
				<Pressable onPress={() => router.push("/users")}>
					<SquarePen />
				</Pressable>
			</View>
			<FlatList
				data={chatList}
				keyExtractor={(item) => item.conversationId.toString()}
				renderItem={({ item }) => (
					<TouchableOpacity
						onPress={() => handleChatPress(item)}
						style={styles.chatRow}
					>
						<View style={styles.avatarStyled}>
							<Text style={styles.avatarText}>
								{item.conversationName?.charAt(0).toUpperCase()}
							</Text>
						</View>

						<View style={styles.textContainer}>
							<Text style={styles.chatName} numberOfLines={1}>
								{item.conversationName}
							</Text>

							<Text style={styles.lastMessage} numberOfLines={1}>
								{item.senderId !== userId
									? item.content
									: `You: ${item.content}`}
							</Text>
						</View>
					</TouchableOpacity>
				)}
				ItemSeparatorComponent={() => <View style={styles.separator} />}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	headerRow: {
		flexDirection: "row",
	},
	profileIconStyled: {
		width: 30,
		height: 30,
		borderRadius: 25,
		marginRight: 14,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#f8c534",
	},
	profileIconText: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#fff",
	},
	headerTitle: {
		fontSize: 24,
		fontWeight: 700,
	},
	avatarStyled: {
		width: 50,
		height: 50,
		borderRadius: 25,
		marginRight: 14,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#f8c534",
	},
	avatarText: {
		fontSize: 22,
		fontWeight: "bold",
		color: "#fff",
	},
	container: {
		flex: 1,
		backgroundColor: "#fff",
		paddingVertical: 16,
	},
	item: {
		flexDirection: "row",
		alignItems: "center",
		padding: 16,
	},
	content: {
		flex: 1,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 18,
		paddingBottom: 18,
		borderBottomWidth: 0.5,
		borderBottomColor: "#f8c534",
	},
	sender: {
		fontWeight: "bold",
		fontSize: 16,
	},
	time: {
		color: "#888",
		fontSize: 12,
	},
	text: {
		color: "#333",
		fontSize: 14,
		marginTop: 4,
	},
	unread: {
		fontWeight: "bold",
		color: "#000",
	},
	dot: {
		width: 10,
		height: 10,
		borderRadius: 5,
		backgroundColor: "#007AFF",
		marginLeft: 8,
	},
	separator: {
		height: 1,
		backgroundColor: "#eee",
	},
	chatRow: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 14,
		paddingHorizontal: 16,
		backgroundColor: "#fff",
	},
	avatar: {
		width: 50,
		height: 50,
		borderRadius: 25,
		marginRight: 14,
	},
	profileIcon: {
		width: 30,
		height: 30,
		borderRadius: 25,
		marginRight: 14,
	},
	textContainer: {
		flex: 1,
		justifyContent: "center",
	},
	chatName: {
		fontSize: 16,
		fontWeight: "600",
		color: "#111",
	},
	lastMessage: {
		fontSize: 14,
		color: "#666",
		marginTop: 4,
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
