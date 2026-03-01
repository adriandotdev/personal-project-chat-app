export async function apiRequest<T>(
	url: string,
	options: RequestInit = {},
): Promise<T> {
	const response = await fetch(url, {
		headers: {
			"Content-Type": "application/json",
			...options.headers,
		},
		...options,
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({
			message: "Request failed",
		}));

		throw new Error(error.message);
	}

	return response.json();
}
