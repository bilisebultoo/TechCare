import { Router } from "express";

import {
  register,
  createAgent,
  createCustomer,
  changePassword,
  getActiveAgents,
  login,
  getMe,
  updateAgentSpecialization,
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

router.post(
  "/customers",
  authMiddleware,
  roleMiddleware("ADMIN"),
  createCustomer
);

router.post(
  "/change-password",
  authMiddleware,
  changePassword
);

router.post("/login", login);

router.get("/me", authMiddleware, getMe);

router.put(
  "/specialization",
  authMiddleware,
  roleMiddleware("AGENT"),
  updateAgentSpecialization
);

export default router;