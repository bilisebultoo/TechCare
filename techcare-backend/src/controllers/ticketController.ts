import { Response } from "express";
import mongoose from "mongoose";
import Ticket from "../models/Ticket";
import { AuthRequest } from "../middleware/authMiddleware";

const closeCustomerConfirmedTickets = async (agentId: string): Promise<void> => {
  await Ticket.updateMany(
    {
      agentId,
      customerConfirmed: true,
      status: { $ne: "CLOSED" },
    },
    { $set: { status: "CLOSED" } }
  );
};

export const getAllTickets = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const tickets = await Ticket.find()
      .populate("customerId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: tickets.length,
      tickets: tickets.map((ticket) => {
        const item = ticket.toObject();
        return {
          ...item,
          customer: item.customerId,
        };
      }),
    });
  } catch (error) {
    console.error("Get all tickets error:", error);
    res.status(500).json({
      message: "Server error while getting tickets.",
    });
  }
};

export const getMyTickets = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }

    await closeCustomerConfirmedTickets(req.user.id);
    const tickets = await Ticket.find({ agentId: req.user.id })
      .populate("customerId", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: tickets.length,
      tickets: tickets.map((ticket) => {
        const item = ticket.toObject();
        return { ...item, customer: item.customerId };
      }),
    });
  } catch (error) {
    console.error("Get assigned tickets error:", error);
    res.status(500).json({
      message: "Server error while getting assigned tickets.",
    });
  }
};

export const getMyTicketById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "Invalid ticket ID." });
      return;
    }

    if (req.user.role !== "AGENT" && req.user.role !== "CUSTOMER") {
      res.status(403).json({ message: "Access denied. You do not have permission." });
      return;
    }

    if (req.user.role === "AGENT") {
      await closeCustomerConfirmedTickets(req.user.id);
    }

    const ownershipField = req.user.role === "AGENT" ? "agentId" : "customerId";
    const ticket = await Ticket.findOne({
      _id: req.params.id,
      [ownershipField]: req.user.id,
    })
      .populate("customerId", "name email phone")
      .populate("agentId", "name email");

    if (!ticket) {
      res.status(404).json({ message: "Ticket not found." });
      return;
    }

    const item = ticket.toObject();
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({
      ticket: {
        ...item,
        customer: item.customerId,
        agent: item.agentId,
      },
    });
  } catch (error) {
    console.error("Get assigned ticket error:", error);
    res.status(500).json({
      message: "Server error while getting assigned ticket.",
    });
  }
};

export const updateMyTicketStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }

    const { status } = req.body;
    if (!["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].includes(status)) {
      res.status(400).json({ message: "Status must be OPEN, IN_PROGRESS, RESOLVED or CLOSED." });
      return;
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "Invalid ticket ID." });
      return;
    }

    const ticket = await Ticket.findOneAndUpdate(
      {
        _id: req.params.id,
        agentId: req.user.id,
        ...(status === "CLOSED" ? { customerConfirmed: true } : {}),
      },
      { status },
      { new: true, runValidators: true }
    ).populate("customerId", "name email phone");

    if (!ticket) {
      const assignedTicket = await Ticket.findOne({
        _id: req.params.id,
        agentId: req.user.id,
      }).select("customerConfirmed");

      if (status === "CLOSED" && assignedTicket && !assignedTicket.customerConfirmed) {
        res.status(400).json({
          message: "The customer must confirm the problem is solved before this ticket can be closed.",
        });
        return;
      }

      res.status(404).json({ message: "Assigned ticket not found." });
      return;
    }

    const item = ticket.toObject();
    res.status(200).json({
      message: "Ticket status updated.",
      ticket: { ...item, customer: item.customerId },
    });
  } catch (error) {
    console.error("Update assigned ticket status error:", error);
    res.status(500).json({
      message: "Server error while updating ticket status.",
    });
  }
};

export const confirmTicketSolved = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "Invalid ticket ID." });
      return;
    }

    const ticket = await Ticket.findOneAndUpdate(
      { _id: req.params.id, customerId: req.user.id },
      {
        customerConfirmed: true,
        customerConfirmedAt: new Date(),
        status: "CLOSED",
      },
      { new: true, runValidators: true }
    );

    if (!ticket) {
      res.status(404).json({ message: "Ticket not found." });
      return;
    }

    res.status(200).json({
      message: "Problem confirmed as solved and ticket closed.",
      ticket,
    });
  } catch (error) {
    console.error("Confirm ticket solved error:", error);
    res.status(500).json({
      message: "Server error while confirming the ticket is solved.",
    });
  }
};

export const addTicketMessage = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "Invalid ticket ID." });
      return;
    }

    if (req.user.role !== "AGENT" && req.user.role !== "CUSTOMER") {
      res.status(403).json({ message: "Access denied. You do not have permission." });
      return;
    }

    const rawMessage = typeof req.body?.message === "string" ? req.body.message.trim() : "";
    if (!rawMessage || rawMessage.length > 5000) {
      res.status(400).json({
        message: "Message must contain between 1 and 5000 characters.",
      });
      return;
    }

    const ownershipField = req.user.role === "AGENT" ? "agentId" : "customerId";
    const sender = req.user.role === "CUSTOMER" ? "CUSTOMER" : "AGENT";
    const ticket = await Ticket.findOneAndUpdate(
      {
        _id: req.params.id,
        [ownershipField]: req.user.id,
        status: { $ne: "CLOSED" },
      },
      {
        $push: {
          messages: {
            sender,
            message: rawMessage,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    ).select("messages");

    if (!ticket) {
      const assignedTicket = await Ticket.findOne({
        _id: req.params.id,
        [ownershipField]: req.user.id,
      }).select("status");
      if (assignedTicket?.status === "CLOSED") {
        res.status(409).json({ message: "This ticket is closed and its conversation is read-only." });
        return;
      }

      res.status(404).json({ message: "Ticket not found." });
      return;
    }

    const item = ticket.toObject();
    res.status(201).json({
      message: "Ticket message added.",
      newMessage: item.messages[item.messages.length - 1],
    });
  } catch (error) {
    console.error("Add ticket message error:", error);
    res.status(500).json({
      message: "Server error while adding ticket message.",
    });
  }
};
