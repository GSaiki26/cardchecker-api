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
router.delete("/check/:checkId", CheckController.delete.bind(CheckController));

router.get("/", (req: Request, res: Response) => {
  req.logger.info("Returning...");
  res.sendStatus(200);
});

router.all("*", (req: Request, res: Response) => {
  req.logger.info("Route not found. Returning...");
  res.sendStatus(404);
});

// Code
export default router;
