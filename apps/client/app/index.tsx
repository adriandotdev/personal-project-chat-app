import { useAuthStore } from "@/store/authStore";
import { Redirect } from "expo-router";

export default function Page() {
	const accessToken = useAuthStore((s) => s.accessToken);
	const hydrated = useAuthStore.persist.hasHydrated();

	if (!hydrated) return null;

	if (accessToken) {
		return <Redirect href="/messages" />;
	}

	return <Redirect href="/login" />;
}
