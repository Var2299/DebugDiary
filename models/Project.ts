import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProject extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  userId: string;
  createdAt: Date;
  lastActiveAt: Date;
  bugCount: number;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
    bugCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: one project name per user
ProjectSchema.index({ name: 1, userId: 1 }, { unique: true });

const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);

export default Project;
