import mongoose, { Schema } from "mongoose";

interface IProblemReportAttachment {
  _id?: mongoose.Types.ObjectId;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
}

interface IProblemReport {
  customerId: mongoose.Types.ObjectId;

  deviceType: string;
  brand?: string;
  model?: string;
  serialNumber: string;

  problem: string;
  description: string;
  attachments: IProblemReportAttachment[];

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

    attachments: {
      type: [
        new Schema<IProblemReportAttachment>(
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