import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import express, { type Express } from "express";

import { AuthController } from "./controllers/auth.controller";
import { ChatController } from "./controllers/chat.controller";
import { UsersController } from "./controllers/users.controller";
import { createAuthRoutes } from "./routes/auth.routes";
import { createChatRoutes } from "./routes/chat.routes";
import { createUserRoutes } from "./routes/user.routes";

const app: Express = express();

export const db = drizzle(process.env.DATABASE_URL!);

app.use(express.json());

const authController = new AuthController(db);
const chatController = new ChatController(db);
const usersController = new UsersController(db);

app.use("/api/v1/auth", createAuthRoutes(authController));
app.use("/api/v1/chats", createChatRoutes(chatController));
app.use("/api/v1/users", createUserRoutes(usersController));

export default app;
