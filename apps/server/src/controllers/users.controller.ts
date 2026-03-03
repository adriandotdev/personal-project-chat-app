import { eq, not } from "drizzle-orm";
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
		console.log(req.token);
		const userList = await this.db
			.select({
				name: users.name,
				username: users.username,
				id: users.id,
				conversationId: conversationParticipants.conversationId,
			})
			.from(users)
			.leftJoin(
				conversationParticipants,
				eq(users.id, conversationParticipants.userId),
			)
			.where(not(eq(users.id, req.token.id)));

		return res
			.status(200)
			.json({ data: userList, message: "Successfully retrieved" });
	};
}
