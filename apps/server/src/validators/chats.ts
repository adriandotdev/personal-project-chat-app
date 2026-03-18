import z from "zod";

export const DeleteConversationByIdSchema = z.object({
	conversationId: z.number({ error: "Conversation ID is required" }),
	deleteBoth: z.boolean({ error: "Boolean value for deleteBoth is required" }),
});

export type DeleteConversationByIdSchema = z.infer<
	typeof DeleteConversationByIdSchema
>;
