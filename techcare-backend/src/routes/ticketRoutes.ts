import { Router } from "express";
import {
  addTicketMessage,
  confirmTicketSolved,
  getAllTickets,
  getMyTicketById,
  getMyTickets,
  updateMyTicketStatus,
} from "../controllers/ticketController";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";

const router = Router();

router.get(
  "/mine",
  authMiddleware,
  roleMiddleware("AGENT"),
  getMyTickets
);

router.post(
  "/:id/messages",
  authMiddleware,
  addTicketMessage
);

router.post(
  "/:id/confirmation",
  authMiddleware,
  roleMiddleware("CUSTOMER"),
  confirmTicketSolved
);

router.get(
  "/:id",
  authMiddleware,
  getMyTicketById
);

router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("AGENT"),
  updateMyTicketStatus
);

router.get(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN"),
  getAllTickets
);

export default router;
