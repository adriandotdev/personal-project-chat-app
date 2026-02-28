import { create } from "zustand";

type AuthState = {
	accessToken: string;
	setAccessToken: (value: string) => void;
	userId: number | undefined;
	setUserId: (value: number) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
	accessToken: "",
	setAccessToken: (value) => {
		set({ accessToken: value });
	},
	userId: undefined,
	setUserId: (value: number | undefined) => {
		set({ userId: value });
	},
}));
