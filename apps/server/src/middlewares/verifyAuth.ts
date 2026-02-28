import { NextFunction, Request, Response } from "express";
import { decode, verify } from "jsonwebtoken";
import { Token } from "../types/express";

export function verifyAuthToken(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const token = req.headers["authorization"]?.split(" ")[1];

		if (!token) return res.status(401).json({ messages: "Unauthorized" });

		verify(token, process.env.JWT_SECRET!);

		const decodedData = decode(token) as Token;

		req.token = decodedData;

		next();
	} catch {
		return res.status(401).json({ message: "Unauthorized" });
	}
}
