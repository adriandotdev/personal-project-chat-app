import { URL } from "@/constants/url";
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/authStore";

// Helper to access tokens outside React components
const authStore = {
	get accessToken() {
		return useAuthStore.getState().accessToken;
	},
	set accessToken(token: string) {
		useAuthStore.getState().setAccessToken(token);
	},
	get refreshToken() {
		return useAuthStore.getState().refreshToken;
	},
	set refreshToken(token: string) {
		useAuthStore.getState().setRefreshToken(token);
	},
};

async function refreshAccessToken() {
	const refreshToken = authStore.refreshToken;
	console.log(
		"[refreshAccessToken] Called. Current refreshToken:",
		refreshToken,
	);
	if (!refreshToken) throw new Error("No refresh token available");
	try {
		const response = await axios.post(
			`http://${URL}:3000/api/v1/auth/refresh`,
			{
				refreshToken,
			},
		);
		const data = response.data;
		console.log(
			"[refreshAccessToken] Token refreshed. New accessToken:",
			data.accessToken,
			"New refreshToken:",
			data.refreshToken,
		);
		authStore.accessToken = data.accessToken;
		if (data.refreshToken) {
			authStore.refreshToken = data.refreshToken;
		}
		return data.accessToken;
	} catch (err) {
		console.error("[refreshAccessToken] Failed to refresh token:", err);
		throw new Error("Failed to refresh token");
	}
}

export async function apiRequest<T>(
	url: string,
	options: AxiosRequestConfig = {},
	retry = true,
): Promise<T> {
	const accessToken = authStore.accessToken;
	const headers = {
		"Content-Type": "application/json",
		...options.headers,
		...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
	};

	console.log("[apiRequest] Request:", {
		url,
		options,
		accessToken,
		headers,
		retry,
	});

	try {
		const response = await axios({
			url,
			...options,
			headers,
		});
		console.log("[apiRequest] Success:", {
			url,
			status: response.status,
			data: response.data,
		});
		return response.data;
	} catch (error) {
		const err = error as AxiosError;

		if (err.response && err.response.status === 401 && retry) {
			console.warn(
				"[apiRequest] 401 detected, attempting token refresh and retry...",
			);
			try {
				await refreshAccessToken();
				return apiRequest<T>(url, options, false);
			} catch (refreshError) {
				throw new Error("Session expired. Please log in again.");
			}
		}
		let message = "Request failed";
		if (
			err.response &&
			err.response.data &&
			typeof err.response.data === "object" &&
			"message" in err.response.data
		) {
			message = (err.response.data as any).message;
		}
		throw new Error(message);
	}
}
