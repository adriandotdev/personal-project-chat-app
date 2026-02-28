import { asc, eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Request, Response } from "express";
import { Pool } from "pg";
import {
	conversationParticipants,
	conversations,
	messages,
	users,
} from "../db/schema";

export class ChatController {
	constructor(
		private db: NodePgDatabase<Record<string, never>> & {
			$client: Pool;
		},
	) {}

	getChats = async (req: Request, res: Response) => {
		// Fetch chat list
		const result = await this.db
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
		const participants = await this.db
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
	};
}
