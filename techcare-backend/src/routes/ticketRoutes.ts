import { Router } from "express";
import {
  addTicketMessage,
  confirmTicketSolved,
  getAllTickets,
  getInternalTicketAttachment,
  getInternalTicketMessages,
  getMyTicketById,
  getMyTickets,
  addInternalTicketMessage,
  updateMyTicketStatus,
} from "../controllers/ticketController";
import { authMiddleware } from "../middleware/authMiddleware";
import { uploadInternalChatAttachments } from "../middleware/problemReportUpload";
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

router.get(
  "/:id/internal-messages/:messageId/attachments/:attachmentId",
  authMiddleware,
  getInternalTicketAttachment
);

router.get(
  "/:id/internal-messages",
  authMiddleware,
  getInternalTicketMessages
);

router.post(
  "/:id/internal-messages",
  authMiddleware,
  uploadInternalChatAttachments,
  addInternalTicketMessage
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
