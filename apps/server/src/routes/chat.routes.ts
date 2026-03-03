import { Router } from "express";
import { ChatController } from "../controllers/chat.controller";
import { verifyAuthToken } from "../middlewares/verifyAuth";

const router: Router = Router();

export const createChatRoutes = (chatController: ChatController) => {
	router.get("/", verifyAuthToken, chatController.getChats);

	router.get(
		"/messages/:conversationId",
		verifyAuthToken,
		chatController.getChatMessagesByConversationId,
	);

	return router;
};
