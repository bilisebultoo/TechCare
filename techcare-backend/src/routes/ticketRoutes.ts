import { Router } from "express";
import { getAllTickets } from "../controllers/ticketController";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";

const router = Router();

router.get(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN"),
  getAllTickets
);

export default router;
