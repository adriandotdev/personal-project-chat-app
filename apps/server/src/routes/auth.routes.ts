import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validateBody } from "../middlewares/validateBodyMiddleware";
import { loginSchema, refreshSchema, signUpSchema } from "../validators/users";

const router: Router = Router();

export const createAuthRoutes = (authController: AuthController) => {
	router.post("/login", validateBody(loginSchema), authController.login);

	router.post("/signup", validateBody(signUpSchema), authController.signUp);

	router.post("/refresh", validateBody(refreshSchema), authController.refresh);

	return router;
};
