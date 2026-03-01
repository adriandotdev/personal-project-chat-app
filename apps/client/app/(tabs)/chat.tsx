import { getSocket } from "@/services/socket";
import { useAuthStore } from "@/store/authStore";
import { Message, useChatStore } from "@/store/chatStore";
import { Send } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
	Image,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
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
	const scrollViewRef = useRef<ScrollView>(null);
	const { top } = useSafeAreaInsets();
	const [typing, setTyping] = useState(false);
	const typingRef = useRef<NodeJS.Timeout | null>(null);

	// Input
	const [message, setMessage] = useState("");

	const handleSendMessage = () => {
		if (typingRef.current) {
			clearTimeout(typingRef.current);
			socket.emit("end_typing", { conversationId });
		}
		socket.emit("send_message", {
			conversationId: messages[0].conversationId,
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
		};
	}, []);

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			keyboardVerticalOffset={top}
			style={{ flex: 1, backgroundColor: "white" }}
		>
			<View
				style={{
					flexDirection: "row",
					alignItems: "center",
					paddingHorizontal: 16,
				}}
			>
				<Image
					source={{
						uri: "https://i.pravatar.cc/150?img=12",
					}}
					style={styles.avatar}
				/>
				<View style={{ padding: 16 }}>
					<Text style={{ fontWeight: "bold", fontSize: 18 }}>{chatName}</Text>
					<Text>Active now</Text>
				</View>
			</View>
			<View style={styles.separator} />
			{/* Chat messages */}
			<ScrollView
				ref={scrollViewRef}
				style={{ flex: 1 }}
				contentContainerStyle={{
					paddingBottom: 16,
					flexGrow: 1,
					justifyContent: "flex-end",
				}}
				onContentSizeChange={() =>
					scrollViewRef.current?.scrollToEnd({ animated: true })
				}
				showsVerticalScrollIndicator={false}
				keyboardDismissMode="on-drag"
			>
				{messages.map((message) => (
					<View
						style={{
							backgroundColor:
								message.senderId !== userId ? "#f8c534" : "#c7bfa9",
							marginTop: 16,
							minHeight: 30,
							borderRadius: 16,
							marginHorizontal: 16,
							justifyContent: "center",
							paddingHorizontal: 12,
							alignSelf:
								message.senderId !== userId ? "flex-start" : "flex-end",
							padding: 12,
						}}
						key={message.messageId}
					>
						<Text style={{ maxWidth: 200 }}>{message.content}</Text>
					</View>
				))}
				{typing && (
					<View
						style={{
							padding: 8,
							paddingVertical: 12,
							backgroundColor: "#f8c534",
							maxWidth: 80,
							borderRadius: 16,
							marginHorizontal: 16,
							marginTop: 8,
						}}
					>
						<Text>Typing...</Text>
					</View>
				)}
			</ScrollView>

			<View
				style={{
					flexDirection: "row",
					alignItems: "center",
					gap: 8,
					paddingHorizontal: 16,
					paddingTop: 8,
				}}
			>
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
	avatar: {
		width: 50,
		height: 50,
		borderRadius: 25,
	},
	separator: {
		height: 1,
		backgroundColor: "#eee",
	},
	input: {
		borderColor: "#ccc",
		borderWidth: 1,
		borderRadius: 32,
		marginBottom: 16,
		paddingHorizontal: 14,
		paddingVertical: 12,
		fontSize: 16,
		backgroundColor: "#f9f9f9",
		marginTop: "auto",
		flex: 1,
		maxHeight: 100,
	},
});
