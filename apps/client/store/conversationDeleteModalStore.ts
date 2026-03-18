import { create } from "zustand";

interface ConversationDeleteModalState {
	conversationId: number | null;
	setConversationId: (value: number | null) => void;
}

export const useConversationDeleteModalStore =
	create<ConversationDeleteModalState>((set) => ({
		conversationId: null,
		setConversationId: (value: number | null) => {
			set({ conversationId: value });
		},
	}));
