import { Router } from "express";
import { UsersController } from "../controllers/users.controller";
import { verifyAuthToken } from "../middlewares/verifyAuth";

const router: Router = Router();

export const createUserRoutes = (userController: UsersController) => {
	router.get("/", verifyAuthToken, userController.getUsers);

	return router;
};
