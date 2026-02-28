import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import express, { Request, Response } from "express";

import { asc, eq } from "drizzle-orm";
import { AuthController } from "./controllers/auth.controller";
import {
	conversationParticipants,
	conversations,
	messages,
	users,
} from "./db/schema";
import { validateBody } from "./middlewares/validateBodyMiddleware";
import { verifyAuthToken } from "./middlewares/verifyAuth";
import { loginSchema, signUpSchema } from "./validators/users";

const app = express();

export const db = drizzle(process.env.DATABASE_URL!);

app.use(express.json());

const authController = new AuthController(db);

// Login
app.post("/api/v1/auth/login", validateBody(loginSchema), authController.login);

// Sign Up
app.post(
	"/api/v1/auth/signup",
	validateBody(signUpSchema),
	authController.signUp,
);

app.get(
	"/api/v1/chats",
	verifyAuthToken,
	async (req: Request, res: Response) => {
		// Fetch chat list
		const result = await db
			.select({
				conversationId: conversations.id,
				conversationName: conversations.name,
				content: messages.content,
				senderId: messages.senderId,
				senderName: users.name,
				messageId: messages.id,
			})
			.from(conversations)
			.innerJoin(messages, eq(messages.conversationId, conversations.id))
			.innerJoin(
				conversationParticipants,
				eq(conversationParticipants.conversationId, conversations.id),
			)
			.innerJoin(users, eq(users.id, messages.senderId))
			.where(eq(conversationParticipants.userId, req.token.id))
			.orderBy(asc(messages.createdAt));

		// Fetch chat participants
		const participants = await db
			.select({
				id: users.id,
				name: users.name,
				username: users.username,
			})
			.from(users)
			.innerJoin(
				conversationParticipants,
				eq(conversationParticipants.userId, users.id),
			);

		// Restructure
		const mappedResult = result.reduce(
			(acc: Record<number, any>, current) => {
				if (!acc[current.conversationId]) {
					acc[current.conversationId] = {
						messages: [],
						conversation: {
							id: current.conversationId,
							name: current.conversationName,
						},
					};
				}
				acc[current.conversationId].messages.push(current);
				return acc;
			},
			{} as Record<number, any[]>,
		);

		return res.status(200).json({
			success: true,
			message: "Succesfully retrieved chat list",
			data: {
				chats: mappedResult,
				participants,
			},
		});
	},
);

export default app;
