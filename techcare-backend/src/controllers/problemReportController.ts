import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import ProblemReport from "../models/ProblemReport";


// ==========================================
// CREATE PROBLEM REPORT
// CUSTOMER
// ==========================================

export const createProblemReport = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        message: "Authentication required.",
      });
      return;
    }

    const {
      deviceType,
      brand,
      model,
      serialNumber,
      problem,
      description,
    } = req.body;

    // Required fields
    if (
      !deviceType ||
      !serialNumber ||
      !problem ||
      !description
    ) {
      res.status(400).json({
        message:
          "Device type, serial number, problem and description are required.",
      });
      return;
    }

    const problemReport = await ProblemReport.create({
      customerId: req.user.id,
      deviceType,
      brand,
      model,
      serialNumber,
      problem,
      description,
      status: "PENDING",
    });

    res.status(201).json({
      message: "Problem report submitted successfully.",
      problemReport,
    });
  } catch (error) {
    console.error("Create problem report error:", error);

    res.status(500).json({
      message: "Server error while creating problem report.",
    });
  }
};


// ==========================================
// GET MY PROBLEM REPORTS
// CUSTOMER
// ==========================================

export const getMyProblemReports = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        message: "Authentication required.",
      });
      return;
    }

    const reports = await ProblemReport.find({
      customerId: req.user.id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      count: reports.length,
      problemReports: reports,
    });
  } catch (error) {
    console.error("Get my problem reports error:", error);

    res.status(500).json({
      message: "Server error while getting problem reports.",
    });
  }
};


// ==========================================
// GET ALL PROBLEM REPORTS
// ADMIN
// ==========================================

export const getAllProblemReports = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const reports = await ProblemReport.find()
      .populate(
        "customerId",
        "name email phone"
      )
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      count: reports.length,
      problemReports: reports,
    });
  } catch (error) {
    console.error("Get all problem reports error:", error);

    res.status(500).json({
      message: "Server error while getting problem reports.",
    });
  }
};


// ==========================================
// GET ONE PROBLEM REPORT
// ==========================================

export const getProblemReportById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const report = await ProblemReport.findById(id).populate(
      "customerId",
      "name email phone"
    );

    if (!report) {
      res.status(404).json({
        message: "Problem report not found.",
      });
      return;
    }

    res.status(200).json({
      problemReport: report,
    });
  } catch (error) {
    console.error("Get problem report error:", error);

    res.status(500).json({
      message: "Server error while getting problem report.",
    });
  }
};


// ==========================================
// UPDATE PROBLEM REPORT STATUS
// ADMIN
// ==========================================

export const updateProblemReportStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "PENDING",
      "REVIEWED",
      "CONVERTED",
    ];

    if (!allowedStatuses.includes(status)) {
      res.status(400).json({
        message:
          "Invalid status. Use PENDING, REVIEWED or CONVERTED.",
      });
      return;
    }

    const report = await ProblemReport.findByIdAndUpdate(
      id,
      {
        status,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!report) {
      res.status(404).json({
        message: "Problem report not found.",
      });
      return;
    }

    res.status(200).json({
      message: "Problem report status updated successfully.",
      problemReport: report,
    });
  } catch (error) {
    console.error(
      "Update problem report status error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while updating problem report status.",
    });
  }
};