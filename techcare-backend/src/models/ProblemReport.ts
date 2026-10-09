import mongoose, { Schema } from "mongoose";

interface IProblemReport {
  customerId: mongoose.Types.ObjectId;

  deviceType: string;
  brand?: string;
  model?: string;
  serialNumber: string;

  problem: string;
  description: string;

  status: "PENDING" | "REVIEWED" | "CONVERTED";

  createdAt: Date;
  updatedAt: Date;
}

const problemReportSchema = new Schema<IProblemReport>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    deviceType: {
      type: String,
      required: true,
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

    serialNumber: {
      type: String,
      required: true,
      trim: true,
    },

    problem: {
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
      enum: ["PENDING", "REVIEWED", "CONVERTED"],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

const ProblemReport = mongoose.model<IProblemReport>(
  "ProblemReport",
  problemReportSchema
);

export default ProblemReport;