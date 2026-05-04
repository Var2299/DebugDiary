import mongoose, { Schema, Document, Model } from "mongoose";

export type BugStatus = "solved" | "investigating";

export interface IBugEntry extends Document {
  _id: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  userId: string;
  errorText: string;
  aiFixMarkdown: string;
  status: BugStatus;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const BugEntrySchema = new Schema<IBugEntry>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    errorText: {
      type: String,
      required: true,
    },
    aiFixMarkdown: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["solved", "investigating"],
      default: "investigating",
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Text index for full-text search across error and fix content
BugEntrySchema.index({ errorText: "text", aiFixMarkdown: "text" });

const BugEntry: Model<IBugEntry> =
  mongoose.models.BugEntry ||
  mongoose.model<IBugEntry>("BugEntry", BugEntrySchema);

export default BugEntry;
