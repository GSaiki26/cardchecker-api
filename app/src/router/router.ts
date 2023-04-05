// Libs
import { Request, Response, Router } from "express";

import AuthMiddleware from "@middlewares/authMiddleware";
import CheckController from "@controllers/checkController";

// Data
const router = Router();
router.use(AuthMiddleware.auth);

// Routes
router.post("/check", CheckController.post.bind(CheckController));
router.get("/check/:cardId", CheckController.get.bind(CheckController));
router.delete("/check", CheckController.delete.bind(CheckController));

router.all("*", (req: Request, res: Response) => {
  req.logger.info("Route not found. Returning...");
  res.sendStatus(304);
});

// Code
export default router;
