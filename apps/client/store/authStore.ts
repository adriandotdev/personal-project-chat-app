import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type AuthState = {
	accessToken: string;
	setAccessToken: (value: string) => void;
	userId: number | undefined;
	setUserId: (value: number) => void;
};

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			accessToken: "",
			setAccessToken: (value) => {
				set({ accessToken: value });
			},
			userId: undefined,
			setUserId: (value: number | undefined) => {
				set({ userId: value });
			},
		}),
		{
			name: "auth-storage",
			storage: createJSONStorage(() => AsyncStorage),
		},
	),
);
