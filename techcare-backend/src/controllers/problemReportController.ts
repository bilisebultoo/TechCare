import { Request, Response } from "express";
import mongoose from "mongoose";
import { basename, resolve } from "path";
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
    const uploadedFiles = Array.isArray(req.files) ? req.files : [];

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
      attachments: uploadedFiles.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      })),
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
    const tickets = await Ticket.find({
      sourceReportId: { $in: reports.map((report) => report._id) },
    })
      .select("sourceReportId priority status")
      .lean();
    const ticketByReportId = new Map(
      tickets.map((ticket) => [
        String(ticket.sourceReportId),
        { priority: ticket.priority, status: ticket.status },
      ])
    );

    res.status(200).json({
      count: reports.length,
      problemReports: reports.map((report) => ({
        ...report.toObject(),
        ticketPriority: ticketByReportId.get(String(report._id))?.priority,
        ticketStatus: ticketByReportId.get(String(report._id))?.status,
      })),
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

    const ticket = await Ticket.findOne({ sourceReportId: report._id }).select(
      "_id agentId priority status"
    );
    const assignedAgent = ticket?.agentId
      ? await User.findById(ticket.agentId).select("name email specialization")
      : null;

    res.status(200).json({
      problemReport: {
        ...report.toObject(),
        ticketId: ticket?._id.toString(),
        ticketPriority: ticket?.priority,
        ticketStatus: ticket?.status,
        assignedAgent: assignedAgent
          ? {
              id: assignedAgent._id.toString(),
              name: assignedAgent.name,
              email: assignedAgent.email,
              specialization: assignedAgent.specialization,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Get problem report error:", error);

    res.status(500).json({
      message: "Server error while getting problem report.",
    });
  }
};

export const getProblemReportAttachment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || !["ADMIN", "AGENT"].includes(req.user.role)) {
      res.status(403).json({ message: "Access denied." });
      return;
    }
    if (
      !mongoose.isValidObjectId(req.params.id) ||
      !mongoose.isValidObjectId(req.params.attachmentId)
    ) {
      res.status(400).json({ message: "Invalid report or attachment ID." });
      return;
    }

    const report = await ProblemReport.findById(req.params.id).select(
      "attachments"
    );
    if (!report) {
      res.status(404).json({ message: "Problem report not found." });
      return;
    }

    const attachment = report.attachments.find(
      (item) => String(item._id) === req.params.attachmentId
    );
    if (!attachment || basename(attachment.filename) !== attachment.filename) {
      res.status(404).json({ message: "Attachment not found." });
      return;
    }

    if (req.user.role === "AGENT") {
      const assignedTicket = await Ticket.exists({
        sourceReportId: report._id,
        agentId: req.user.id,
      });
      if (!assignedTicket) {
        res.status(403).json({ message: "This report is not assigned to you." });
        return;
      }
    }

    const originalName = attachment.originalName.replace(/["\\\r\n]/g, "_");
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("Content-Type", attachment.mimeType);
    res.setHeader("Content-Disposition", `inline; filename="${originalName}"`);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.sendFile(
      resolve(__dirname, "../../uploads", attachment.filename),
      (error) => {
        if (error) {
          console.error("Serve problem report attachment error:", error);
          if (!res.headersSent) {
            const isMissing = "code" in error && error.code === "ENOENT";
            res.status(isMissing ? 404 : 500).json({
              message:
                isMissing
                  ? "Attachment file not found."
                  : "Unable to load the attachment.",
            });
          }
        }
      }
    );
  } catch (error) {
    console.error("Get problem report attachment error:", error);
    res.status(500).json({ message: "Unable to load the attachment." });
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
    const { agentId, priority } = req.body;

    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(agentId)) {
      res.status(400).json({ message: "A valid report and agent are required." });
      return;
    }
    if (!["LOW", "MEDIUM", "HIGH"].includes(priority)) {
      res.status(400).json({ message: "Select a valid ticket priority." });
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
      priority,
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
          specialization: agent.specialization,
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