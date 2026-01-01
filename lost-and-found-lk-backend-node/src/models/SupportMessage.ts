import mongoose, { Schema, Document } from "mongoose";

export type SupportStatus = "new" | "replied" | "closed";

export interface ISupportMessage extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  status: SupportStatus;
  createdAt: Date;
  updatedAt: Date;
}

const supportMessageSchema = new Schema<ISupportMessage>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["new", "replied", "closed"],
      default: "new",
    },
  },
  { timestamps: true }
);

export const SupportMessage = mongoose.model<ISupportMessage>(
  "SupportMessage",
  supportMessageSchema
);

