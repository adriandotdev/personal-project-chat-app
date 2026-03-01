import { URL } from "@/constants/url";
import { connectSocket, disconnectSocket, getSocket } from "@/services/socket";
import { useAuthStore } from "@/store/authStore";
import { Message, useChatStore } from "@/store/chatStore";
import { useRouter } from "expo-router";
import { SquarePen } from "lucide-react-native";

import React, { useEffect, useState } from "react";
import {
	FlatList,
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

interface ChatItem {
	messages: Message[];
	conversation: { name: string; id: number };
	chatName: string;
	lastMessage: string;
}

interface Participant {
	id: number;
	name: string;
	username: string;
}

export default function MessagesScreen() {
	const accessToken = useAuthStore((state) => state.accessToken);
	const userId = useAuthStore((state) => state.userId);

	const setChatName = useChatStore((state) => state.setChatName);
	const setMessages = useChatStore((state) => state.setMessages);
	const setConversationId = useChatStore((state) => state.setConversationId);

	const [chatList, setChatList] = useState<ChatItem[]>([]);
	const [participants, setParticipants] = useState<Participant[]>([]);

	const router = useRouter();

	useEffect(() => {
		const fetchMessages = async () => {
			try {
				const response = await fetch(`http://${URL}:3000/api/v1/chats`, {
					method: "GET",
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				});

				const data = await response.json();

				let chats: ChatItem[] = Object.values(data.data.chats);
				let participants: Participant[] = data.data.participants;

				chats = chats.map((item) => ({
					...item,

					chatName: participants.filter((item) => item.id !== userId)[0].name,
					lastMessage: item.messages[item.messages.length - 1].content,
				}));

				setParticipants(participants);
				setChatList(chats);
			} catch {
				// Silent handler
			}
		};

		void fetchMessages();
	}, []);

	useEffect(() => {
		if (userId) {
			connectSocket(userId);
		}

		return () => {
			disconnectSocket();
		};
	}, [userId]);

	const handleChatPress = (item: ChatItem) => {
		setMessages(item.messages);
		setChatName(participants.filter((item) => item.id !== userId)[0].name);
		setConversationId(item.conversation.id);

		const socket = getSocket();

		socket.emit("join_conversation", { conversationId: item.conversation.id });
		router.push("/chat");
	};
	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={{ fontSize: 24, fontWeight: 700 }}>Chats</Text>
				<SquarePen />
			</View>
			<FlatList
				data={chatList}
				keyExtractor={(item) => item.conversation.name}
				renderItem={({ item }) => (
					<TouchableOpacity
						onPress={() => handleChatPress(item)}
						style={styles.chatRow}
					>
						<Image
							source={{
								uri: "https://i.pravatar.cc/150?img=12",
							}}
							style={styles.avatar}
						/>

						<View style={styles.textContainer}>
							<Text style={styles.chatName} numberOfLines={1}>
								{item.chatName}
							</Text>

							<Text style={styles.lastMessage} numberOfLines={1}>
								{item.lastMessage}
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
});
