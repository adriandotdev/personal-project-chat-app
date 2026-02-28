import { create } from "zustand";

export type Message = {
	messageId: number;
	conversationId: number;
	content: string;
	senderId: number;
	senderName: string;
};

type ChatState = {
	chatName: string;
	conversationId: number;
	messages: Message[];
	setChatName: (value: string) => void;
	setMessages: (value: Message[]) => void;
	setConversationId: (value: number) => void;
};

export const useChatStore = create<ChatState>((set) => ({
	chatName: "",
	setChatName: (value: string) => {
		set({ chatName: value });
	},
	messages: [],
	setMessages: (value: Message[]) => {
		set({ messages: value });
	},
	conversationId: 0,
	setConversationId: (value: number) => {
		set({ conversationId: value });
	},
}));
