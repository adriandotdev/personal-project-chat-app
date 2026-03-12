import { and, desc, eq, inArray, lt, not } from "drizzle-orm";
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
		const conversationList = await this.db
			.selectDistinct({
				conversationId: conversations.id,
				conversationName: conversations.name,
			})
			.from(conversations)
			.innerJoin(
				conversationParticipants,
				eq(conversationParticipants.conversationId, conversations.id),
			)
			.where(eq(conversationParticipants.userId, req.token.id));

		const conversationIds = conversationList.map(
			(convo) => convo.conversationId,
		);

		const latestMessages = await this.db
			.select({
				conversationId: messages.conversationId,
				messageId: messages.id,
				content: messages.content,
				senderId: messages.senderId,
				createdAt: messages.createdAt,
				conversationName: conversations.name,
				isConversationGroup: conversations.isGroup,
			})
			.from(messages)
			.innerJoin(conversations, eq(conversations.lastMessageId, messages.id))
			.where(inArray(messages.conversationId, conversationIds))
			.orderBy(desc(messages.createdAt));

		const participants = await this.db
			.select({
				id: users.id,
				name: users.name,
				username: users.username,
				conversationId: conversationParticipants.conversationId,
			})
			.from(users)
			.innerJoin(
				conversationParticipants,
				eq(conversationParticipants.userId, users.id),
			)
			.where(not(eq(conversationParticipants.userId, req.token.id)));

		const mapped = latestMessages.map((lm) => ({
			...lm,
			conversationName: lm.isConversationGroup
				? lm.conversationName
				: participants.find((p) => p.conversationId === lm.conversationId)
						?.name,
		}));

		return res.status(200).json({
			success: true,
			message: "Succesfully retrieved chat list",
			data: {
				chats: mapped,
				participants,
			},
		});
	};

	getChatMessagesByConversationId = async (req: Request, res: Response) => {
		const cursor = req.query.cursor;

		const whereClause = [
			eq(messages.conversationId, Number(req.params.conversationId)),
		];

		if (!isNaN(Number(cursor))) {
			whereClause.push(lt(messages.id, Number(cursor)));
		}

		const chatMessages = await this.db
			.select({
				messageId: messages.id,
				conversationId: messages.conversationId,
				content: messages.content,
				senderId: messages.senderId,
				senderName: users.name,
			})
			.from(messages)
			.innerJoin(users, eq(users.id, messages.senderId))
			.where(and(...whereClause))
			.orderBy(desc(messages.id))
			.limit(20);

		return res.status(200).json({
			data: chatMessages,
			nextCursor: chatMessages.length
				? chatMessages[chatMessages.length - 1].messageId
				: null,
		});
	};
}
