import z from "zod";

export const signUpSchema = z.object({
	username: z
		.string()
		.min(8, { error: "Username must have at least have 8 characters." }),
	password: z
		.string()
		.min(8, { error: "Password must have at least 8 characters." }),
	name: z.string({ error: "Name is required." }),
});

export const loginSchema = z.object({
	username: z.string({ error: "Username is required" }),
	password: z.string({ error: "Password is required" }),
});

export const refreshSchema = z.object({
	refreshToken: z.string({ error: "Refresh token is required" }),
});

export type SignUpSchema = z.infer<typeof signUpSchema>;

export type LoginSchema = z.infer<typeof loginSchema>;

export type RefreshSchema = z.infer<typeof refreshSchema>;
