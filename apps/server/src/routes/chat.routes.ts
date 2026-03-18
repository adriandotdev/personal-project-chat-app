import { Router } from "express";
import { ChatController } from "../controllers/chat.controller";
import { validateBody } from "../middlewares/validateBodyMiddleware";
import { verifyAuthToken } from "../middlewares/verifyAuth";
import { DeleteConversationByIdSchema } from "../validators/chats";

const router: Router = Router();

export const createChatRoutes = (chatController: ChatController) => {
	router.get("/", verifyAuthToken, chatController.getChats);

	router.get(
		"/messages/:conversationId",
		verifyAuthToken,
		chatController.getChatMessagesByConversationId,
	);

	router.delete(
		"/",
		verifyAuthToken,
		validateBody(DeleteConversationByIdSchema),
		chatController.deleteChatByConversationId,
	);
	return router;
};
