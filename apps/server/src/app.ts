import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import express, { type Express } from "express";

import { AuthController } from "./controllers/auth.controller";
import { ChatController } from "./controllers/chat.controller";
import { createAuthRoutes } from "./routes/auth.routes";
import { createChatRoutes } from "./routes/chat.routes";

const app: Express = express();

export const db = drizzle(process.env.DATABASE_URL!);

app.use(express.json());

const authController = new AuthController(db);
const chatController = new ChatController(db);

app.use("/api/v1/auth", createAuthRoutes(authController));
app.use("/api/v1/chats", createChatRoutes(chatController));

// app.get(
// 	"/api/v1/chats",
// 	verifyAuthToken,
// 	async (req: Request, res: Response) => {
// 		// Fetch chat list
// 		const result = await db
// 			.select({
// 				conversationId: conversations.id,
// 				conversationName: conversations.name,
// 				content: messages.content,
// 				senderId: messages.senderId,
// 				senderName: users.name,
// 				messageId: messages.id,
// 			})
// 			.from(conversations)
// 			.innerJoin(messages, eq(messages.conversationId, conversations.id))
// 			.innerJoin(
// 				conversationParticipants,
// 				eq(conversationParticipants.conversationId, conversations.id),
// 			)
// 			.innerJoin(users, eq(users.id, messages.senderId))
// 			.where(eq(conversationParticipants.userId, req.token.id))
// 			.orderBy(asc(messages.createdAt));

// 		// Fetch chat participants
// 		const participants = await db
// 			.select({
// 				id: users.id,
// 				name: users.name,
// 				username: users.username,
// 			})
// 			.from(users)
// 			.innerJoin(
// 				conversationParticipants,
// 				eq(conversationParticipants.userId, users.id),
// 			);

// 		// Restructure
// 		const mappedResult = result.reduce(
// 			(acc: Record<number, any>, current) => {
// 				if (!acc[current.conversationId]) {
// 					acc[current.conversationId] = {
// 						messages: [],
// 						conversation: {
// 							id: current.conversationId,
// 							name: current.conversationName,
// 						},
// 					};
// 				}
// 				acc[current.conversationId].messages.push(current);
// 				return acc;
// 			},
// 			{} as Record<number, any[]>,
// 		);

// 		return res.status(200).json({
// 			success: true,
// 			message: "Succesfully retrieved chat list",
// 			data: {
// 				chats: mappedResult,
// 				participants,
// 			},
// 		});
// 	},
// );

export default app;
