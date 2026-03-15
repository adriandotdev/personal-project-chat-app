import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Request, Response } from "express";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { Pool } from "pg";
import { users } from "../db/schema";

export class AuthController {
	constructor(
		private db: NodePgDatabase<Record<string, never>> & {
			$client: Pool;
		},
	) {}
	signUp = async (req: Request, res: Response) => {
		const { name, username, password, email } = req.body;

		const [usernameExists] = await this.db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.username, username));

		if (usernameExists)
			return res.status(400).json({
				message: "Username exists",
			});

		const [emailExists] = await this.db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.email, email));

		if (emailExists)
			return res.status(400).json({
				message: "Email exists",
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
				message: "Invalid credentials",
			});

		const accessToken = jwt.sign(
			{
				id: user.id,
			},
			process.env.JWT_SECRET ?? "",
			{
				expiresIn: "10s",
				issuer: process.env.JWT_ISSUER,
				audience: process.env.JWT_AUDIENCE,
				subject: user.username,
			},
		);

		const refreshToken = jwt.sign(
			{
				id: user.id,
			},
			process.env.JWT_REFRESH_SECRET ?? "",
			{
				expiresIn: "15s",
				issuer: process.env.JWT_ISSUER,
				audience: process.env.JWT_AUDIENCE,
				subject: user.username,
			},
		);

		return res.status(200).json({
			userId: user.id,
			accessToken,
			refreshToken,
		});
	};

	refresh = async (req: Request, res: Response) => {
		const { refreshToken } = req.body;

		try {
			jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET ?? "");

			const decoded: { id: number; sub: string } = jwt.decode(refreshToken) as {
				id: number;
				sub: string;
			};

			const accessToken = jwt.sign(
				{
					id: decoded.id,
				},
				process.env.JWT_SECRET ?? "",
				{
					expiresIn: "10s",
					issuer: process.env.JWT_ISSUER,
					audience: process.env.JWT_AUDIENCE,
					subject: decoded.sub,
				},
			);

			const newRefreshToken = jwt.sign(
				{
					id: decoded.id,
				},
				process.env.JWT_REFRESH_SECRET ?? "",
				{
					expiresIn: "15s",
					issuer: process.env.JWT_ISSUER,
					audience: process.env.JWT_AUDIENCE,
					subject: decoded.sub,
				},
			);

			return res.json({
				accessToken,
				refreshToken: newRefreshToken,
			});
		} catch (err) {
			if (err instanceof JsonWebTokenError) {
			}

			return res.json({ error: true });
		}
	};
}
