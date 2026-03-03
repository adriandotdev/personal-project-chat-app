import { asc, eq, inArray, sql } from "drizzle-orm";
import { createServer } from "http";
import { Server } from "socket.io";
import app, { db } from "./app";
import {
	conversationParticipants,
	conversations,
	messages,
	users,
} from "./db/schema";
const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);

const io = new Server(httpServer, {});

io.on("connection", (socket) => {
	const userId = socket.handshake.query.userId;
	console.log("SOCKET: ", userId);

	socket.join(`user_${userId}`);

	socket.on("send_message", async (data) => {
		console.log(`MESSAGE: ${data.message}`);

		const { conversationId, message } = data;

		// Check if conversation id and message are provided.
		if (!conversationId || !message) {
			console.log("Conversation ID and message are required");
			return;
		}

		// Create new message
		const newMessage = await db
			.insert(messages)
			.values({
				conversationId: Number(conversationId),
				senderId: Number(userId),
				content: message,
			})
			.returning({
				messageId: messages.id,
			});

		await db.update(conversations).set({
			lastMessageId: newMessage[0].messageId,
		});

		const result = await db
			.select({
				conversationId: conversations.id,
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
			.where(eq(conversationParticipants.userId, Number(userId)))
			.orderBy(asc(messages.createdAt));

		// Notify all users joined in this conversation ID.
		io.to(data.conversationId).emit("receive_message", result);
	});

	socket.on("join_conversation", async (data) => {
		// Check if conversation exists
		const [conversation] = await db
			.select({ id: conversations.id })
			.from(conversations)
			.where(eq(conversations.id, data.conversationId));

		if (!conversation?.id) {
			console.log("Conversation does not exists");
			return;
		}

		console.log(`Joined to conversation: ${data.conversationId}`);
		socket.join(data.conversationId);
	});

	socket.on("create_conversation", async (data) => {
		const participantIds = Array.isArray(data.participantIds)
			? data.participantIds
			: [data.participantIds];

		const creatorId = Number(socket.handshake.query.userId);

		if (!creatorId || !participantIds.length) return;

		// Include creator in participant list (important for DM)
		const allParticipantIds = Array.from(
			new Set([creatorId, ...participantIds]),
		);

		// Find existing conversation (DM uniqueness check)
		const existing = await db
			.select({
				conversationId: conversationParticipants.conversationId,
			})
			.from(conversationParticipants)
			.where(inArray(conversationParticipants.userId, allParticipantIds))
			.groupBy(conversationParticipants.conversationId)
			.having(
				sql`count(distinct ${conversationParticipants.userId}) = ${allParticipantIds.length}`,
			);

		let conversationId: number;

		if (existing.length) {
			conversationId = existing[0].conversationId;
			console.log("Conversation already exists");
		} else {
			// Conversation creation
			const [conversation] = await db
				.insert(conversations)
				.values({
					isGroup: false,
				})
				.returning({ id: conversations.id });

			conversationId = conversation.id;

			// Insert participants
			await db.insert(conversationParticipants).values(
				allParticipantIds.map((userId) => ({
					conversationId,
					userId,
				})),
			);

			console.log("New conversation created");
		}

		// Join socket room
		socket.join(`cv_${conversationId}`);

		// Notify participants
		allParticipantIds.forEach((userId) => {
			io.to(`user_${userId}`).emit("new_conversation", {
				conversationId,
			});
		});
	});

	socket.on("new_conversation", async (data) => {
		console.log("NEW CONVERSATION: ", data);
	});

	// Events for typing indicator
	socket.on("start_typing", (data) => {
		socket.to(data.conversationId).emit("start_typing");
	});

	socket.on("end_typing", (data) => {
		socket.to(data.conversationId).emit("end_typing");
	});
});

httpServer.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
