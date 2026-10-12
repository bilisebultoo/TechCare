import { Router } from "express";

import {
  createProblemReport,
  getMyProblemReports,
  getAllProblemReports,
  getProblemReportById,
  getProblemReportAttachment,
  updateProblemReportStatus,
  assignProblemReport,
} from "../controllers/problemReportController";

import { authMiddleware } from "../middleware/authMiddleware";
import { uploadProblemReportAttachments } from "../middleware/problemReportUpload";
import { roleMiddleware } from "../middleware/roleMiddleware";

const router = Router();


// ==========================================
// CUSTOMER
// ==========================================

// Customer submits a problem report
router.post(
  "/",
  authMiddleware,
  roleMiddleware("CUSTOMER"),
  uploadProblemReportAttachments,
  createProblemReport
);

// Customer sees their own reports
router.get(
  "/my",
  authMiddleware,
  roleMiddleware("CUSTOMER"),
  getMyProblemReports
);


// ==========================================
// ADMIN
// ==========================================

// Admin sees all problem reports
router.get(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN"),
  getAllProblemReports
);

// Admin sees one problem report
router.get(
  "/:id/attachments/:attachmentId",
  authMiddleware,
  getProblemReportAttachment
);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  getProblemReportById
);

// Admin updates report status
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("ADMIN"),
  updateProblemReportStatus
);

router.post(
  "/:id/assign",
  authMiddleware,
  roleMiddleware("ADMIN"),
  assignProblemReport
);


export default router;