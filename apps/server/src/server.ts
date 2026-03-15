import { and, desc, eq, inArray, sql } from "drizzle-orm";
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
	console.log(`[SOCKET] User connected: userId=${userId}`);

	socket.join(`user_${userId}`);

	socket.on("send_message", async (data) => {
		console.log(
			`[MESSAGE] userId=${userId} sent message to conversationId=${data.conversationId}: ${data.message}`,
		);

		const { conversationId, message } = data;

		// Check if conversation id and message are provided.
		if (!conversationId || !message) {
			console.log(
				`[ERROR] Missing conversationId or message in send_message event`,
			);
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

		await db
			.update(conversations)
			.set({
				lastMessageId: newMessage[0].messageId,
			})
			.where(eq(conversations.id, Number(conversationId)));

		const participants = await db
			.select({
				id: conversationParticipants.userId,
			})
			.from(conversationParticipants)
			.where(eq(conversationParticipants.conversationId, conversationId));

		const mappedParticipants = participants.map((p) => p.id);

		// Fetch latest 20 messages for the conversation, ordered by descending message ID
		const latestMessages = await db
			.select({
				messageId: messages.id,
				conversationId: messages.conversationId,
				content: messages.content,
				senderId: messages.senderId,
				senderName: users.name,
			})
			.from(messages)
			.innerJoin(users, eq(users.id, messages.senderId))
			.where(and(eq(messages.conversationId, Number(conversationId))))
			.orderBy(desc(messages.id))
			.limit(20);

		mappedParticipants.forEach((participantId) => {
			if (participantId !== Number(userId)) {
				io.to(`user_${participantId}`).emit("chat_list_update", {
					conversationId,
				});
				console.log(
					`[CHAT_LIST_UPDATE] Notified userId=${participantId} about conversationId=${conversationId}`,
				);
			}
		});
		// Notify all users joined in this conversation ID.
		io.to(data.conversationId).emit("receive_message", {
			messages: latestMessages,
			nextCursor: latestMessages.length
				? latestMessages[latestMessages.length - 1].messageId
				: null,
		});

		console.log(
			`[RECEIVE_MESSAGE] Emitted to conversationId=${data.conversationId}`,
		);
	});

	socket.on("join_conversation", async (data) => {
		// Check if conversation exists
		const [conversation] = await db
			.select({ id: conversations.id })
			.from(conversations)
			.where(eq(conversations.id, data.conversationId));

		if (!conversation?.id) {
			console.log(
				`[ERROR] Conversation does not exist: conversationId=${data.conversationId}`,
			);
			return;
		}

		console.log(
			`[JOIN_CONVERSATION] userId=${userId} joined conversationId=${data.conversationId}`,
		);
		socket.join(data.conversationId);
	});

	socket.on("create_conversation", async (data) => {
		const participantIds = Array.isArray(data.participantIds)
			? data.participantIds
			: [data.participantIds];

		const creatorId = Number(data.creatorId);

		if (!creatorId || !participantIds.length) {
			console.log(
				`[ERROR] Missing creatorId or participantIds in create_conversation event`,
			);
			return;
		}

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
			console.log(
				`[CONVERSATION] Already exists: conversationId=${conversationId}`,
			);
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

			console.log(
				`[CONVERSATION] New conversation created: conversationId=${conversationId}, participants=${allParticipantIds.join(",")}`,
			);
		}

		// Join socket room
		socket.join(`cv_${conversationId}`);

		socket.emit("conversation_created", { conversationId });

		// Notify participants
		allParticipantIds.forEach((userId) => {
			io.to(`user_${userId}`).emit("new_conversation", {
				conversationId,
			});
			console.log(
				`[NEW_CONVERSATION] Notified userId=${userId} about conversationId=${conversationId}`,
			);
		});
	});

	socket.on("new_conversation", async (data) => {
		console.log(`[NEW_CONVERSATION] Received event:`, data);
	});

	// Events for typing indicator
	socket.on("start_typing", (data) => {
		socket.to(data.conversationId).emit("start_typing");
		console.log(
			`[TYPING] userId=${userId} started typing in conversationId=${data.conversationId}`,
		);
	});

	socket.on("end_typing", (data) => {
		socket.to(data.conversationId).emit("end_typing");
		console.log(
			`[TYPING] userId=${userId} ended typing in conversationId=${data.conversationId}`,
		);
	});
});

httpServer.listen(PORT, () => {
	console.log(`[SERVER] Running on port ${PORT}`);
});
