import { create } from "zustand";

export type Message = {
	messageId: number;
	conversationId: number;
	content: string;
	senderId: number;
	senderName: string;
};

type ConfirmationModalState = {
	modalText: string;
	setModalText: (value: string) => void;
	confirmationEvent: (() => void) | undefined;
	setConfirmationEvent: (event: () => void) => void;
	cancelEvent: (() => void) | undefined;
	setCancelEvent: (event: () => void) => void;
};

export const useConfirmationModalStore = create<ConfirmationModalState>(
	(set) => ({
		modalText: "",
		setModalText: (value: string) => {
			set({ modalText: value });
		},
		confirmationEvent: undefined,
		setConfirmationEvent: (event: () => void) => {
			set({ confirmationEvent: event });
		},
		cancelEvent: undefined,
		setCancelEvent: (event: () => void) => {
			set({ cancelEvent: event });
		},
	}),
);
