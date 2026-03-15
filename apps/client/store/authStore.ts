import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type AuthState = {
	authenticated: boolean;
	setAuthenticated: (value: boolean) => void;
	accessToken: string;
	setAccessToken: (value: string) => void;
	refreshToken: string;
	setRefreshToken: (value: string) => void;
	userId: number | undefined;
	setUserId: (value: number | undefined) => void;
};

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			accessToken: "",
			setAccessToken: (value) => {
				set({ accessToken: value });
			},
			refreshToken: "",
			setRefreshToken: (value) => {
				set({ refreshToken: value });
			},
			userId: undefined,
			setUserId: (value: number | undefined) => {
				set({ userId: value });
			},
			authenticated: false,
			setAuthenticated: (value: boolean) => {
				set({ authenticated: value });
			},
		}),
		{
			name: "auth-storage",
			storage: createJSONStorage(() => AsyncStorage),
		},
	),
);
