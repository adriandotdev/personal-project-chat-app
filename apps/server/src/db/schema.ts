import {
	boolean,
	integer,
	pgTable,
	primaryKey,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	name: varchar("name").notNull(),
	username: varchar().unique().notNull(),
	email: varchar(),
	mobileNumber: varchar(),
	password: varchar().notNull(),
	createdAt: timestamp().defaultNow().notNull(),
});

export const conversations = pgTable("conversations", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	isGroup: boolean("is_group").default(false),
	name: varchar().default(""),
	createdAt: timestamp("created_at").defaultNow(),
	lastMessageId: integer(),
});

export const conversationParticipants = pgTable(
	"conversation_participants",
	{
		conversationId: integer("conversation_id")
			.notNull()
			.references(() => conversations.id, { onDelete: "cascade" }),
		userId: integer("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		joinedAt: timestamp("joined_at").defaultNow(),
	},
	(table) => [
		primaryKey({
			columns: [table.conversationId, table.userId],
		}),
	],
);

export const messages = pgTable("messages", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	conversationId: integer("conversation_id")
		.notNull()
		.references(() => conversations.id, { onDelete: "cascade" }),
	senderId: integer("sender_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	content: text(),
	createdAt: timestamp("created_at").defaultNow(),
});
