import { Response } from "express";
import Ticket from "../models/Ticket";
import { AuthRequest } from "../middleware/authMiddleware";

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
