import { and, eq, not } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Request, Response } from "express";
import { Pool } from "pg";
import { conversationParticipants, users } from "../db/schema";

export class UsersController {
	constructor(
		private db: NodePgDatabase<Record<string, never>> & {
			$client: Pool;
		},
	) {}

	getUsers = async (req: Request, res: Response) => {
		// Get all users except the logged-in user
		const allUsers = await this.db
			.select({
				name: users.name,
				username: users.username,
				id: users.id,
			})
			.from(users)
			.where(not(eq(users.id, req.token.id)));

		// For each user, find conversationId if exists between logged-in user and that user
		const result = await Promise.all(
			allUsers.map(async (user) => {
				// Find conversationId where both users are participants
				const conversations = await this.db
					.select({ conversationId: conversationParticipants.conversationId })
					.from(conversationParticipants)
					.where(eq(conversationParticipants.userId, user.id));

				let conversationId: number | null = null;
				if (conversations.length > 0) {
					// Check if logged-in user is also a participant in any of these conversations
					for (const conv of conversations) {
						const loggedInUserConv = await this.db
							.select()
							.from(conversationParticipants)
							.where(
								and(
									eq(
										conversationParticipants.conversationId,
										conv.conversationId,
									),
									eq(conversationParticipants.userId, req.token.id),
								),
							);
						if (loggedInUserConv.length > 0) {
							conversationId = conv.conversationId;
							break;
						}
					}
				}

				return {
					...user,
					conversationId,
				};
			}),
		);

		return res
			.status(200)
			.json({ data: result, message: "Successfully retrieved" });
	};
}
