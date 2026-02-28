import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Pool } from "pg";
import { users } from "../db/schema";

export class AuthController {
	constructor(
		private db: NodePgDatabase<Record<string, never>> & {
			$client: Pool;
		},
	) {}
	signUp = async (req: Request, res: Response) => {
		const { name, username, password } = req.body;

		const existing = await this.db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.username, username));

		if (existing.length)
			return res.status(400).json({
				message: "Username exists",
			});

		const hashedPassword = await bcrypt.hash(password, 12);

		await this.db.insert(users).values({
			name,
			username,
			password: hashedPassword,
		});

		return res.status(201).json({
			message: "Successfully registered",
		});
	};

	login = async (req: Request, res: Response) => {
		const { username, password } = req.body;

		const [user] = await this.db
			.select({
				id: users.id,
				username: users.username,
				password: users.password,
			})
			.from(users)
			.where(eq(users.username, username));

		if (!user)
			return res.status(401).json({
				message: "Invalid credentials",
			});

		const isPasswordMatch = await bcrypt.compare(password, user.password);

		if (!isPasswordMatch)
			return res.status(401).json({
				message: "Invaid credentials",
			});

		const accessToken = jwt.sign(
			{
				id: user.id,
			},
			process.env.JWT_SECRET ?? "",
			{
				expiresIn: "1h",
				issuer: process.env.JWT_ISSUER,
				audience: process.env.JWT_AUDIENCE,
				subject: user.username,
			},
		);

		return res.status(200).json({
			userId: user.id,
			accessToken,
		});
	};
}
