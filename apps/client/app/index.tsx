import { useAuthStore } from "@/store/authStore";
import { Redirect } from "expo-router";

export default function Page() {
	const authenticated = useAuthStore((s) => s.authenticated);
	const hydrated = useAuthStore.persist.hasHydrated();

	if (!hydrated) return null;

	if (authenticated) {
		return <Redirect href="/messages" />;
	}

	return <Redirect href="/login" />;
}
