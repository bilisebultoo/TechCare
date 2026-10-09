import { Router } from "express";

import {
  createProblemReport,
  getMyProblemReports,
  getAllProblemReports,
  getProblemReportById,
  updateProblemReportStatus,
} from "../controllers/problemReportController";

import { authMiddleware } from "../middleware/authMiddleware";
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


export default router;