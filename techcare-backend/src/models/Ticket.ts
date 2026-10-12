import mongoose, { Schema } from "mongoose";

interface ITicketMessage {
  sender: "CUSTOMER" | "AGENT";
  message: string;
  createdAt: Date;
}

interface IInternalTicketMessage {
  _id: mongoose.Types.ObjectId;
  sender: "ADMIN" | "AGENT";
  senderName: string;
  message: string;
  attachments: {
    _id: mongoose.Types.ObjectId;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
  }[];
  createdAt: Date;
}

interface ITicket {
  title: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  customerId: mongoose.Types.ObjectId;
  agentId?: mongoose.Types.ObjectId;
  sourceReportId?: mongoose.Types.ObjectId;
  deviceType?: string;
  brand?: string;
  model?: string;
  customerConfirmed: boolean;
  customerConfirmedAt?: Date;
  messages: ITicketMessage[];
  internalMessages: IInternalTicketMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const ticketMessageSchema = new Schema<ITicketMessage>(
  {
    sender: {
      type: String,
      enum: ["CUSTOMER", "AGENT"],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const internalTicketMessageSchema = new Schema<IInternalTicketMessage>(
  {
    sender: {
      type: String,
      enum: ["ADMIN", "AGENT"],
      required: true,
    },
    senderName: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      default: "",
    },
    attachments: {
      type: [
        new Schema(
          {
            filename: { type: String, required: true },
            originalName: { type: String, required: true },
            mimeType: { type: String, required: true },
            size: { type: Number, required: true },
          },
          { _id: true }
        ),
      ],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const ticketSchema = new Schema<ITicket>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"],
      default: "OPEN",
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    agentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    sourceReportId: {
      type: Schema.Types.ObjectId,
      ref: "ProblemReport",
      unique: true,
      sparse: true,
    },
    deviceType: {
      type: String,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    model: {
      type: String,
      trim: true,
    },
    customerConfirmed: {
      type: Boolean,
      default: false,
    },
    customerConfirmedAt: {
      type: Date,
    },
    messages: {
      type: [ticketMessageSchema],
      default: [],
    },
    internalMessages: {
      type: [internalTicketMessageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Ticket = mongoose.model<ITicket>("Ticket", ticketSchema);

export default Ticket;
