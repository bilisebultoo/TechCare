import { Request, Response } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/authMiddleware";
import ProblemReport from "../models/ProblemReport";
import Ticket from "../models/Ticket";
import User from "../models/User";


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

    const tickets = await Ticket.find({
      sourceReportId: { $in: reports.map((report) => report._id) },
      customerId: req.user.id,
    })
      .select("_id sourceReportId")
      .lean();
    const ticketIdByReportId = new Map(
      tickets.map((ticket) => [String(ticket.sourceReportId), String(ticket._id)])
    );

    res.status(200).json({
      count: reports.length,
      problemReports: reports.map((report) => ({
        ...report.toObject(),
        ticketId: ticketIdByReportId.get(String(report._id)),
      })),
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

    const allowedStatuses = ["PENDING", "REVIEWED"];

    if (!allowedStatuses.includes(status)) {
      res.status(400).json({
        message: "Invalid status. Reports can be marked PENDING or REVIEWED; assign the report to create a ticket.",
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

export const assignProblemReport = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;

    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(agentId)) {
      res.status(400).json({ message: "A valid report and agent are required." });
      return;
    }

    const report = await ProblemReport.findById(id);
    if (!report) {
      res.status(404).json({ message: "Problem report not found." });
      return;
    }

    const existingTicket = await Ticket.findOne({ sourceReportId: report._id });
    if (existingTicket) {
      res.status(409).json({
        message: "This problem report has already been converted into a ticket.",
      });
      return;
    }

    const agent = await User.findOne({
      _id: agentId,
      role: "AGENT",
      isActive: true,
    });
    if (!agent) {
      res.status(400).json({ message: "Select an active support agent." });
      return;
    }

    const ticket = await Ticket.create({
      title: report.problem,
      description: report.description,
      status: "OPEN",
      priority: "MEDIUM",
      customerId: report.customerId,
      agentId: agent._id,
      sourceReportId: report._id,
      deviceType: report.deviceType,
      brand: report.brand,
      model: report.model,
    });

    report.status = "CONVERTED";
    await report.save();

    res.status(201).json({
      message: "Problem report assigned and converted to a ticket.",
      ticket: {
        ...ticket.toObject(),
        agent: {
          id: agent._id,
          name: agent.name,
          email: agent.email,
        },
      },
      problemReport: report,
    });
  } catch (error) {
    if (
      error instanceof mongoose.mongo.MongoServerError &&
      error.code === 11000
    ) {
      res.status(409).json({
        message: "This problem report has already been assigned.",
      });
      return;
    }

    console.error("Assign problem report error:", error);
    res.status(500).json({
      message: "Server error while assigning problem report.",
    });
  }
};