import { Router } from "express";

import {
  register,
  createAgent,
  getActiveAgents,
  login,
  getMe,
} from "../controllers/authController";

import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";

const router = Router();

router.post("/register", register);

router.get(
  "/agents",
  authMiddleware,
  roleMiddleware("ADMIN"),
  getActiveAgents
);

router.post(
  "/agents",
  authMiddleware,
  roleMiddleware("ADMIN"),
  createAgent
);

router.post("/login", login);

router.get("/me", authMiddleware, getMe);

export default router;