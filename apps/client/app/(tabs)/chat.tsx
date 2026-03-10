import { URL } from "@/constants/url";
import { getSocket } from "@/services/socket";
import { useAuthStore } from "@/store/authStore";
import { Message, useChatStore } from "@/store/chatStore";
import { apiRequest } from "@/utils/apiRequest";
import { useRouter } from "expo-router";
import { ArrowLeftIcon, Send } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
	FlatList,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Chat() {
	const chatName = useChatStore((state) => state.chatName);
	const messages = useChatStore((state) => state.messages);
	const conversationId = useChatStore((state) => state.conversationId);
	const setMessages = useChatStore((state) => state.setMessages);
	const userId = useAuthStore((state) => state.userId);
	const socket = getSocket();
	const scrollViewRef = useRef<FlatList>(null);
	const { top, bottom } = useSafeAreaInsets();
	const [typing, setTyping] = useState(false);
	const typingRef = useRef<NodeJS.Timeout | null>(null);
	const accessToken = useAuthStore((state) => state.accessToken);

	// Input
	const [message, setMessage] = useState("");

	const router = useRouter();

	const handleSendMessage = () => {
		if (typingRef.current) {
			clearTimeout(typingRef.current);
			socket.emit("end_typing", { conversationId });
		}
		socket.emit("send_message", {
			conversationId: conversationId,
			message,
		});

		setMessage("");
	};

	const handleTyping = (text: string) => {
		setMessage(text);

		socket.emit("start_typing", { conversationId });

		if (typingRef.current) {
			clearTimeout(typingRef.current);
		}

		typingRef.current = setTimeout(() => {
			socket.emit("end_typing", { conversationId });
		}, 800) as unknown as NodeJS.Timeout;
	};

	const handleBackPress = () => {
		router.back();
	};

	useEffect(() => {
		socket.on("receive_message", (data: Message[]) => {
			setMessages(data);
		});

		socket.on("start_typing", () => {
			setTyping(true);
		});

		socket.on("end_typing", () => {
			setTyping(false);
		});

		return () => {
			socket.off("receive_message");
			socket.off("start_typing");
			socket.off("end_typing");
		};
	}, [setMessages, socket]);

	useEffect(() => {
		const fetchMessages = async () => {
			const data = await apiRequest(
				`http://${URL}:3000/api/v1/chats/messages/${conversationId}`,
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				},
			);

			const messages = (data as any).data as Message[];
			setMessages(messages);

			const socket = getSocket();
			socket.emit("join_conversation", { conversationId });
		};
		void fetchMessages();
	}, [accessToken, conversationId, setMessages]);

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "padding"}
			keyboardVerticalOffset={top}
			style={styles.keyboardAvoidingView}
		>
			<View style={styles.headerRow}>
				<Pressable style={styles.backButton} onPress={handleBackPress}>
					<ArrowLeftIcon />
				</Pressable>
				<View style={[styles.avatar, styles.avatarInner]}>
					<Text style={styles.avatarText}>
						{chatName.charAt(0).toUpperCase()}
					</Text>
				</View>
				<View style={styles.headerInfo}>
					<Text style={styles.headerName}>{chatName}</Text>
					<Text style={styles.headerStatus}>Active now</Text>
				</View>
			</View>
			<View style={styles.separator} />

			{/* Chat messages */}
			<FlatList
				ref={scrollViewRef}
				data={messages}
				keyExtractor={(item) => item.messageId.toString()}
				style={styles.scrollView}
				contentContainerStyle={styles.scrollViewContent}
				keyboardDismissMode="on-drag"
				inverted
				renderItem={({ item }) => (
					<View
						style={[
							styles.message,
							item.senderId !== userId
								? styles.messageOther
								: styles.messageSelf,
							{
								alignSelf: item.senderId !== userId ? "flex-start" : "flex-end",
							},
						]}
					>
						<Text style={styles.messageText}>{item.content}</Text>
					</View>
				)}
				ListHeaderComponent={() =>
					typing ? (
						<View style={styles.typingIndicator}>
							<Text>Typing...</Text>
						</View>
					) : null
				}
				onContentSizeChange={() => {
					if (scrollViewRef.current) {
						scrollViewRef.current.scrollToOffset({ offset: 0, animated: true });
					}
				}}
			/>

			<View style={[styles.inputRow, { marginBottom: bottom }]}>
				<TextInput
					multiline
					style={styles.input}
					placeholder="Aa"
					autoCapitalize="none"
					value={message}
					onChangeText={(value) => handleTyping(value)}
				/>
				<Pressable onPress={handleSendMessage}>
					<Send color="#f8c534" fill={"#f8c534"} />
				</Pressable>
			</View>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	keyboardAvoidingView: {
		flex: 1,
		backgroundColor: "white",
	},
	headerRow: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
	},
	backButton: {
		marginRight: 16,
	},
	avatar: {
		width: 50,
		height: 50,
		borderRadius: 25,
	},
	avatarInner: {
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#f8c534",
	},
	avatarText: {
		fontSize: 22,
		fontWeight: "bold",
		color: "#fff",
	},
	headerInfo: {
		padding: 16,
	},
	headerName: {
		fontWeight: "bold",
		fontSize: 18,
	},
	headerStatus: {},
	separator: {
		height: 1,
		backgroundColor: "#eee",
	},
	scrollView: {
		flex: 1,
	},
	scrollViewContent: {
		paddingBottom: 16,
		flexGrow: 1,
		justifyContent: "flex-end",
	},
	message: {
		marginTop: 16,
		minHeight: 30,
		borderRadius: 16,
		marginHorizontal: 16,
		justifyContent: "center",
		paddingHorizontal: 12,
		padding: 12,
	},
	messageOther: {
		backgroundColor: "#f8c534",
	},
	messageSelf: {
		backgroundColor: "#c7bfa9",
	},
	messageText: {
		maxWidth: 200,
	},
	typingIndicator: {
		padding: 8,
		paddingVertical: 12,
		backgroundColor: "#f8c534",
		maxWidth: 80,
		borderRadius: 16,
		marginHorizontal: 16,
		marginTop: 8,
	},
	inputRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		paddingHorizontal: 16,
		paddingTop: 8,
	},
	input: {
		borderColor: "#ccc",
		borderWidth: 1,
		borderRadius: 32,

		paddingHorizontal: 14,
		paddingVertical: 12,
		fontSize: 16,
		backgroundColor: "#f9f9f9",
		marginTop: "auto",
		flex: 1,
		maxHeight: 100,
	},
});
